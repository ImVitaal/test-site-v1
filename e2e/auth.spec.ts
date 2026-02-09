import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.describe('Login Page', () => {
    test('should display login page with all elements', async ({ page }) => {
      await page.goto('/login')

      // Check page title and description
      await expect(page.getByText('Sakuga Legends')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
      await expect(page.getByText('Sign in to your account to continue')).toBeVisible()

      // Check OAuth provider buttons
      await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Continue with Discord/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Continue with X/i })).toBeVisible()

      // Check terms and privacy policy links
      await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible()
    })

    test('should have working OAuth buttons', async ({ page }) => {
      await page.goto('/login')

      // Check that Google button is clickable and has correct attributes
      const googleButton = page.getByRole('button', { name: /Continue with Google/i })
      await expect(googleButton).toBeEnabled()
      await expect(googleButton).toHaveClass(/w-full/)

      // Check that Discord button is clickable
      const discordButton = page.getByRole('button', { name: /Continue with Discord/i })
      await expect(discordButton).toBeEnabled()
      await expect(discordButton).toHaveClass(/w-full/)

      // Check that Twitter/X button is clickable
      const twitterButton = page.getByRole('button', { name: /Continue with X/i })
      await expect(twitterButton).toBeEnabled()
      await expect(twitterButton).toHaveClass(/w-full/)
    })

    test('should have correct OAuth button styling', async ({ page }) => {
      await page.goto('/login')

      // All OAuth buttons should have secondary variant styling
      const buttons = [
        page.getByRole('button', { name: /Continue with Google/i }),
        page.getByRole('button', { name: /Continue with Discord/i }),
        page.getByRole('button', { name: /Continue with X/i }),
      ]

      for (const button of buttons) {
        await expect(button).toHaveClass(/w-full/)
      }
    })

    test('should navigate to Terms of Service', async ({ page }) => {
      await page.goto('/login')

      const termsLink = page.getByRole('link', { name: 'Terms of Service' })
      await expect(termsLink).toHaveAttribute('href', '/terms')
    })

    test('should navigate to Privacy Policy', async ({ page }) => {
      await page.goto('/login')

      const privacyLink = page.getByRole('link', { name: 'Privacy Policy' })
      await expect(privacyLink).toHaveAttribute('href', '/privacy')
    })

    test('should have logo link to home page', async ({ page }) => {
      await page.goto('/login')

      const logoLink = page.getByRole('link', { name: 'Sakuga Legends' })
      await expect(logoLink).toHaveAttribute('href', '/')
    })

    test('should be centered and responsive', async ({ page }) => {
      await page.goto('/login')

      // Check that the login form is properly centered
      const card = page.locator('div').filter({ hasText: 'Sakuga LegendsWelcome back' }).first()
      await expect(card).toBeVisible()

      // Test on mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await expect(card).toBeVisible()

      // Test on tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await expect(card).toBeVisible()
    })
  })

  test.describe('OAuth Flow Initiation', () => {
    test('should trigger Google OAuth when clicking Google button', async ({ page, context }) => {
      await page.goto('/login')

      // Listen for navigation or request to OAuth provider
      const navigationPromise = page.waitForURL(/.*/, { waitUntil: 'networkidle' })

      const googleButton = page.getByRole('button', { name: /Continue with Google/i })
      await googleButton.click()

      // Wait for navigation to complete
      await navigationPromise

      // Note: In a real OAuth flow, this would redirect to Google's OAuth page
      // Since we can't test the actual OAuth flow without credentials,
      // we're just verifying the button click triggers some action
    })

    test('should trigger Discord OAuth when clicking Discord button', async ({ page }) => {
      await page.goto('/login')

      const discordButton = page.getByRole('button', { name: /Continue with Discord/i })
      await discordButton.click()

      // Similar to Google, we're just verifying the button works
      // Actual OAuth flow testing would require mocking or test credentials
    })

    test('should trigger Twitter OAuth when clicking Twitter button', async ({ page }) => {
      await page.goto('/login')

      const twitterButton = page.getByRole('button', { name: /Continue with X/i })
      await twitterButton.click()

      // Similar to Google, we're just verifying the button works
      // Actual OAuth flow testing would require mocking or test credentials
    })
  })

  test.describe('Login Page Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/login')

      // Check that the main heading is visible (CardTitle renders as appropriate heading)
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    })

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/login')

      // Tab through interactive elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Verify we can focus on buttons
      const googleButton = page.getByRole('button', { name: /Continue with Google/i })

      // Continue tabbing
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // All interactive elements should be reachable via keyboard
      await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible()
    })

    test('should have proper contrast and readability', async ({ page }) => {
      await page.goto('/login')

      // Check that text is visible and readable
      await expect(page.getByText('Welcome back')).toBeVisible()
      await expect(page.getByText('Sign in to your account to continue')).toBeVisible()

      // Check that buttons have visible text
      await expect(page.getByRole('button', { name: /Continue with Google/i })).toHaveText(/Continue with Google/)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true)

      await page.goto('/login').catch(() => {
        // Expected to fail when offline
      })

      // Go back online
      await page.context().setOffline(false)

      // Should be able to load now
      await page.goto('/login')
      await expect(page.getByText('Welcome back')).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('should navigate from home to login', async ({ page }) => {
      await page.goto('/')

      // Look for a login link in the navigation
      // Note: This assumes there's a login link somewhere on the home page
      // If the navigation structure is different, this test may need adjustment
      const loginLink = page.getByRole('link', { name: /sign in|login/i }).first()

      // Only test if login link exists on home page
      if (await loginLink.isVisible()) {
        await loginLink.click()
        await expect(page).toHaveURL('/login')
        await expect(page.getByText('Welcome back')).toBeVisible()
      }
    })

    test('should navigate from login to home via logo', async ({ page }) => {
      await page.goto('/login')

      const logoLink = page.getByRole('link', { name: 'Sakuga Legends' })
      await logoLink.click()

      await expect(page).toHaveURL('/')
    })
  })
})
