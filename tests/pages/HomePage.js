class HomePage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.signUpButton = page.locator('button:has-text("Sign Up")');
    this.errorMessages = page.locator('.notice');
  }

  async goto() {
    await this.page.goto('http://localhost:4000/');
  }

  async register(username, password, confirmPassword) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.signUpButton.click();
  }

  async getErrors() {
    return await this.errorMessages.allTextContents();
  }
}

module.exports = HomePage;