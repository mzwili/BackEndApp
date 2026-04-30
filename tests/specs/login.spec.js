const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');

test.describe('User Login Positive', () => {

  async function registerUser(page) {
    const home = new HomePage(page);
    await home.goto();

    const username = 'user' + Date.now().toString().slice(-10);
    const password = 'password123';

    await home.register(username, password, password);

    return { username, password };
  }

  test('should login successfully with valid credentials', async ({ page }) => {
    const { username, password } = await registerUser(page);

    const login = new LoginPage(page);
    await login.goto();

    await login.login(username, password);

    // Assert user is logged in (dashboard loaded)
    const welcomeHeader = page.getByRole('heading', { name: /Welcome to DashBoard/i });
    await expect(welcomeHeader).toBeVisible();
  });

  test('should set authentication cookie after login', async ({ page, context }) => {
    const { username, password } = await registerUser(page);

    const login = new LoginPage(page);
    await login.goto();

    await login.login(username, password);

    const cookies = await context.cookies();

    const authCookie = cookies.find(c => c.name === 'backEndApp');

    expect(authCookie).toBeTruthy(); // cookie exists
  });

  test('should persist session after page reload', async ({ page }) => {
    const { username, password } = await registerUser(page);

    const login = new LoginPage(page);
    await login.goto();

    await login.login(username, password);

    await page.reload();

    // ✅ Still logged in
    const welcomeHeader = page.getByRole('heading', { name: /Welcome to DashBoard/i });
    await expect(welcomeHeader).toBeVisible();
  });

  test('should allow access to protected route after login', async ({ page }) => {
    const { username, password } = await registerUser(page);

    const login = new LoginPage(page);
    await login.goto();

    await login.login(username, password);

    // Try accessing home (protected logic)
    await page.goto('/');

    const welcomeHeader = page.getByRole('heading', { name: /Welcome to DashBoard/i });
    await expect(welcomeHeader).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    const { username, password } = await registerUser(page);

    const login = new LoginPage(page);
    await login.goto();

    await login.login(username, password);

    // logout
    await page.goto('/logout');

    // should redirect to homepage
    const hompageHeader = page.getByRole('heading', { name: /My Application/i });
    await expect(hompageHeader).toBeVisible();
    await expect(page).toHaveURL('/');
  });


});

test.describe('User Login - Negative Scenarios', () => {

  test('should fail with wrong username and password', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login('wronguser', 'wrongpass');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail with correct username but wrong password', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login('existinguser', 'wrongpass');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail with non-existing username', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login('nonexistentuser', 'password123');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail when username is empty', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login('', 'password123');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail when password is empty', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login('testuser', '');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail when both fields are empty', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login('', '');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail with whitespace input', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login('   ', '   ');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail with SQL injection attempt', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login("' OR 1=1 --", 'password123');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail with very long input', async ({ page }) => {
    const login = new LoginPage(page);

    const longString = 'a'.repeat(1000);

    await login.goto();
    await login.login(longString, longString);

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should fail with special characters', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login('!@#$%^&*()', '!@#$%^&*()');

    const errors = await login.getErrors();
    expect(errors).toContain('Invalid username / password');
  });

  test('should not login without submitting form', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();

    // No action
    await expect(page).toHaveURL(/login/);
  });

});