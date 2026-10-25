import { Locator, Page } from "@playwright/test";
import { commonMethods } from "../tests/commonMethods";

// Importing test data from JSON file
const data = JSON.parse(JSON.stringify(require("../Data/login.json")));

/**
 * Page Object Model class for the Login Page
 */
export class LoginPage {
    readonly page: Page;
    private common = new commonMethods();

    // Locators for login fields and actions
    private usernameInput: Locator;
    private passwordInput: Locator;
    private loginButton: Locator;
    private loginErrorMessage: Locator;
    private admin: Locator; // admin menu locator
    private logOut: Locator; // logout option locator

    /**
     * Constructor initializes all locators using the passed Playwright
     * Page object instance.
     *
     * @param page Playwright Page object for the Login Page
     */
    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.locator('input[name="username"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.loginButton = page.locator('button[type="submit"]');
        this.loginErrorMessage = page.locator(".oxd-alert-content-text");
        this.admin = page.locator(".oxd-userdropdown-tab");
        this.logOut = page.locator('//a[text()="Logout"]');
    }

    /**
     * Perform login with valid credentials from test data.
     * - Fills in username and password
     * - Clicks the login button
     */
    async performLogin() {
        await this.common.highlightElement(this.usernameInput);
        await this.usernameInput.fill(data.ValidLogin.ValidUserName);
        await this.common.highlightElement(this.passwordInput);
        await this.passwordInput.fill(data.ValidLogin.ValidPassword);
        await this.common.highlightElement(this.loginButton);
        await this.loginButton.click();
        await this.page.waitForURL(/dashboard/, { waitUntil: "domcontentloaded" });
        await this.admin.waitFor({ state: "visible" });
    }
}

module.exports = { LoginPage };
