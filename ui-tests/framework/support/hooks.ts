import { Before, After } from "@cucumber/cucumber";
import { chromium } from "@playwright/test";
import { BloomWorld } from "./world";

const BASE_URL = process.env.BLOOM_UI_URL || "http://localhost:3002";

/**
 * Runs before every scenario.
 * Launches a fresh Chromium browser, creates a new context and page.
 * Each scenario gets its own isolated browser session.
 */
Before(async function (this: BloomWorld) {
  this.browser = await chromium.launch();
  this.context = await this.browser.newContext({ baseURL: BASE_URL });
  this.page = await this.context.newPage();
});

/**
 * Runs after every scenario, regardless of pass or fail.
 * Closes the browser to free up resources.
 */
After(async function (this: BloomWorld) {
  await this.browser.close();
});