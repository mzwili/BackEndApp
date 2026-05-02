const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');

test.describe('User Login Positive', () => {
  let login;
  let home;

  // 🔹 Runs before EACH test
  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    home = new HomePage(page);
  });

  // 🔹 Runs after EACH test
  test.afterEach(async ({ page }) => {
    // Optional cleanup (e.g., logout to reset state)
    try {
      await page.goto('/logout');
    } catch (e) {
      // ignore if not logged in
    }
  });

  async function registerUser() {
    await home.goto();

    const username = 'user' + Date.now().toString().slice(-10);
    const password = 'password123';

    await home.register(username, password, password);

    return { username, password };
  }

  test('should login successfully with valid credentials', async ({ page }) => {
    const { username, password } = await registerUser();

    await login.goto();
    await login.login(username, password);

    const welcomeHeader = page.getByRole('heading', { name: /Welcome to DashBoard/i });
    await expect(welcomeHeader).toBeVisible();
  });

  test('should set authentication cookie after login', async ({ context }) => {
    const { username, password } = await registerUser();

    await login.goto();
    await login.login(username, password);

    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name === 'backEndApp');

    expect(authCookie).toBeTruthy();
  });

  test('should persist session after page reload', async ({ page }) => {
    const { username, password } = await registerUser();

    await login.goto();
    await login.login(username, password);

    await page.reload();

    const welcomeHeader = page.getByRole('heading', { name: /Welcome to DashBoard/i });
    await expect(welcomeHeader).toBeVisible();
  });

  test('should allow access to protected route after login', async ({ page }) => {
    const { username, password } = await registerUser();

    await login.goto();
    await login.login(username, password);

    await page.goto('/');

    const welcomeHeader = page.getByRole('heading', { name: /Welcome to DashBoard/i });
    await expect(welcomeHeader).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    const { username, password } = await registerUser();

    await login.goto();
    await login.login(username, password);

    await page.goto('/logout');

    const homepageHeader = page.getByRole('heading', { name: /My Application/i });
    await expect(homepageHeader).toBeVisible();
    await expect(page).toHaveURL('/');
  });
});

test.describe('User Login - Negative Scenarios', () => {
  let login;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto();
  });

  test.afterEach(async ({ page }) => {
    // ensure clean state
    await page.context().clearCookies();
  });

  test('should fail with wrong username and password', async () => {
    await login.login('wronguser', 'wrongpass');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail with correct username but wrong password', async () => {
    await login.login('existinguser', 'wrongpass');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail with non-existing username', async () => {
    await login.login('nonexistentuser', 'password123');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail when username is empty', async () => {
    await login.login('', 'password123');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail when password is empty', async () => {
    await login.login('testuser', '');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail when both fields are empty', async () => {
    await login.login('', '');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail with whitespace input', async () => {
    await login.login('   ', '   ');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail with SQL injection attempt', async () => {
    await login.login("' OR 1=1 --", 'password123');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail with very long input', async () => {
    const longString = 'a'.repeat(1000);

    await login.login(longString, longString);

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail with special characters', async () => {
    await login.login('!@#$%^&*()', '!@#$%^&*()');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should not login without submitting form', async ({ page }) => {
    await expect(page).toHaveURL(/login/);
  });
});