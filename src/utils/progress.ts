import ora, { type Ora } from 'ora';

export interface Spinner {
  update(text: string): void;
  succeed(text: string): void;
  fail(text: string): void;
  stop(): void;
}

/**
 * Creates an ora spinner with the given initial text.
 */
export function createSpinner(text: string): Spinner {
  const spinner: Ora = ora({ text, spinner: 'dots' }).start();
  return {
    update(newText: string) {
      spinner.text = newText;
    },
    succeed(msg: string) {
      spinner.succeed(msg);
    },
    fail(msg: string) {
      spinner.fail(msg);
    },
    stop() {
      spinner.stop();
    },
  };
}

export interface ProgressTracker {
  total: number;
  processed: number;
  update(label: string): void;
  increment(): void;
  done(message?: string): void;
}

/**
 * Creates a simple progress tracker that logs batch processing progress.
 */
export function createProgress(total: number): ProgressTracker {
  let processed = 0;

  return {
    get total() {
      return total;
    },
    get processed() {
      return processed;
    },
    update(label: string) {
      process.stdout.write(`\r  [${processed}/${total}] ${label}`);
    },
    increment() {
      processed++;
      process.stdout.write(`\r  [${processed}/${total}] Done.                              \n`);
    },
    done(message?: string) {
      console.log(message ?? `\nDone. Processed ${processed}/${total} items.`);
    },
  };
}
