import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function checkA11y(page: Page, contextName: string) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .disableRules(['color-contrast']) // Color contrast can vary dynamically by font smoothing
    .analyze();

  const severeViolations = accessibilityScanResults.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );

  if (severeViolations.length > 0) {
    console.warn(`Accessibility violations in ${contextName}:`, severeViolations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.length,
    })));
  }

  expect(severeViolations).toEqual([]);
}
