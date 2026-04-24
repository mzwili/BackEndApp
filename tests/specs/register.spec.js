const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');

test.describe('User Registration', () => {

  test('should register successfully', async ({ page }) => {
    const home = new HomePage(page);

    await home.goto();

    const username = 'user' + Date.now().toString().slice(-10); // generate unique username

    await home.register(username, 'password123', 'password123');

    // await expect(page).toHaveURL(/dashboard/);
    const welcomeHeader = page.getByRole('heading', { name: /Welcome to DashBoard/i });
    await expect(welcomeHeader).toBeVisible();
  });

  test('should show error when passwords do not match', async ({ page }) => {
    const home = new HomePage(page);

    await home.goto();

    await home.register('testuser', 'password123', 'wrongpass');

    const errors = await home.getErrors();

    expect(errors).toContain('Passwords do not match');
  });

});