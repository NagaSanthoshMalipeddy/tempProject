
import { Locator, Page, expect } from "@playwright/test";
import path from "path";
import { commonMethods } from "../tests/commonMethods";

// Resolving the path to the image used for upload
const filePath = path.resolve(__dirname, "../../TestImage.jpg");

/**
 * Page Object Model for the "My Info" section of the application.
 */
export class MyInfoPage {
    readonly page: Page;
    private common = new commonMethods();

    // Locators for elements in the My Info section
    private MyInfo: Locator;
    private clickImage: Locator;
    private uploadButton: Locator;
    private fileInput: Locator;
    private imageSave: Locator;
    private helpbutton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.MyInfo = page.locator('//span[contains(@class,"oxd-main-menu-item--name") and normalize-space()="My Info"]');
        this.clickImage = page.locator('//div[contains(@class,"orangehrm-edit-employee-image")]//img');
        this.uploadButton = page.locator('//button[contains(@class,"employee-image-action")]');
        this.fileInput = page.locator('//input[@type="file"]');
        this.imageSave = page.locator('//button[@type="submit"]');
        this.helpbutton = page.locator('//div[contains(@class,"oxd-topbar-body-nav-slot")]//button[@title="Help"]');
    }

    /**
     * Navigates to My Info, uploads a profile image, and saves it.
     */
    async myInfo() {
        await this.common.highlightElement(this.MyInfo);
        await this.MyInfo.click();
        await this.page.waitForURL(/pim\/viewPersonalDetails/, { waitUntil: "domcontentloaded" });

        await this.common.highlightElement(this.clickImage);
        await this.clickImage.click();
        await this.page.waitForURL(/pim\/viewPhotograph/, { waitUntil: "domcontentloaded" });

        await this.common.highlightElement(this.uploadButton);
        const [fileChooser] = await Promise.all([
            this.page.waitForEvent("filechooser"),
            this.uploadButton.click(),
        ]);
        await fileChooser.setFiles(filePath);
        await expect(this.fileInput).toHaveCount(1);

        await this.common.highlightElement(this.imageSave);
        await this.imageSave.click();
    }

    /**
     * Navigate to the My Info tab and hover over the help button
     * to verify the tooltip text.
     */
    public async helpHover() {
        await this.common.highlightElement(this.MyInfo);
        await this.MyInfo.click();
        await this.page.waitForURL(/pim\/viewPersonalDetails/, { waitUntil: "domcontentloaded" });

        await this.common.highlightElement(this.helpbutton);
        await this.helpbutton.hover();
        return await this.helpbutton.getAttribute("title");
    }
}
