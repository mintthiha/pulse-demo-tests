import { World, IWorldOptions, setWorldConstructor } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";

/**
 * BloomWorld extends Cucumber's World class to inject Playwright browser objects
 * into every scenario. Each scenario gets its own instance of this class,
 * so state is fully isolated between scenarios.
 */
export class BloomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  accountIds: Record<string, string> = {};


  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(BloomWorld);