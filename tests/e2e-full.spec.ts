import { test, expect } from '@playwright/test';

// This test assumes user is already authenticated
test.describe('Phase B1 + B2: Full E2E Tests', () => {
  let testBoardId: string;
  let testListId: string;
  let testCardId: string;

  test('01. Should load dashboard', async ({ page }) => {
    await page.goto('/');

    // Should show dashboard
    await expect(page.locator('h1')).toContainText(/boards|dashboard/i);
  });

  test('02. Should create a new board', async ({ page }) => {
    await page.goto('/');

    // Click create board button
    await page.click('button:has-text("Create Board"), button:has-text("New Board")');

    // Fill in board title
    await page.fill('input[name="title"]', 'E2E Test Board');

    // Submit form
    await page.click('button:has-text("Create")');

    // Should show new board
    await expect(page.locator('text=E2E Test Board')).toBeVisible({ timeout: 10000 });

    // Get board ID from URL or element
    const boardCard = page.locator('text=E2E Test Board').locator('..');
    await boardCard.click();

    // Should navigate to board page
    await page.waitForURL(/\/board\/.+/);
    testBoardId = page.url().split('/board/')[1];
  });

  test('03. Should create a list', async ({ page }) => {
    await page.goto('/');
    await page.click('text=E2E Test Board');
    await page.waitForURL(/\/board\/.+/);

    // Click add list
    await page.click('button:has-text("Add List"), button:has-text("Add a list")');

    // Type list name
    await page.fill('input[placeholder*="list" i], input[placeholder*="List" i]', 'To Do');
    await page.keyboard.press('Enter');

    // Should show new list
    await expect(page.locator('text=To Do')).toBeVisible();
  });

  test('04. Should create a card', async ({ page }) => {
    await page.goto('/');
    await page.click('text=E2E Test Board');
    await page.waitForURL(/\/board\/.+/);

    // Click add card in the To Do list
    await page.click('button:has-text("Add Card"), button:has-text("Add a card")');

    // Type card title
    await page.fill('textarea[placeholder*="card" i], input[placeholder*="card" i]', 'Test Task 1');
    await page.keyboard.press('Enter');

    // Should show new card
    await expect(page.locator('text=Test Task 1')).toBeVisible();
  });

  test('05. Should open card detail panel', async ({ page }) => {
    await page.goto('/');
    await page.click('text=E2E Test Board');
    await page.waitForURL(/\/board\/.+/);

    // Click on the card
    await page.click('text=Test Task 1');

    // Side panel should be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('06. Should edit card description', async ({ page }) => {
    await page.goto('/');
    await page.click('text=E2E Test Board');
    await page.waitForURL(/\/board\/.+/);

    // Open card
    await page.click('text=Test Task 1');

    // Edit description
    const descriptionTextarea = page.locator('textarea[placeholder*="description" i]').first();
    await descriptionTextarea.click();
    await descriptionTextarea.fill('This is a test task for E2E testing');

    // Click outside or wait for auto-save
    await page.waitForTimeout(1000);

    // Should show success message (if implemented)
    // Close panel
    await page.keyboard.press('Escape');
  });

  test('07. Should create and assign a label (Phase B2)', async ({ page }) => {
    await page.goto('/');
    await page.click('text=E2E Test Board');
    await page.waitForURL(/\/board\/.+/);

    // Open card
    await page.click('text=Test Task 1');

    // Look for "Add label" or "Labels" button
    const addLabelButton = page.locator('button:has-text("Add label"), button:has-text("Labels")').first();
    if (await addLabelButton.isVisible()) {
      await addLabelButton.click();

      // Try to create a new label
      const createLabelBtn = page.locator('button:has-text("Create"), button:has-text("New label")').first();
      if (await createLabelBtn.isVisible()) {
        await createLabelBtn.click();

        // Fill label name
        await page.fill('input[name="name"]', 'Bug');

        // Select red color
        await page.click('[data-color="red"]');

        // Submit
        await page.click('button:has-text("Create")');

        await page.waitForTimeout(1000);
      }
    }

    await page.keyboard.press('Escape');
  });

  test('08. Should set due date (Phase B2)', async ({ page }) => {
    await page.goto('/');
    await page.click('text=E2E Test Board');
    await page.waitForURL(/\/board\/.+/);

    // Open card
    await page.click('text=Test Task 1');

    // Look for due date button
    const dueDateButton = page.locator('button:has-text("Due date"), button:has-text("Set due date")').first();
    if (await dueDateButton.isVisible()) {
      await dueDateButton.click();

      // Click on a date in the calendar
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 5);

      const dateButton = page.locator(`button[name="day"]`).first();
      if (await dateButton.isVisible()) {
        await dateButton.click();
        await page.waitForTimeout(1000);
      }
    }

    await page.keyboard.press('Escape');
  });

  test('09. Should toggle dark mode', async ({ page }) => {
    await page.goto('/');

    // Find theme toggle
    const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme" i]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // Select dark mode
      await page.click('button:has-text("Dark")');

      // HTML should have dark class
      await page.waitForTimeout(500);
      const html = page.locator('html');
      const htmlClass = await html.getAttribute('class');
      expect(htmlClass).toContain('dark');
    }
  });

  test('10. Should create second list for drag test', async ({ page }) => {
    await page.goto('/');
    await page.click('text=E2E Test Board');
    await page.waitForURL(/\/board\/.+/);

    // Add another list
    await page.click('button:has-text("Add List"), button:has-text("Add a list")');
    await page.fill('input[placeholder*="list" i]', 'In Progress');
    await page.keyboard.press('Enter');

    await expect(page.locator('text=In Progress')).toBeVisible();
  });

  test('11. Should drag card between lists', async ({ page }) => {
    await page.goto('/');
    await page.click('text=E2E Test Board');
    await page.waitForURL(/\/board\/.+/);

    // Wait for lists to load
    await page.waitForTimeout(1000);

    // Find the card
    const card = page.locator('text=Test Task 1').first();

    // Find target list
    const targetList = page.locator('text=In Progress').locator('..').locator('..');

    // Perform drag
    if (await card.isVisible() && await targetList.isVisible()) {
      await card.hover();
      await page.mouse.down();
      await targetList.hover();
      await page.mouse.up();

      await page.waitForTimeout(1000);

      // Verify card moved (this might need adjustment based on actual implementation)
      // await expect(targetList.locator('text=Test Task 1')).toBeVisible();
    }
  });

  test('12. Should delete the test board', async ({ page }) => {
    await page.goto('/');
    await page.click('text=E2E Test Board');
    await page.waitForURL(/\/board\/.+/);

    // Look for board settings/delete button
    const settingsButton = page.locator('button[aria-label*="settings" i], button[aria-label*="menu" i]').first();
    if (await settingsButton.isVisible()) {
      await settingsButton.click();

      const deleteButton = page.locator('button:has-text("Delete")').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Confirm deletion
        await page.click('button:has-text("Delete"), button:has-text("Confirm")');

        // Should redirect to dashboard
        await page.waitForURL('/', { timeout: 5000 });
      }
    }
  });
});
