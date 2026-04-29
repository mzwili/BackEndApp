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

  test('should fail with wrong credentials', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();

    await login.login('wronguser', 'wrongpass');

    const errors = await login.getErrors();

    expect(errors).toContain('Invalid username / password');
  });

});