import { test, expect } from '@playwright/test';

// Note: These tests require Google OAuth to be configured
// For testing without OAuth, you can temporarily modify requireAuth() in api-utils.ts

test.describe('Phase B1: P0 Frontend Tests', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup authentication
    // For now, tests will need manual login or auth mocking
    await page.goto('/');
  });

  test.describe('Authentication', () => {
    test('should redirect to login page when not authenticated', async ({ page }) => {
      // Clear any existing sessions
      await page.context().clearCookies();
      await page.goto('/');

      // Should redirect to /login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should display login page with Google OAuth button', async ({ page }) => {
      await page.goto('/login');

      // Check for Google sign-in button
      const signInButton = page.getByRole('button', { name: /sign in with google/i });
      await expect(signInButton).toBeVisible();
    });
  });

  test.describe('Dashboard & Board List', () => {
    test.skip('should display dashboard after login', async ({ page }) => {
      // This test requires authentication setup
      await page.goto('/');

      // Should show header with user menu
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Should show board list or empty state
      const boardList = page.locator('[data-testid="board-list"]');
      await expect(boardList).toBeVisible();
    });

    test.skip('should open create board modal', async ({ page }) => {
      await page.goto('/');

      // Click create board button
      await page.click('button:has-text("Create Board")');

      // Modal should be visible
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Should have title input
      const titleInput = page.getByLabel(/board title/i);
      await expect(titleInput).toBeVisible();
    });

    test.skip('should create a new board', async ({ page }) => {
      await page.goto('/');

      // Open create board modal
      await page.click('button:has-text("Create Board")');

      // Fill in board title
      await page.fill('input[name="title"]', 'Test Project Board');

      // Select background color (optional)
      const blueColor = page.locator('[data-color="#3b82f6"]');
      if (await blueColor.isVisible()) {
        await blueColor.click();
      }

      // Submit form
      await page.click('button:has-text("Create")');

      // Should show new board in list
      await expect(page.locator('text=Test Project Board')).toBeVisible();
    });
  });

  test.describe('Board Detail Page', () => {
    test.skip('should navigate to board detail page', async ({ page }) => {
      await page.goto('/');

      // Click on a board card
      const boardCard = page.locator('[data-testid="board-card"]').first();
      await boardCard.click();

      // Should navigate to board detail page
      await expect(page).toHaveURL(/\/board\/[a-z0-9-]+/);

      // Should show board header
      const boardHeader = page.locator('[data-testid="board-header"]');
      await expect(boardHeader).toBeVisible();
    });

    test.skip('should display lists and cards', async ({ page }) => {
      // Navigate to a board (replace with actual board ID)
      await page.goto('/board/test-board-id');

      // Should show lists container
      const listsContainer = page.locator('[data-testid="lists-container"]');
      await expect(listsContainer).toBeVisible();
    });
  });

  test.describe('List Management', () => {
    test.skip('should create a new list', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Click add list button
      await page.click('button:has-text("Add List")');

      // Type list title
      await page.fill('input[placeholder*="list"]', 'To Do');

      // Press Enter to submit
      await page.keyboard.press('Enter');

      // Should show new list
      await expect(page.locator('text=To Do')).toBeVisible();
    });

    test.skip('should edit list title', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Click on list title to edit
      const listTitle = page.locator('[data-testid="list-title"]').first();
      await listTitle.click();

      // Edit the title
      await page.fill('input[value*="To Do"]', 'Backlog');
      await page.keyboard.press('Enter');

      // Should show updated title
      await expect(page.locator('text=Backlog')).toBeVisible();
    });

    test.skip('should delete a list', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open list menu
      await page.click('[data-testid="list-menu-button"]');

      // Click delete
      await page.click('button:has-text("Delete")');

      // Confirm deletion
      await page.click('button:has-text("Confirm")');

      // List should be removed
      await expect(page.locator('[data-testid="list"]')).toHaveCount(2);
    });
  });

  test.describe('Card Management', () => {
    test.skip('should create a new card', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Click add card button
      await page.click('button:has-text("Add Card")');

      // Type card title
      await page.fill('textarea[placeholder*="card"]', 'Fix login bug');

      // Press Enter to submit
      await page.keyboard.press('Enter');

      // Should show new card
      await expect(page.locator('text=Fix login bug')).toBeVisible();
    });

    test.skip('should open card detail panel', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Click on a card
      await page.click('[data-testid="card-item"]:has-text("Fix login bug")');

      // Side panel should be visible
      const sidePanel = page.locator('[data-testid="card-detail-panel"]');
      await expect(sidePanel).toBeVisible();

      // Should show card title
      await expect(sidePanel.locator('text=Fix login bug')).toBeVisible();
    });

    test.skip('should edit card description', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open card detail panel
      await page.click('[data-testid="card-item"]');

      // Edit description
      const descriptionTextarea = page.getByLabel(/description/i);
      await descriptionTextarea.fill('Users cannot login with Google OAuth');

      // Click save or auto-save should trigger
      // Assuming there's a save button
      const saveButton = page.locator('button:has-text("Save")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }

      // Should show updated description
      await expect(page.locator('text=Users cannot login with Google OAuth')).toBeVisible();
    });

    test.skip('should delete a card', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open card detail panel
      await page.click('[data-testid="card-item"]:has-text("Fix login bug")');

      // Click delete button
      await page.click('button:has-text("Delete")');

      // Confirm deletion
      await page.click('button:has-text("Confirm")');

      // Card should be removed
      await expect(page.locator('text=Fix login bug')).not.toBeVisible();
    });

    test.skip('should close card detail panel', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Open card detail panel
      await page.click('[data-testid="card-item"]');

      // Close with ESC key
      await page.keyboard.press('Escape');

      // Panel should be hidden
      const sidePanel = page.locator('[data-testid="card-detail-panel"]');
      await expect(sidePanel).not.toBeVisible();
    });
  });

  test.describe('Drag & Drop', () => {
    test.skip('should drag card within same list', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Get first card in list
      const firstCard = page.locator('[data-testid="card-item"]').first();
      const firstCardText = await firstCard.textContent();

      // Get second card in list
      const secondCard = page.locator('[data-testid="card-item"]').nth(1);

      // Drag first card to second position
      await firstCard.dragTo(secondCard);

      // Verify order changed
      const newFirstCard = page.locator('[data-testid="card-item"]').first();
      const newFirstCardText = await newFirstCard.textContent();

      expect(newFirstCardText).not.toBe(firstCardText);
    });

    test.skip('should drag card to different list', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Get a card from first list
      const card = page.locator('[data-testid="list"]').first().locator('[data-testid="card-item"]').first();
      const cardText = await card.textContent();

      // Get second list
      const targetList = page.locator('[data-testid="list"]').nth(1);

      // Drag card to second list
      await card.dragTo(targetList);

      // Verify card moved to second list
      await expect(targetList.locator(`text=${cardText}`)).toBeVisible();
    });

    test.skip('should drag list to reorder', async ({ page }) => {
      await page.goto('/board/test-board-id');

      // Get first list
      const firstList = page.locator('[data-testid="list"]').first();
      const firstListTitle = await firstList.locator('[data-testid="list-title"]').textContent();

      // Get second list
      const secondList = page.locator('[data-testid="list"]').nth(1);

      // Drag first list after second list
      await firstList.dragTo(secondList);

      // Verify order changed
      const newFirstList = page.locator('[data-testid="list"]').first();
      const newFirstListTitle = await newFirstList.locator('[data-testid="list-title"]').textContent();

      expect(newFirstListTitle).not.toBe(firstListTitle);
    });
  });

  test.describe('Dark Mode', () => {
    test.skip('should toggle dark mode', async ({ page }) => {
      await page.goto('/');

      // Click theme toggle
      await page.click('[data-testid="theme-toggle"]');

      // Select dark mode
      await page.click('button:has-text("Dark")');

      // HTML should have dark class
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
    });

    test.skip('should persist theme preference', async ({ page }) => {
      await page.goto('/');

      // Set dark mode
      await page.click('[data-testid="theme-toggle"]');
      await page.click('button:has-text("Dark")');

      // Reload page
      await page.reload();

      // Should still be dark mode
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
    });
  });

  test.describe('User Menu', () => {
    test.skip('should display user menu', async ({ page }) => {
      await page.goto('/');

      // Click user menu trigger
      await page.click('[data-testid="user-menu-trigger"]');

      // Menu should be visible
      const menu = page.locator('[data-testid="user-menu"]');
      await expect(menu).toBeVisible();

      // Should show user email
      await expect(menu).toContainText('@');
    });

    test.skip('should logout', async ({ page }) => {
      await page.goto('/');

      // Open user menu
      await page.click('[data-testid="user-menu-trigger"]');

      // Click logout
      await page.click('button:has-text("Logout")');

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
