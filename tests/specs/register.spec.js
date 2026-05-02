const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');

test.describe('User Registration - POSITIVE TESTS', () => {
  let home;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.goto();
  });

  test('should register successfully', async ({ page }) => {
    const username = 'user' + Date.now().toString().slice(-10);

    await home.register(username, 'password123', 'password123');

    const welcomeHeader = page.getByRole('heading', {
      name: /Welcome to DashBoard/i
    });

    await expect(welcomeHeader).toBeVisible();
  });

  test('should register with minimum valid username length (3 chars)', async ({ page }) => {
    const username = Math.random().toString(36).substring(2, 5);
    await home.register(username, 'password123', 'password123');

    const welcomeHeader = page.getByRole('heading', {
      name: /Welcome to DashBoard/i
    });

    await expect(welcomeHeader).toBeVisible();
  });

  test('should register with maximum valid username length (15 chars)', async ({ page }) => {
    const username = Math.random().toString(36).substring(2, 17);
    await home.register(username, 'password123', 'password123');

    const welcomeHeader = page.getByRole('heading', {
      name: /Welcome to DashBoard/i
    });

    await expect(welcomeHeader).toBeVisible();
  });

  test('should register with minimum password length (5 chars)', async ({ page }) => {
    const username = 'user' + Date.now().toString().slice(-10);

    await home.register(username, '12345', '12345');

    const welcomeHeader = page.getByRole('heading', {
      name: /Welcome to DashBoard/i
    });

    await expect(welcomeHeader).toBeVisible();
  });
});

test.describe('User Registration - NEGATIVE TESTS', () => {
  let home;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.goto();
  });

  test('should show error when passwords do not match', async () => {
    await home.register('testuser', 'password123', 'wrongpass');

    const errors = await home.getErrors();
    expect(errors).toContain('Passwords do not match');
  });

  test('should fail when username is empty', async () => {
    await home.register('', 'password123', 'password123');

    const errors = await home.getErrors();
    expect(errors).toContain('You must provide a Username.');
  });

  test('should fail when password is empty', async () => {
    await home.register('testuser', '', '');

    const errors = await home.getErrors();
    expect(errors).toContain('You must provide a Password.');
  });

  test('should fail when username is less than 3 characters', async () => {
    await home.register('ab', 'password123', 'password123');

    const errors = await home.getErrors();
    expect(errors).toContain('Username less than 3');
  });

  test('should fail when username is greater than 15 characters', async () => {
    await home.register('abcdefghijklmnop', 'password123', 'password123');

    const errors = await home.getErrors();
    expect(errors).toContain('Username greater than 15');
  });

  test('should fail when username contains invalid characters', async () => {
    await home.register('user@123', 'password123', 'password123');

    const errors = await home.getErrors();
    expect(errors).toContain('Username must contain letters and numbers');
  });

  test('should fail when password is less than 5 characters', async () => {
    await home.register('testuser', '1234', '1234');

    const errors = await home.getErrors();
    expect(errors).toContain('Password less than 5');
  });

  test('should fail when password is greater than 25 characters', async () => {
    const longPassword = 'a'.repeat(26);

    await home.register('testuser', longPassword, longPassword);

    const errors = await home.getErrors();
    expect(errors).toContain('Password greater than 25');
  });

  test('should fail when username already exists', async ({ page }) => {
    const username = 'duplicateUser';

    await home.register(username, 'password123', 'password123');

    await page.getByRole('link', { name: 'logout' }).click();

    await home.register(username, 'password123', 'password123');

    const errors = await home.getErrors();
    expect(errors).toContain('Username already exists!!!');
  });

  test('should fail with whitespace-only inputs', async () => {
    await home.register('   ', '   ', '   ');

    const errors = await home.getErrors();
    expect(errors).toContain('You must provide a Username.');
  });

  test('should fail with SQL injection attempt', async () => {
    await home.register("' OR 1=1 --", 'password123', 'password123');

    const errors = await home.getErrors();
    expect(errors).toContain('Username must contain letters and numbers');
  });

  test('should fail with very long username', async () => {
    const longUsername = 'a'.repeat(1000);

    await home.register(longUsername, 'password123', 'password123');

    const errors = await home.getErrors();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('should not submit form when no action is taken', async ({ page }) => {
    await expect(page).toHaveURL('/');
  });
});