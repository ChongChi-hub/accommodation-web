import { ESLint } from 'eslint';

async function run() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(['src/**/*.{ts,tsx}']);

  let totalWarnings = 0;
  const violationsByFile = [];

  for (const result of results) {
    const i18nWarnings = result.messages.filter(
      (m) => m.ruleId === 'i18next/no-literal-string'
    );
    if (i18nWarnings.length > 0) {
      totalWarnings += i18nWarnings.length;
      violationsByFile.push({
        filePath: result.filePath,
        count: i18nWarnings.length,
      });
    }
  }

  console.log(`Total literal string violations found: ${totalWarnings}`);
  console.log(`Files with literal strings: ${violationsByFile.length}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
