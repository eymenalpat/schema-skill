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
        const urlResult = validateUrl(url);
        if (!urlResult.valid) {
          spinner.fail(urlResult.error!);
          process.exit(1);
        }
        const normalizedUrl = urlResult.normalized;

        spinner.update('Initializing...');
        const vocabManager = createVocabularyManager();
        const vocabInitPromise = vocabManager.initialize();

        spinner.update('Crawling page...');
        const crawler = await createCrawler();

        try {
          const crawlResult = await crawler.crawl(normalizedUrl);

          if (crawlResult.error) {
            spinner.fail(`Crawl failed: ${crawlResult.error}`);
            process.exit(1);
          }

          spinner.update('Loading Schema.org vocabulary...');
          await vocabInitPromise;

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

          spinner.update('Preparing vocabulary context...');
          const recommendedProps = await vocabManager.getRecommendedProperties(finalType);
          const vocabularyInfo = recommendedProps
            .map((p) => `- ${p.name}: ${p.description} (expected types: ${p.rangeTypes.join(', ')})`)
            .join('\n');

          // Generate schemas WITH built-in validation + auto-fix
          spinner.update('Generating schemas with AI (with auto-validation)...');
          const vocabContext = {
            isValidType: (name: string) => vocabManager.isValidTypeSync(name),
            getType: (name: string) => vocabManager.getTypeSync(name),
            getPropertiesForType: (name: string) => vocabManager.getPropertiesForTypeSync(name),
          };

          const generatedSchemas = await generateSchema(
            crawlResult.pageContent,
            crawlResult.existingSchemas,
            finalType,
            vocabularyInfo,
            async (schema) => validateJsonLd(schema, vocabContext),
          );

          // Final validation report (post auto-fix)
          spinner.update('Final validation...');
          let allValid = true;
          for (const schema of generatedSchemas) {
            const schemaType = Array.isArray(schema['@type']) ? schema['@type'].join(', ') : schema['@type'];
            const result = await validateJsonLd(schema, vocabContext);

            if (result.warnings.length > 0) {
              console.log(chalk.yellow(`\n  Warnings for ${schemaType}:`));
              for (const w of result.warnings) console.log(chalk.yellow(`    - ${w.message}`));
            }
            if (!result.valid) {
              allValid = false;
              console.log(chalk.red(`\n  Errors for ${schemaType} (could not auto-fix):`));
              for (const e of result.errors) console.log(chalk.red(`    - ${e.message}`));
            }
          }

          if (allValid) {
            spinner.succeed('Schema generation complete — all schemas validated.');
          } else {
            spinner.succeed('Schema generation complete (some issues remain).');
          }

          const typeNames = generatedSchemas.map((s) =>
            Array.isArray(s['@type']) ? s['@type'].join(', ') : s['@type'],
          );
          console.log(chalk.dim(`\n  Generated ${generatedSchemas.length} schema(s): ${typeNames.join(', ')}`));

          // Build merged @graph JSON-LD (for CRMs that need a single script tag)
          const mergedSchema = generatedSchemas.length > 1
            ? {
                '@context': 'https://schema.org',
                '@graph': generatedSchemas.map(({ '@context': _ctx, ...rest }) => rest),
              }
            : null;

          if (options.output) {
            const ext = path.extname(options.output);
            const base = options.output.slice(0, options.output.length - ext.length);

            if (generatedSchemas.length === 1) {
              await fs.writeFile(options.output, JSON.stringify(generatedSchemas[0], null, 2), 'utf-8');
              console.log(chalk.green(`\nSchema written to ${options.output}`));
            } else {
              // Individual files
              for (const schema of generatedSchemas) {
                const t = Array.isArray(schema['@type']) ? schema['@type'].join('-') : schema['@type'];
                const fileName = `${base}-${t}${ext || '.json'}`;
                await fs.writeFile(fileName, JSON.stringify(schema, null, 2), 'utf-8');
                console.log(chalk.green(`  Schema written to ${fileName}`));
              }
              // Merged file
              const mergedFileName = `${base}-merged${ext || '.json'}`;
              await fs.writeFile(mergedFileName, JSON.stringify(mergedSchema, null, 2), 'utf-8');
              console.log(chalk.green(`  Merged schema written to ${mergedFileName}`));
            }
          } else {
            for (const schema of generatedSchemas) {
              console.log('\n' + JSON.stringify(schema, null, 2));
            }
            if (mergedSchema) {
              console.log(chalk.dim('\n--- Merged @graph (tek script tag için) ---'));
              console.log('\n' + JSON.stringify(mergedSchema, null, 2));
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
