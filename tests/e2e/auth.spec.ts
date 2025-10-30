import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow a user to sign up and land on the dashboard', async ({ page }) => {
    await page.goto('/signup');

    // Generate a unique email for each test run to avoid conflicts
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    
    // Fill out the sign-up form
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');
    
    // Click the "Sign Up" button
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // After sign-up, the user should be redirected to the dashboard.
    // We can verify this by checking the URL and looking for a key element on the page.
    await expect(page).toHaveURL('/');
    
    // Check for a welcome message or a dashboard-specific element
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Check that the user navigation shows the correct user email
    await page.getByRole('button', { name: 'Open user menu' }).click();
    await expect(page.getByText(uniqueEmail)).toBeVisible();
  });

  test('should allow a user to log in and log out', async ({ page }) => {
    const uniqueEmail = `login_user_${Date.now()}@example.com`;
    
    // First, create a user to log in with
    await page.goto('/signup');
    await page.getByLabel('Full Name').fill('Login User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Log out
    await page.getByRole('button', { name: /user/i }).click(); // Regex for user avatar button
    await page.getByRole('menuitem', { name: 'Log out' }).click();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    // Log in
    await page.goto('/login');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify successful login
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await page.getByRole('button', { name: /user/i }).click();
    await expect(page.getByText(uniqueEmail)).toBeVisible();
  });
});
