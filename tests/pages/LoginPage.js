class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button:has-text("Sign In")');
    this.errorMessages = page.locator('.notice');
  }

  async goto() {
    await this.page.goto('http://localhost:4000/login');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrors() {
    return await this.errorMessages.allTextContents();
  }
}

module.exports = LoginPage;