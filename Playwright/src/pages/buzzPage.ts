import { Page, Locator, expect } from "@playwright/test";
import path from "path";
import { commonMethods } from "../tests/commonMethods";

// Define file path for the image to be uploaded
const filePath = path.resolve(__dirname, "../../TestImage.jpg");

/**
 * Page Object Model for Buzz Page interactions.
 */
export default class buzzPage {
    readonly page: Page;
    private common = new commonMethods();
    private mostCmntTab: Locator;

    // Locators used in Buzz Page
    private buzzLink: Locator;
    private cmt: Locator;
    private sharephoto: Locator;
    private buzzImage: Locator;
    private submitButton: Locator;
    private successMessage: Locator;
    private photoComment: Locator;
    private firstPostFooter: Locator;
    private likeCount: Locator;
    private likeButton: Locator;
    private commentInput: Locator;
    private firstCommentButton: Locator;
    private latestComment: Locator;
    private editToggle: Locator;
    private editButton: Locator;
    private postEdit: Locator;
    private postButton: Locator;
    private verifyCmnt: Locator;
    constructor(page: Page) {
        this.page = page;
        this.mostCmntTab = page.locator('//button[normalize-space()="Most Commented Posts"]');
        this.buzzLink = page.locator('//span[text()="Buzz"]');
        this.sharephoto = page.locator('//button[normalize-space()="Share Photos"]');
        this.buzzImage = page.locator('//div[@role="document"]//input[@type="file"]');

        this.submitButton = page.locator('//div[@role="document"]//button[@type="submit"]');
        this.successMessage = page.locator('//p[contains(@class,"toast-message")]');
        this.photoComment = page.locator('//div[@role="document"]//textarea');

        this.firstPostFooter = page.locator('(//div[@class="orangehrm-buzz-post-footer"])[1]');
        this.likeCount = this.firstPostFooter.locator(".orangehrm-buzz-stats-row p").first();
        this.likeButton = this.page.locator('(//div[@class="orangehrm-buzz-post-actions"]/div)[1]');
        this.commentInput = this.page.locator('//input[@placeholder="Write your comment..."]');
        this.firstCommentButton = this.page.locator('(//i[contains(@class,"bi-chat-text-fill")]/parent::button)[1]');
        this.latestComment = this.page.locator("span.orangehrm-post-comment-text").first();

        this.editToggle = page.locator('(//div[@class="orangehrm-buzz-post-header-config"]//button)[1]');
        this.editButton = page.locator('//p[text()="Edit Post"]');
        this.postEdit = this.page.locator('//div[@role="document"]//textarea');
        this.postButton = this.page.locator('//div[@role="document"]//button[@type="submit"]');
        this.verifyCmnt = this.page.locator("span.orangehrm-post-comment-text");
        this.cmt = this.page.locator('//div[@class="orangehrm-buzz-post-body"]/p');
    }

    /**
     * Navigates to the Buzz page and waits for the feed to load.
     */
    private async openBuzz() {
        await this.common.highlightElement(this.buzzLink);
        await this.buzzLink.click();
        await this.page.waitForURL(/buzz\/viewBuzz/);
        await this.cmt.first().waitFor({ state: "visible" });
    }

    /**
     * Uploads a photo post and returns the success message text.
     */
    async SharePhotoPost(editcmnt: string) {
        await this.openBuzz();

        await this.common.highlightElement(this.sharephoto);
        await this.sharephoto.click();

        await this.common.highlightElement(this.photoComment);
        await this.photoComment.fill(editcmnt);
        await this.buzzImage.setInputFiles(filePath);

        await this.common.highlightElement(this.submitButton);
        await expect(this.submitButton).toBeEnabled();
        await this.submitButton.click();

        // Photo upload can be slow on the shared server
        await expect(this.successMessage).toBeVisible({ timeout: 45000 });
        const message = await this.successMessage.innerText();

        await this.page.reload();
        await expect(this.cmt.filter({ hasText: editcmnt }).first()).toBeVisible({ timeout: 30000 });
        return message;
    }

    /**
     * Opens the Buzz page and clicks on the
     * "Most Commented Posts" tab.
     *
     * Expected: Tab becomes active (highlighted).
     */
    async mostcommentTab() {
        await this.openBuzz();

        await this.common.highlightElement(this.mostCmntTab);
        await this.mostCmntTab.click();
        await expect(this.mostCmntTab).toHaveClass(/oxd-button--label-warn/);
    }

    /**
     * Adds a timestamped comment to the first post and returns
     * the posted comment.
     */
    async addCommentToPost(commentText: string) {
        await this.openBuzz();

        await this.common.highlightElement(this.firstCommentButton);
        await this.firstCommentButton.click();

        await this.common.highlightElement(this.commentInput);
        await this.commentInput.fill(commentText);
        await this.commentInput.press("Enter");

        const postedComment = this.verifyCmnt.filter({ hasText: commentText }).first();
        await expect(postedComment).toBeVisible();
        return (await postedComment.innerText()).trim();
    }

    /**
     * Edits the most recent post using predefined edit text
     * and returns the updated post text.
     */
    public async editPost(editPostText: string) {
        await this.openBuzz();

        await this.common.highlightElement(this.editToggle);
        await this.editToggle.click();
        await this.common.highlightElement(this.editButton);
        await this.editButton.click();

        await this.common.highlightElement(this.postEdit);
        await this.postEdit.clear();
        await this.postEdit.fill(editPostText);
        await this.common.highlightElement(this.postButton);
        await this.postButton.click();

        await expect(this.cmt.first()).toContainText(editPostText);
        return (await this.cmt.first().innerText()).trim();
    }
}
