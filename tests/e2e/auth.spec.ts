
import { test, expect } from '@playwright/test';

test.describe('Authentication and Core Flows', () => {

  const acceptCookies = async (page: any) => {
    try {
      await page.waitForSelector('button:has-text("Accept")', { timeout: 2000 });
      await page.getByRole('button', { name: 'Accept' }).click();
    } catch (e) {
      // Ignore if the banner is not present
    }
  };

  test('should allow a user to sign up, see the dashboard, and log out', async ({ page }) => {
    await page.goto('/signup');
    await acceptCookies(page);

    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('button', { name: /user/i }).click();
    await expect(page.getByText(uniqueEmail)).toBeVisible();

    await page.getByRole('menuitem', { name: 'Log out' }).click();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should allow a user to log in and log out', async ({ page }) => {
    const uniqueEmail = `login_user_${Date.now()}@example.com`;
    
    await page.goto('/signup');
    await acceptCookies(page);
    await page.getByLabel('Full Name').fill('Login User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('button', { name: /user/i }).click();
    await page.getByRole('menuitem', { name: 'Log out' }).click();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    
    await page.goto('/login');
    await acceptCookies(page);
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await page.getByRole('button', { name: /user/i }).click();
    await expect(page.getByText(uniqueEmail)).toBeVisible();
  });

  test('should display legal links in the portfolio footer and navigate correctly', async ({ page }) => {
    // We can test this on a sample portfolio page of a non-existent user,
    // as the footer is always rendered.
    await page.goto('/portfolio/sample-user');
    await acceptCookies(page);
    
    // Check for Terms & Conditions
    await page.getByRole('link', { name: 'Terms & Conditions' }).click();
    await expect(page).toHaveURL('/terms-and-conditions');
    await expect(page.getByRole('heading', { name: 'Terms and Conditions' })).toBeVisible();

    // Check for Privacy Policy
    await page.goto('/portfolio/sample-user');
    await page.getByRole('link', { name: 'Privacy Policy' }).click();
    await expect(page).toHaveURL('/privacy-policy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();

    // Check for Cookie Policy
    await page.goto('/portfolio/sample-user');
    await page.getByRole('link', { name: 'Cookie Policy' }).click();
    await expect(page).toHaveURL('/cookie-policy');
    await expect(page.getByRole('heading', { name: 'Cookie Policy' })).toBeVisible();
  });
});
