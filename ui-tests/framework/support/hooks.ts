import { Before, After, ITestCaseHookParameter, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium } from "@playwright/test";
import { BloomWorld } from "./world";
import { buildTestUser, createSessionCookie } from "./auth";

setDefaultTimeout(40000);

const BASE_URL = process.env.BLOOM_UI_URL || "http://localhost:3000";

/**
 * Runs before every scenario.
 * Launches a fresh Chromium browser, creates a new context and page.
 * Each scenario gets its own isolated browser session.
 */
Before(async function (this: BloomWorld, scenario: ITestCaseHookParameter) {
  const headed = (this.parameters as Record<string, boolean>)?.headed ?? false;
  const testUser = buildTestUser(scenario.pickle.name);
  const isUnauthenticated = scenario.pickle.tags.some((tag) => tag.name === "@Unauthenticated");
  this.testUser = testUser;

  this.browser = await chromium.launch({ headless: !headed });
  this.context = await this.browser.newContext({ baseURL: BASE_URL });

  // Pre-populate all dashboard card IDs so cards hidden by default (e.g. "recurring")
  // are visible in every test without manual UI configuration.
  //
  // layout.tsx injects a per-user reset script that clears bloom_dashboard_visible_cards
  // whenever bloom_active_user differs from the current session user. We set bloom_active_user
  // to the test user's ID first so the layout script sees "same user" and skips the wipe.
  await this.context.addInitScript(`
    var ALL_CARDS = ["safe-to-spend","goals","financial-health","insights","budget-rule",
      "monthly-snapshot","budgets","recurring","calendar","net-worth","account-balances"];
    try {
      window.localStorage.setItem("bloom_active_user", ${JSON.stringify(testUser.id)});
      window.localStorage.setItem("bloom_dashboard_visible_cards", JSON.stringify(ALL_CARDS));
    } catch(e) {}
  `);

  if (!isUnauthenticated) {
    await this.context.addCookies([
      await createSessionCookie(BASE_URL, {
        sub: testUser.id,
        name: testUser.name,
        email: testUser.email,
      }),
    ]);
  }
  this.page = await this.context.newPage();
});

/**
 * Runs after every scenario, regardless of pass or fail.
 * Closes the browser to free up resources.
 */
After(async function (this: BloomWorld) {
  await this.browser.close();
});
