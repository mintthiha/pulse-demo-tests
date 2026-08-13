# pulse-demo-tests

Automated test suite for [Bloom](https://github.com/mintthiha/bloom) — a fictional banking application.

Two suites:
- **`api-tests/`** — Java + Cucumber + REST Assured. Tests all API endpoints and business rules.
- **`ui-tests/`** — Playwright + TypeScript. End-to-end browser tests against the Bloom frontend.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.8+ |
| Node.js | 20+ |
| Bloom backend | Running on port 3001 |
| Bloom frontend | Running on port 3000 (UI tests only) |

---

## Running API Tests

The backend requires an `INTERNAL_API_SECRET` on every `/api/*` request. Point the tests at whatever
secret your local backend was started with (defaults to `local-dev-secret` on both sides if you don't
override either):

```bash
cd api-tests
mvn test -Dbloom.api.secret=<same value as your backend's INTERNAL_API_SECRET>
```

Run only smoke tests:
```bash
mvn test -Dcucumber.filter.tags="@Smoke"
```

Reports generated at `api-tests/target/cucumber-reports/report.html`.

---

## Running UI Tests

```bash
cd ui-tests
npm install
npx playwright install chromium
npm test
```

Run smoke tests only:
```bash
npm run test:smoke
```

---

## CI

Trigger via **Actions → Tests regression run → Run workflow**.
Choose branch and suite: `api`, `ui`, or `all`.