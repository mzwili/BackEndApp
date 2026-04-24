const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

test.describe('User Login', () => {

  test('should fail with wrong credentials', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();

    await login.login('wronguser', 'wrongpass');

    const errors = await login.getErrors();

    expect(errors).toContain('Invalid username / password');
  });

});