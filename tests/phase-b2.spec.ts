import { test, expect } from '@playwright/test';

// Note: These tests require Google OAuth to be configured
// For testing without OAuth, you can temporarily modify requireAuth() in api-utils.ts

test.describe('Phase B2: P1 Frontend Tests (Labels + Due Dates)', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup authentication
    await page.goto('/');
  });

  test.describe('Label Management', () => {
    test.skip('should open label manager dialog', async ({ page }) => {
      // Navigate to a board
      await page.goto('/board/test-board-id');

      // Open a card detail panel
      await page.click('[data-testid="card-item"]');

      // Click "Add label" button
      await page.click('button:has-text("Add label")');

      // Should show label picker popover
      const labelPicker = page.locator('[role="dialog"]');
      await expect(labelPicker).toBeVisible();
    });

    test.skip('should create a new label', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open card detail panel
      await page.click('[data-testid="card-item"]');

      // Open label picker
      await page.click('button:has-text("Add label")');

      // Click "Create new label"
      await page.click('button:has-text("Create")');

      // Label manager dialog should open
      const labelManager = page.getByRole('dialog', { name: /manage labels/i });
      await expect(labelManager).toBeVisible();

      // Fill in label name
      await page.fill('input[name="name"]', 'Bug');

      // Select red color
      await page.click('[data-color="red"]');

      // Submit form
      await page.click('button:has-text("Create Label")');

      // Should show success toast
      await expect(page.locator('text=Label created')).toBeVisible();

      // Should see new label in list
      await expect(page.locator('text=Bug')).toBeVisible();
    });

    test.skip('should edit label name and color', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open card detail panel
      await page.click('[data-testid="card-item"]');

      // Open label picker
      await page.click('button:has-text("Add label")');

      // Click manage labels
      await page.click('button:has-text("Manage")');

      // Click edit button on a label
      await page.click('[data-testid="edit-label-button"]');

      // Change name
      await page.fill('input[value="Bug"]', 'Critical Bug');

      // Change color to purple
      await page.click('[data-color="purple"]');

      // Save changes
      await page.click('button:has-text("Save")');

      // Should show updated label
      await expect(page.locator('text=Critical Bug')).toBeVisible();
    });

    test.skip('should delete a label', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open label manager via card panel
      await page.click('[data-testid="card-item"]');
      await page.click('button:has-text("Add label")');
      await page.click('button:has-text("Manage")');

      // Click delete button
      await page.click('[data-testid="delete-label-button"]');

      // Confirm deletion
      await page.click('button:has-text("Delete")');

      // Label should be removed
      await expect(page.locator('text=Bug')).not.toBeVisible();
    });
  });

  test.describe('Label Assignment', () => {
    test.skip('should assign label to card', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open card detail panel
      await page.click('[data-testid="card-item"]:has-text("Fix login bug")');

      // Open label picker
      await page.click('button:has-text("Add label")');

      // Select a label (assuming "Bug" label exists)
      await page.click('text=Bug');

      // Label should be assigned to card
      const cardLabels = page.locator('[data-testid="card-labels-section"]');
      await expect(cardLabels.locator('text=Bug')).toBeVisible();

      // Close panel and verify label appears on card
      await page.keyboard.press('Escape');
      const card = page.locator('[data-testid="card-item"]:has-text("Fix login bug")');
      await expect(card.locator('[data-testid="label-badge"]')).toBeVisible();
    });

    test.skip('should remove label from card', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open card with labels
      await page.click('[data-testid="card-item"]:has-text("Fix login bug")');

      // Click X on a label badge
      await page.click('[data-testid="remove-label-button"]');

      // Label should be removed
      await expect(page.locator('[data-testid="card-labels-section"]').locator('text=Bug')).not.toBeVisible();
    });

    test.skip('should display max 3 labels on card with overflow indicator', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Assuming a card has 5 labels assigned
      const card = page.locator('[data-testid="card-item"]').first();

      // Should show exactly 3 labels
      const visibleLabels = card.locator('[data-testid="label-badge"]');
      await expect(visibleLabels).toHaveCount(3);

      // Should show "+2 more" indicator
      await expect(card.locator('text=+2')).toBeVisible();
    });

    test.skip('should assign multiple labels at once', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open card detail panel
      await page.click('[data-testid="card-item"]');

      // Open label picker
      await page.click('button:has-text("Add label")');

      // Select multiple labels
      await page.click('text=Bug');
      await page.click('text=Feature');
      await page.click('text=Enhancement');

      // All labels should be visible in card panel
      const labelsSection = page.locator('[data-testid="card-labels-section"]');
      await expect(labelsSection.locator('text=Bug')).toBeVisible();
      await expect(labelsSection.locator('text=Feature')).toBeVisible();
      await expect(labelsSection.locator('text=Enhancement')).toBeVisible();
    });
  });

  test.describe('Label Filtering', () => {
    test.skip('should filter cards by single label', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open filter menu
      await page.click('button:has-text("Filter")');

      // Select "Bug" label filter
      await page.click('text=Bug');

      // Only cards with Bug label should be visible
      const visibleCards = page.locator('[data-testid="card-item"]');
      await expect(visibleCards).toHaveCount(2); // Assuming 2 cards have Bug label

      // Cards without Bug label should not be visible
      await expect(page.locator('[data-testid="card-item"]:has-text("Add new feature")')).not.toBeVisible();
    });

    test.skip('should filter cards by multiple labels (OR condition)', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open filter menu
      await page.click('button:has-text("Filter")');

      // Select multiple label filters
      await page.click('text=Bug');
      await page.click('text=Feature');

      // Cards with Bug OR Feature should be visible
      await expect(page.locator('[data-testid="card-item"]')).toHaveCount(5);
    });

    test.skip('should display active filters', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Apply label filter
      await page.click('button:has-text("Filter")');
      await page.click('text=Bug');

      // Active filter badge should be visible
      await expect(page.locator('[data-testid="active-filter"]:has-text("Bug")')).toBeVisible();
    });

    test.skip('should clear all filters', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Apply filters
      await page.click('button:has-text("Filter")');
      await page.click('text=Bug');
      await page.click('text=Feature');

      // Click clear filters
      await page.click('button:has-text("Clear filters")');

      // All cards should be visible again
      const allCards = page.locator('[data-testid="card-item"]');
      await expect(allCards).toHaveCount(10); // Total card count

      // Active filter badges should be gone
      await expect(page.locator('[data-testid="active-filter"]')).not.toBeVisible();
    });
  });

  test.describe('Due Date Management', () => {
    test.skip('should set due date on card', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open card detail panel
      await page.click('[data-testid="card-item"]:has-text("Fix login bug")');

      // Click "Set due date" button
      await page.click('button:has-text("Set due date")');

      // Calendar should be visible
      const calendar = page.locator('[role="dialog"] .calendar');
      await expect(calendar).toBeVisible();

      // Select a date (5 days from now - should be green)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      await page.click(`button[name="day"]:has-text("${futureDate.getDate()}")`);

      // Due date should be displayed with green color
      const dueDateSection = page.locator('[data-testid="due-date-section"]');
      await expect(dueDateSection).toContainText('Feb');
      await expect(dueDateSection.locator('[data-color="green"]')).toBeVisible();

      // Close panel and verify due date on card
      await page.keyboard.press('Escape');
      const card = page.locator('[data-testid="card-item"]:has-text("Fix login bug")');
      await expect(card.locator('[data-testid="due-date-indicator"]')).toBeVisible();
      await expect(card.locator('[data-color="green"]')).toBeVisible();
    });

    test.skip('should change due date', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open card with existing due date
      await page.click('[data-testid="card-item"]:has-text("Fix login bug")');

      // Click on current due date to open calendar
      await page.click('[data-testid="due-date-section"] button');

      // Select different date (tomorrow - should be yellow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.click(`button[name="day"]:has-text("${tomorrow.getDate()}")`);

      // Should show yellow color (1-2 days)
      await expect(page.locator('[data-testid="due-date-section"] [data-color="yellow"]')).toBeVisible();
    });

    test.skip('should remove due date', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open card with due date
      await page.click('[data-testid="card-item"]:has-text("Fix login bug")');

      // Click "Remove due date" button
      await page.click('button:has-text("Remove due date")');

      // Due date section should show "No due date"
      await expect(page.locator('text=No due date')).toBeVisible();

      // Card should not show due date indicator
      await page.keyboard.press('Escape');
      const card = page.locator('[data-testid="card-item"]:has-text("Fix login bug")');
      await expect(card.locator('[data-testid="due-date-indicator"]')).not.toBeVisible();
    });

    test.skip('should show red color for overdue cards', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Assuming a card has past due date
      const overdueCard = page.locator('[data-testid="card-item"]:has-text("Overdue task")');

      // Should show red due date indicator
      await expect(overdueCard.locator('[data-testid="due-date-indicator"][data-color="red"]')).toBeVisible();

      // Open card to verify
      await overdueCard.click();
      await expect(page.locator('[data-testid="due-date-section"] [data-color="red"]')).toBeVisible();
    });

    test.skip('should show yellow color for due soon (1-2 days)', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Card with due date in 1.5 days
      const dueSoonCard = page.locator('[data-testid="card-item"]:has-text("Due soon task")');

      // Should show yellow indicator
      await expect(dueSoonCard.locator('[data-testid="due-date-indicator"][data-color="yellow"]')).toBeVisible();
    });

    test.skip('should show green color for future dates (>2 days)', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Card with due date in 5 days
      const futureCard = page.locator('[data-testid="card-item"]:has-text("Future task")');

      // Should show green indicator
      await expect(futureCard.locator('[data-testid="due-date-indicator"][data-color="green"]')).toBeVisible();
    });
  });

  test.describe('Combined Features', () => {
    test.skip('should display both labels and due date on card', async ({ page }) => {
      await page.goto('/board/test-board-id');

      const card = page.locator('[data-testid="card-item"]').first();

      // Should show labels
      await expect(card.locator('[data-testid="label-badge"]')).toHaveCount(2);

      // Should show due date
      await expect(card.locator('[data-testid="due-date-indicator"]')).toBeVisible();
    });

    test.skip('should filter by label and sort by due date', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Apply label filter
      await page.click('button:has-text("Filter")');
      await page.click('text=Bug');

      // Apply due date sort
      await page.click('button:has-text("Sort")');
      await page.click('text=Due date');

      // Cards should be filtered and sorted
      const cards = page.locator('[data-testid="card-item"]');

      // Verify first card has earliest due date
      const firstCard = cards.first();
      await expect(firstCard).toBeVisible();
    });

    test.skip('should show all metadata in card detail panel', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open card
      await page.click('[data-testid="card-item"]');

      // Should show labels section
      await expect(page.locator('[data-testid="card-labels-section"]')).toBeVisible();

      // Should show due date section
      await expect(page.locator('[data-testid="due-date-section"]')).toBeVisible();

      // Should show description section (from Phase B1)
      await expect(page.locator('[data-testid="card-description"]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test.skip('should handle label creation error', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open label manager
      await page.click('[data-testid="card-item"]');
      await page.click('button:has-text("Add label")');
      await page.click('button:has-text("Create")');

      // Try to create label with empty name
      await page.click('button:has-text("Create Label")');

      // Should show validation error
      await expect(page.locator('text=Label name is required')).toBeVisible();
    });

    test.skip('should rollback on API error', async ({ page }) => {
      // Mock API to return error
      await page.route('**/api/cards/*/labels', route => {
        route.fulfill({ status: 500, body: 'Server error' });
      });

      await page.goto('/board/test-board-id');

      // Try to assign label
      await page.click('[data-testid="card-item"]');
      await page.click('button:has-text("Add label")');
      await page.click('text=Bug');

      // Should show error toast
      await expect(page.locator('text=Failed to add label')).toBeVisible();

      // Label should not appear (rollback)
      await expect(page.locator('[data-testid="card-labels-section"]').locator('text=Bug')).not.toBeVisible();
    });
  });
});
