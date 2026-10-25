
import { Page, Locator, expect } from "@playwright/test";
import { stat } from "fs";
import { commonMethods } from "../tests/commonMethods";

/**
 * Page Object Model for the Admin Page
 */
export default class AdminPage {
    readonly page: Page;
    private common = new commonMethods();
    private jobbtn: Locator;
    private jobCatbtn: Locator;

    // Locators for various elements on the Admin page
    private AdminLink: Locator;
    private EmpStatusEditbutton: Locator;
    private fillName: Locator;
    private saveBtn: Locator;
    private Addbtn: Locator;
    private sortAsc: Locator;
    private upgradeButton: Locator;
    private EmpStatus: Locator;
    private adminDropdown: Locator;
    private adminSearch: Locator;
    private searchButton: Locator;
    private userRoleElements: Locator;
    private username: Locator;
    private usernameList: Locator;
    private configTab: Locator;
    private modulesSubTab: Locator;

    constructor(page: Page) {
        this.page = page;

        this.jobbtn = page.locator('//span[normalize-space()="Job"]');
        this.modulesSubTab = page.locator('//a[normalize-space()="Modules"]');
        this.configTab = page.locator('//span[normalize-space()="Configuration"]');
        this.jobCatbtn = page.locator('//a[normalize-space()="Job Categories"]');

        // Initialize all locators
        this.AdminLink = page.locator('//span[contains(@class,"oxd-main-menu-item--name") and normalize-space()="Admin"]');
        this.EmpStatusEditbutton = page.locator('//i[contains(@class,"bi-pencil-fill")]/parent::button').nth(0);
        this.fillName = page.locator(".oxd-input").nth(1);
        this.saveBtn = page.locator('//button[@type="submit"]');
        this.Addbtn = page.locator('//button[normalize-space()="Add"]');
        this.sortAsc = page.locator('//span[normalize-space()="Ascending"]');
        this.upgradeButton = this.page.locator('//a[contains(@class,"orangehrm-upgrade-link")]');
        this.EmpStatus = page.locator('//a[normalize-space()="Employment Status"]');
        this.adminDropdown = page.locator('(//div[@class="oxd-select-text-input"])[1]');
        this.adminSearch = page.locator('//div[@role="option"]/span[text()="Admin"]');
        this.searchButton = page.locator('//button[normalize-space()="Search"]');
        this.userRoleElements = page.locator('//div[@class="oxd-table-card"]//div[@role="cell"][3]/div');
        this.username = page.locator('(//form//input[contains(@class,"oxd-input")])[1]');
        this.usernameList = page.locator('//div[@class="oxd-table-card"]//div[@role="cell"][2]/div');
    }

    /**
     * Opens Admin -> Job -> Employment Status list.
     */
    private async openEmploymentStatus() {
        await this.common.highlightElement(this.AdminLink);
        await this.AdminLink.click();
        await this.page.waitForURL(/admin\/viewSystemUsers/, { waitUntil: "domcontentloaded" });

        await this.common.highlightElement(this.jobbtn);
        await this.jobbtn.click();
        await this.common.highlightElement(this.EmpStatus);
        await this.EmpStatus.click();
        await this.page.waitForURL(/admin\/employmentStatus/, { waitUntil: "domcontentloaded" });
    }

    /**
     * Edits an Employment Status with the given name
     * and verifies it is updated in the list.
     *
     * @param name - New Employment Status name.
     */
    public async EditEmpStatus(name: string) {
        await this.openEmploymentStatus();

        await this.common.highlightElement(this.EmpStatusEditbutton);
        await this.EmpStatusEditbutton.click();
        await this.page.waitForURL(/admin\/saveEmploymentStatus/, { waitUntil: "domcontentloaded" });

        await expect(this.fillName).not.toHaveValue("");
        await this.common.highlightElement(this.fillName);
        await this.fillName.fill(name);
        await this.common.highlightElement(this.saveBtn);
        await this.saveBtn.click();

        await this.page.waitForURL(/admin\/employmentStatus/, { waitUntil: "domcontentloaded" });
        await expect(this.page.locator(`//div[text()="${name}"]`)).toBeVisible();
    }

    /**
     * Adds a new Employment Status and verifies it is visible in the list.
     *
     * @param name - Employment Status name to add.
     */
    public async AddEmpstaus(name: string) {
        await this.openEmploymentStatus();

        await this.common.highlightElement(this.Addbtn);
        await this.Addbtn.click();
        await this.page.waitForURL(/admin\/saveEmploymentStatus/, { waitUntil: "domcontentloaded" });

        await this.common.highlightElement(this.fillName);
        await this.fillName.fill(name);
        await this.common.highlightElement(this.saveBtn);
        await this.saveBtn.click();

        await this.page.waitForURL(/admin\/employmentStatus/, { waitUntil: "domcontentloaded" });
        await expect(this.page.locator(`//div[text()="${name}"]`)).toBeVisible();
    }

    /**
     * Clicks Admin, then clicks Upgrade and waits for child tab to open,
     * the URL of the newly opened upgrade page.
     */
    public async upgrade() {
        await this.common.highlightElement(this.AdminLink);
        await this.AdminLink.click();
        await this.page.waitForURL(/admin\/viewSystemUsers/, { waitUntil: "domcontentloaded" });

        await this.common.highlightElement(this.upgradeButton);
        const [childPage] = await Promise.all([
            this.page.context().waitForEvent("page"),
            this.upgradeButton.click(),
        ]);
        await childPage.waitForLoadState("domcontentloaded");
        return childPage.url();
    }

    /**
     * Selects "Admin" from the role dropdown, clicks Search,
     * and returns the list of user roles from results.
     */
    public async adminModules() {
        await this.common.highlightElement(this.AdminLink);
        await this.AdminLink.click();
        await this.page.waitForURL(/admin\/viewSystemUsers/, { waitUntil: "domcontentloaded" });

        await this.common.highlightElement(this.configTab);
        await this.configTab.click();
        await this.common.highlightElement(this.modulesSubTab);
        await this.modulesSubTab.click();

        await this.page.waitForURL(/admin\/viewModules/, { waitUntil: "domcontentloaded" });
        const header = this.page.locator('//h6[normalize-space()="Module Configuration"]');
        await expect(header).toBeVisible();
        return await header.allInnerTexts();
    }
}
