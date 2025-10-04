# E2E Testing Strategy & Guidelines for Claude

## 📁 Test Structure

```
tests/
├── CLAUDE.md                 # This file - testing guidelines
├── auth.setup.ts             # Authentication setup (runs once)
├── unauthenticated/          # Tests without login required
│   └── login.spec.ts         # Login flow tests
└── authenticated/            # Tests requiring authentication
    └── homepage.spec.ts      # Protected pages tests
```

## 🏗️ Architecture Strategy

### Two-Folder Approach

- **`unauthenticated/`** - Tests that run with fresh browser (no auth state)
- **`authenticated/`** - Tests that use pre-saved authentication cookies/tokens

### Authentication Flow

1. **`auth.setup.ts`** logs in once with `carlo@carlonicora.com/password`
2. Saves auth state to `playwright/.auth/user.json`
3. **Authenticated tests** automatically load this auth state
4. **Unauthenticated tests** run with clean browser state

## ⚡ Performance Rules

### ALWAYS use `test.beforeEach()`

```typescript
test.describe("Test Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should do something", async ({ page }) => {
    // No page.goto() here - page already loaded!
    await expect(page.locator('[data-testid="something"]')).toBeVisible();
  });
});
```

**❌ NEVER do this:**

```typescript
test("should do something", async ({ page }) => {
  await page.goto("/"); // WRONG! Wastes time loading page per test
});
```

## 🎯 Test-ID Strategy

### Always Use data-testid Attributes

- Target elements with `[data-testid="element-name"]`
- Use descriptive, hierarchical naming:
  - `sidebar-home-link`
  - `form-login-input-email`
  - `page-homepage-container`

### Conditional Element Testing

```typescript
// For optional/permission-based elements
const element = page.locator('[data-testid="optional-element"]');
if (await element.isVisible()) {
  await expect(element).toBeVisible();
  await expect(element).toBeEnabled();
}
```

## 🚀 Running Tests

### Commands

```bash
# All tests (setup + unauthenticated + authenticated)
npm run test:e2e

# Only unauthenticated tests
npm run test:e2e -- --project=chromium-unauth

# Only authenticated tests
npm run test:e2e -- --project=chromium-auth

# Both chromium projects (no firefox/webkit)
npm run test:e2e -- --project=chromium-unauth --project=chromium-auth

# Interactive mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

### Configuration

- Playwright config automatically handles the folder-based auth strategy
- Tests run on port `3191` (from `.env` PORT variable)
- Setup project runs first, then other projects can use the saved auth state

## 📝 Writing New Tests

### For Unauthenticated Tests

1. Create file in `tests/unauthenticated/`
2. Use `test.beforeEach()` for page loading
3. Test login flows, landing pages, public content

### For Authenticated Tests

1. Create file in `tests/authenticated/`
2. Use `test.beforeEach()` for page loading
3. User is automatically logged in - test protected functionality
4. Test sidebars, dashboards, user-specific content

### Test Naming Convention

- File names: `feature.spec.ts` (e.g., `login.spec.ts`, `dashboard.spec.ts`)
- Test descriptions: Clear, specific actions
  - ✅ "should display sidebar when authenticated"
  - ❌ "sidebar test"

## 🔧 Best Practices

### Error Handling

```typescript
// For toast/error messages, be specific
await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });

// For navigation, use URL patterns
await expect(page).toHaveURL(/.*\/en\/dashboard/);
```

### Page State Management

- Tests share page state within `describe` blocks using `beforeEach`
- Each test suite gets fresh page load
- Authenticated tests automatically have login cookies

### Debugging Failed Tests

1. Use `--debug` flag to step through tests
2. Use `--ui` flag for interactive test development
3. Check `test-results/` folder for screenshots/traces
4. Add `console.log()` temporarily for debugging

## 🚨 Common Mistakes to Avoid

1. **❌ Multiple `page.goto()` calls** - Use `beforeEach` once
2. **❌ Hardcoded URLs** - Use URL patterns with regex
3. **❌ Missing test-id attributes** - Always prefer data-testid over CSS selectors
4. **❌ Not handling conditional elements** - Check visibility before asserting
5. **❌ Running tests without auth setup** - Authenticated tests need the setup to run first

## 🔄 CI/CD Compatibility

The test setup works in GitHub Actions:

- Authentication state is portable across environments
- Environment variables are loaded from `.env`
- All tests can run in headless mode
- Parallel execution is supported with proper auth state handling

---

**Remember: Consistency, performance, and reliability are key. Always follow these patterns!**
