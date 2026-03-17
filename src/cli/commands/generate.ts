import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createCrawler } from '../../crawler/index.js';
import { detectPageTypeWithConfidence } from '../../schema/typeDetector.js';
import { createVocabularyManager } from '../../schema/vocabularyManager.js';
import { generateSchema } from '../../ai/schemaGenerator.js';
import { validateJsonLd } from '../../schema/validator.js';
import { validateUrl } from '../../input/validators.js';
import { createSpinner } from '../../utils/progress.js';

export function registerGenerateCommand(program: Command): void {
  program
    .command('generate')
    .description('Generate Schema.org structured data for a given URL')
    .argument('<url>', 'The URL to generate schema for')
    .option('-t, --type <type>', 'Schema.org type hint (e.g., Article, Product)')
    .option('-o, --output <file>', 'Output file path (defaults to stdout)')
    .action(async (url: string, options: { type?: string; output?: string }) => {
      const spinner = createSpinner('Starting schema generation...');

      try {
        // Validate URL
        const urlResult = validateUrl(url);
        if (!urlResult.valid) {
          spinner.fail(urlResult.error!);
          process.exit(1);
        }
        const normalizedUrl = urlResult.normalized;

        // Step 1: Initialize vocabulary manager in parallel with crawling
        spinner.update('Initializing...');
        const vocabManager = createVocabularyManager();
        const vocabInitPromise = vocabManager.initialize();

        // Step 2: Crawl the page
        spinner.update('Crawling page...');
        const crawler = await createCrawler();

        try {
          const crawlResult = await crawler.crawl(normalizedUrl);

          if (crawlResult.error) {
            spinner.fail(`Crawl failed: ${crawlResult.error}`);
            process.exit(1);
          }

          // Wait for vocabulary
          spinner.update('Loading Schema.org vocabulary...');
          await vocabInitPromise;

          // Step 3: Detect page type
          spinner.update('Detecting page type...');
          const { type: detectedType, confidence } = detectPageTypeWithConfidence(
            crawlResult.pageContent,
            crawlResult.existingSchemas,
          );
          const finalType = options.type ?? detectedType;

          console.log(chalk.dim(`  Detected type: ${detectedType} (${(confidence * 100).toFixed(0)}% confidence)`));
          if (options.type && options.type !== detectedType) {
            console.log(chalk.dim(`  Using override type: ${options.type}`));
          }

          // Step 4: Get vocabulary info
          spinner.update('Preparing vocabulary context...');
          const recommendedProps = await vocabManager.getRecommendedProperties(finalType);
          const vocabularyInfo = recommendedProps
            .map((p) => `- ${p.name}: ${p.description} (expected types: ${p.rangeTypes.join(', ')})`)
            .join('\n');

          // Step 5: Generate schemas via AI
          spinner.update('Generating schemas with AI...');
          const generatedSchemas = await generateSchema(
            crawlResult.pageContent,
            crawlResult.existingSchemas,
            finalType,
            vocabularyInfo,
          );

          // Step 6: Validate each schema
          spinner.update('Validating schemas...');
          const vocabContext = {
            isValidType: (name: string) => vocabManager.isValidTypeSync(name),
            getType: (name: string) => vocabManager.getTypeSync(name),
            getPropertiesForType: (name: string) => vocabManager.getPropertiesForTypeSync(name),
          };

          let hasValidationIssues = false;
          for (const schema of generatedSchemas) {
            const schemaType = Array.isArray(schema['@type']) ? schema['@type'].join(', ') : schema['@type'];
            const validationResult = await validateJsonLd(schema, vocabContext);

            if (validationResult.warnings.length > 0) {
              console.log(chalk.yellow(`\n  Validation warnings for ${schemaType}:`));
              for (const warning of validationResult.warnings) {
                console.log(chalk.yellow(`    - ${warning.message}`));
              }
            }

            if (!validationResult.valid) {
              hasValidationIssues = true;
              console.log(chalk.red(`\n  Validation errors for ${schemaType}:`));
              for (const error of validationResult.errors) {
                console.log(chalk.red(`    - ${error.message}`));
              }
            }
          }

          if (hasValidationIssues) {
            console.log(chalk.yellow(`\n  Schemas generated with validation issues. Review carefully.`));
          }

          // Step 7: Output
          spinner.succeed('Schema generation complete.');

          // Summary
          const typeNames = generatedSchemas.map((s) =>
            Array.isArray(s['@type']) ? s['@type'].join(', ') : s['@type'],
          );
          console.log(chalk.dim(`\n  Generated ${generatedSchemas.length} schema(s): ${typeNames.join(', ')}`));

          if (options.output) {
            if (generatedSchemas.length === 1) {
              const schemaOutput = JSON.stringify(generatedSchemas[0], null, 2);
              await fs.writeFile(options.output, schemaOutput, 'utf-8');
              console.log(chalk.green(`\nSchema written to ${options.output}`));
            } else {
              const ext = path.extname(options.output);
              const base = options.output.slice(0, options.output.length - ext.length);
              for (const schema of generatedSchemas) {
                const schemaType = Array.isArray(schema['@type'])
                  ? schema['@type'].join('-')
                  : schema['@type'];
                const fileName = `${base}-${schemaType}${ext || '.json'}`;
                const schemaOutput = JSON.stringify(schema, null, 2);
                await fs.writeFile(fileName, schemaOutput, 'utf-8');
                console.log(chalk.green(`  Schema written to ${fileName}`));
              }
            }
          } else {
            for (const schema of generatedSchemas) {
              console.log('\n' + JSON.stringify(schema, null, 2));
            }
          }
        } finally {
          await crawler.close();
        }
      } catch (error) {
        spinner.fail('Schema generation failed.');
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });
}
