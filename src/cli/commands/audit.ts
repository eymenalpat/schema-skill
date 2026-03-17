import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import { createCrawler } from '../../crawler/index.js';
import { detectPageType } from '../../schema/typeDetector.js';
import { createVocabularyManager } from '../../schema/vocabularyManager.js';
import { auditSchema } from '../../ai/schemaGenerator.js';
import { parseCsvInput } from '../../input/csvParser.js';
import { validateCsvFile, validateUrl } from '../../input/validators.js';
import { generateMarkdownReport } from '../../reporter/markdownReport.js';
import { generateCsvReport } from '../../reporter/csvReport.js';
import { createCrawlQueue, createApiQueue } from '../../utils/rateLimiter.js';
import { createProgress } from '../../utils/progress.js';
import type { AuditResult, AuditSummary } from '../../types/report.js';

export function registerAuditCommand(program: Command): void {
  program
    .command('audit')
    .description('Audit Schema.org structured data for URLs listed in a CSV file')
    .argument('<csvFile>', 'Path to a CSV file containing URLs to audit')
    .option('-o, --output-dir <dir>', 'Output directory for reports', './audit-output')
    .option('-c, --concurrency <number>', 'Number of concurrent crawls', '2')
    .action(async (csvFile: string, options: { outputDir: string; concurrency: string }) => {
      try {
        // Step 1: Validate CSV file
        const csvValidation = validateCsvFile(csvFile);
        if (!csvValidation.valid) {
          console.error(chalk.red(csvValidation.error!));
          process.exit(1);
        }

        // Step 2: Parse CSV
        console.log(chalk.blue('Reading CSV file...'));
        const rows = await parseCsvInput(csvFile);
        console.log(chalk.green(`Found ${rows.length} URLs to audit.`));

        // Validate URLs
        const validRows = rows.filter((row) => {
          const result = validateUrl(row.url);
          if (!result.valid) {
            console.log(chalk.yellow(`  Skipping invalid URL: ${row.url} (${result.error})`));
            return false;
          }
          row.url = result.normalized;
          return true;
        });

        if (validRows.length === 0) {
          console.error(chalk.red('No valid URLs found in CSV file.'));
          process.exit(1);
        }

        // Step 3: Initialize vocabulary manager
        console.log(chalk.blue('Loading Schema.org vocabulary...'));
        const vocabManager = createVocabularyManager();
        await vocabManager.initialize();
        console.log(chalk.green('Vocabulary loaded.'));

        // Step 4: Ensure output directory exists
        await fs.mkdir(options.outputDir, { recursive: true });

        // Step 5: Initialize crawler and queues
        const concurrency = Math.max(1, parseInt(options.concurrency, 10) || 2);
        const crawlQueue = createCrawlQueue(concurrency, 1500);
        const apiQueue = createApiQueue(50);
        const progress = createProgress(validRows.length);
        const crawler = await createCrawler();

        const results: AuditResult[] = [];

        try {
          // Step 6: Process each URL
          const tasks = validRows.map((row) =>
            crawlQueue.add(async () => {
              const url = row.url;
              progress.update(`Auditing: ${url}`);

              try {
                // Crawl the page
                const crawlResult = await crawler.crawl(url);

                if (crawlResult.error) {
                  console.log(chalk.yellow(`  Warning: ${url} - ${crawlResult.error}`));
                  results.push({
                    url,
                    pageType: 'Error',
                    existingSchemas: [],
                    missingSchemas: [],
                    issues: [{
                      severity: 'error',
                      message: `Crawl failed: ${crawlResult.error}`,
                      recommendation: 'Check URL accessibility and try again.',
                    }],
                    suggestedSchema: null,
                    priority: 'high',
                    score: 0,
                  });
                  progress.increment();
                  return;
                }

                // Detect page type (use CSV hint if available)
                const detectedType = row.pageType ?? detectPageType(
                  crawlResult.pageContent,
                  crawlResult.existingSchemas,
                );

                // Get vocabulary info
                const recommendedProps = await vocabManager.getRecommendedProperties(detectedType);
                const vocabularyInfo = recommendedProps
                  .map((p) => `- ${p.name}: ${p.description} (types: ${p.rangeTypes.join(', ')})`)
                  .join('\n');

                // Audit via AI (rate-limited)
                const auditResult = await apiQueue.add(async () =>
                  auditSchema(
                    crawlResult.pageContent,
                    crawlResult.existingSchemas,
                    vocabularyInfo,
                  ),
                );

                if (auditResult) {
                  results.push(auditResult);
                }
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.log(chalk.yellow(`  Error auditing ${url}: ${errorMsg}`));
                results.push({
                  url,
                  pageType: 'Error',
                  existingSchemas: [],
                  missingSchemas: [],
                  issues: [{
                    severity: 'error',
                    message: errorMsg,
                    recommendation: 'Investigate the error and retry.',
                  }],
                  suggestedSchema: null,
                  priority: 'high',
                  score: 0,
                });
              }

              progress.increment();
            }),
          );

          await Promise.all(tasks);
        } finally {
          await crawler.close();
        }

        // Step 7: Calculate summary
        const summary: AuditSummary = {
          totalUrls: validRows.length,
          crawled: results.filter((r) => r.pageType !== 'Error').length,
          errors: results.filter((r) => r.pageType === 'Error').length,
          withSchema: results.filter((r) => r.existingSchemas.length > 0).length,
          withoutSchema: results.filter((r) => r.existingSchemas.length === 0 && r.pageType !== 'Error').length,
          averageScore: results.length > 0
            ? results.reduce((sum, r) => sum + r.score, 0) / results.length
            : 0,
          byPriority: {
            high: results.filter((r) => r.priority === 'high').length,
            medium: results.filter((r) => r.priority === 'medium').length,
            low: results.filter((r) => r.priority === 'low').length,
          },
        };

        // Step 8: Generate reports
        console.log(chalk.blue('\nGenerating reports...'));

        const markdownContent = generateMarkdownReport(results, summary);
        const reportPath = `${options.outputDir}/audit-report.md`;
        await fs.writeFile(reportPath, markdownContent, 'utf-8');

        const csvContent = await generateCsvReport(results);
        const csvOutputPath = `${options.outputDir}/audit-summary.csv`;
        await fs.writeFile(csvOutputPath, csvContent, 'utf-8');

        // Step 9: Print summary
        console.log(chalk.green('\nAudit complete!'));
        console.log(chalk.white(`  Total URLs: ${summary.totalUrls}`));
        console.log(chalk.white(`  Crawled: ${summary.crawled}`));
        console.log(chalk.white(`  Errors: ${summary.errors}`));
        console.log(chalk.white(`  With schema: ${summary.withSchema}`));
        console.log(chalk.white(`  Without schema: ${summary.withoutSchema}`));
        console.log(chalk.white(`  Average score: ${summary.averageScore.toFixed(1)}/100`));
        console.log(chalk.white(`  Priority: ${summary.byPriority.high} high, ${summary.byPriority.medium} medium, ${summary.byPriority.low} low`));
        console.log('');
        console.log(chalk.green(`  Markdown report: ${reportPath}`));
        console.log(chalk.green(`  CSV summary: ${csvOutputPath}`));
      } catch (error) {
        console.error(chalk.red('Audit failed.'));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });
}
