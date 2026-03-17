import { Command } from 'commander';
import { registerGenerateCommand } from './commands/generate.js';
import { registerAuditCommand } from './commands/audit.js';

export function createCli(): Command {
  const program = new Command();

  program
    .name('schemaskill')
    .description('Schema.org structured data generator and auditor')
    .version('1.0.0');

  registerGenerateCommand(program);
  registerAuditCommand(program);

  return program;
}
