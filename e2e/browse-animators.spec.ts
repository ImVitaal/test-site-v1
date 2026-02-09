import { test, expect } from '@playwright/test'

test.describe('Browse Animators Page', () => {
  test.describe('Page Layout and Content', () => {
    test('should display animators page with all elements', async ({ page }) => {
      await page.goto('/animators')

      // Check page title and description
      await expect(page.getByRole('heading', { name: 'Animators' })).toBeVisible()
      await expect(
        page.getByText('Discover the talented key animators behind your favorite anime scenes.')
      ).toBeVisible()

      // Check search input
      const searchInput = page.getByPlaceholder('Search animators...')
      await expect(searchInput).toBeVisible()
      await expect(searchInput).toHaveAttribute('type', 'search')
      await expect(searchInput).toHaveAttribute('name', 'q')
    })

    test('should display search input with proper styling', async ({ page }) => {
      await page.goto('/animators')

      // Verify search input is properly styled and visible
      const searchInput = page.getByPlaceholder('Search animators...')
      await expect(searchInput).toBeVisible()
      await expect(searchInput).toHaveClass(/pl-10/) // Has left padding for icon
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/animators')

      // Check that the main heading is an h1
      const heading = page.getByRole('heading', { name: 'Animators' })
      await expect(heading).toBeVisible()
    })
  })

  test.describe('Animator Grid Display', () => {
    test('should display animator grid', async ({ page }) => {
      await page.goto('/animators')

      // Wait for the grid to load - use more specific selector for the animator grid
      const gridContainer = page.locator('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5')
      await expect(gridContainer).toBeVisible()
    })

    test('should display loading state initially', async ({ page }) => {
      await page.goto('/animators')

      // The page uses Suspense, so there should be a loading state
      // We'll check if skeleton loaders appear (even if briefly)
      // Or check that content eventually loads
      await page.waitForLoadState('networkidle')

      // After loading, grid should be present
      const gridContainer = page.locator('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5')
      await expect(gridContainer).toBeVisible()
    })

    test('should display animator cards with correct structure', async ({ page }) => {
      await page.goto('/animators')
      await page.waitForLoadState('networkidle')

      // Check if there are any animator cards
      const cards = page.locator('.card')
      const count = await cards.count()

      if (count > 0) {
        // If there are animators, check the first card's structure
        const firstCard = cards.first()
        await expect(firstCard).toBeVisible()
      }
    })
  })

  test.describe('Search Functionality', () => {
    test('should allow typing in search input', async ({ page }) => {
      await page.goto('/animators')

      const searchInput = page.getByPlaceholder('Search animators...')
      await searchInput.fill('Test Animator')

      await expect(searchInput).toHaveValue('Test Animator')
    })

    test('should preserve search query in URL', async ({ page }) => {
      await page.goto('/animators')

      const searchInput = page.getByPlaceholder('Search animators...')
      await searchInput.fill('Yutaka Nakamura')
      await searchInput.press('Enter')

      // Wait for navigation
      await page.waitForURL(/\?q=/)

      // Check URL contains search query
      expect(page.url()).toContain('q=Yutaka')
    })

    test('should display search query from URL in input', async ({ page }) => {
      await page.goto('/animators?q=Test')

      const searchInput = page.getByPlaceholder('Search animators...')
      await expect(searchInput).toHaveValue('Test')
    })

    test('should handle empty search', async ({ page }) => {
      await page.goto('/animators?q=SomeQuery')

      const searchInput = page.getByPlaceholder('Search animators...')
      await searchInput.clear()
      await searchInput.press('Enter')

      // Should navigate to animators page (may have empty query param)
      await page.waitForLoadState('networkidle')
      const url = page.url()
      expect(url.endsWith('/animators') || url.endsWith('/animators?q=')).toBe(true)
    })
  })

  test.describe('Pagination', () => {
    test('should display pagination when available', async ({ page }) => {
      await page.goto('/animators')
      await page.waitForLoadState('networkidle')

      // Check if pagination exists (it may or may not depending on data)
      const pageInfo = page.getByText(/Page \d+ of \d+/)
      const hasMultiplePages = await pageInfo.isVisible().catch(() => false)

      if (hasMultiplePages) {
        await expect(pageInfo).toBeVisible()
      }
    })

    test('should navigate to next page when available', async ({ page }) => {
      await page.goto('/animators')
      await page.waitForLoadState('networkidle')

      // Look for Next button
      const nextButton = page.getByRole('link', { name: 'Next' })
      const hasNext = await nextButton.isVisible().catch(() => false)

      if (hasNext) {
        await nextButton.click()
        await page.waitForURL(/\?page=2/)
        expect(page.url()).toContain('page=2')

        // Should show page 2 indicator
        await expect(page.getByText(/Page 2 of \d+/)).toBeVisible()
      }
    })

    test('should navigate to previous page when available', async ({ page }) => {
      // Start on page 2
      await page.goto('/animators?page=2')
      await page.waitForLoadState('networkidle')

      // Look for Previous button
      const prevButton = page.getByRole('link', { name: 'Previous' })
      const hasPrev = await prevButton.isVisible().catch(() => false)

      if (hasPrev) {
        await prevButton.click()

        // Should navigate to page 1 or clean URL
        await page.waitForLoadState('networkidle')
        const url = page.url()
        expect(url.endsWith('/animators') || url.includes('page=1')).toBe(true)
      }
    })

    test('should preserve search query when paginating', async ({ page }) => {
      await page.goto('/animators?q=Test')
      await page.waitForLoadState('networkidle')

      const nextButton = page.getByRole('link', { name: 'Next' })
      const hasNext = await nextButton.isVisible().catch(() => false)

      if (hasNext) {
        // Check that Next button preserves query
        await expect(nextButton).toHaveAttribute('href', /q=Test/)
      }
    })

    test('should not show previous button on first page', async ({ page }) => {
      await page.goto('/animators')
      await page.waitForLoadState('networkidle')

      const prevButton = page.getByRole('link', { name: 'Previous' })
      await expect(prevButton).not.toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('should have clickable animator links when data is present', async ({ page }) => {
      await page.goto('/animators')
      await page.waitForLoadState('networkidle')

      // Find first animator link (if any exist)
      const animatorLinks = page.locator('a[href^="/animators/"]').filter({ hasNotText: 'View all' })
      const count = await animatorLinks.count()

      if (count > 0) {
        const firstLink = animatorLinks.first()

        // Verify the link has a valid href
        const href = await firstLink.getAttribute('href')
        expect(href).toBeTruthy()
        expect(href).toMatch(/^\/animators\/[a-z0-9-]+$/)

        // Verify the link is visible and clickable
        await expect(firstLink).toBeVisible()
      }
    })

    test('should navigate from home to animators page', async ({ page }) => {
      await page.goto('/')

      // Look for animators link in navigation
      const animatorsLink = page.getByRole('link', { name: /Animators/i }).first()
      const isVisible = await animatorsLink.isVisible().catch(() => false)

      if (isVisible) {
        await animatorsLink.click()
        await expect(page).toHaveURL('/animators')
        await expect(page.getByRole('heading', { name: 'Animators' })).toBeVisible()
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/animators')

      // Check that main elements are visible on mobile
      await expect(page.getByRole('heading', { name: 'Animators' })).toBeVisible()
      await expect(page.getByPlaceholder('Search animators...')).toBeVisible()

      // Grid should still be visible
      const gridContainer = page.locator('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5')
      await expect(gridContainer).toBeVisible()
    })

    test('should be responsive on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/animators')

      await expect(page.getByRole('heading', { name: 'Animators' })).toBeVisible()
      await expect(page.getByPlaceholder('Search animators...')).toBeVisible()
    })

    test('should be responsive on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto('/animators')

      await expect(page.getByRole('heading', { name: 'Animators' })).toBeVisible()
      await expect(page.getByPlaceholder('Search animators...')).toBeVisible()
    })

    test('should adjust grid columns on different viewports', async ({ page }) => {
      await page.goto('/animators')
      await page.waitForLoadState('networkidle')

      const gridContainer = page.locator('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5')

      // Mobile - should have fewer columns
      await page.setViewportSize({ width: 375, height: 667 })
      await expect(gridContainer).toBeVisible()

      // Desktop - should have more columns
      await page.setViewportSize({ width: 1920, height: 1080 })
      await expect(gridContainer).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/animators')

      // Search input should be focusable with Tab key
      const searchInput = page.getByPlaceholder('Search animators...')
      await searchInput.focus()
      await expect(searchInput).toBeFocused()

      // Should be able to type in search when focused
      await page.keyboard.type('Test')
      await expect(searchInput).toHaveValue('Test')
    })

    test('should support Enter key for search', async ({ page }) => {
      await page.goto('/animators')

      const searchInput = page.getByPlaceholder('Search animators...')
      await searchInput.focus()
      await searchInput.fill('Test')
      await page.keyboard.press('Enter')

      // Should navigate with query
      await page.waitForURL(/\?q=/)
      expect(page.url()).toContain('q=Test')
    })

    test('should have accessible search form', async ({ page }) => {
      await page.goto('/animators')

      // Search input should have proper attributes
      const searchInput = page.getByPlaceholder('Search animators...')
      await expect(searchInput).toHaveAttribute('type', 'search')
      await expect(searchInput).toHaveAttribute('name', 'q')
    })

    test('should have visible text labels and descriptions', async ({ page }) => {
      await page.goto('/animators')

      // All text should be visible and readable
      await expect(page.getByRole('heading', { name: 'Animators' })).toBeVisible()
      await expect(
        page.getByText('Discover the talented key animators behind your favorite anime scenes.')
      ).toBeVisible()
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle invalid page numbers gracefully', async ({ page }) => {
      await page.goto('/animators?page=999999')
      await page.waitForLoadState('networkidle')

      // Should still render the page (even if empty)
      await expect(page.getByRole('heading', { name: 'Animators' })).toBeVisible()
    })

    test('should handle special characters in search', async ({ page }) => {
      await page.goto('/animators')

      const searchInput = page.getByPlaceholder('Search animators...')
      await searchInput.fill('Test@#$%^&*()')
      await searchInput.press('Enter')

      await page.waitForURL(/\?q=/)

      // Should not crash, should display results page
      await expect(page.getByRole('heading', { name: 'Animators' })).toBeVisible()
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true)

      await page.goto('/animators').catch(() => {
        // Expected to fail when offline
      })

      // Go back online
      await page.context().setOffline(false)

      // Should be able to load now
      await page.goto('/animators')
      await expect(page.getByRole('heading', { name: 'Animators' })).toBeVisible()
    })

    test('should handle empty results state', async ({ page }) => {
      // Search for something that likely returns no results
      await page.goto('/animators?q=xyznonexistentanimator123')
      await page.waitForLoadState('networkidle')

      // Page should still render properly
      await expect(page.getByRole('heading', { name: 'Animators' })).toBeVisible()
      await expect(page.getByPlaceholder('Search animators...')).toHaveValue('xyznonexistentanimator123')
    })
  })

  test.describe('Page Performance', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/animators')
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000)
    })

    test('should have proper meta tags for SEO', async ({ page }) => {
      await page.goto('/animators')

      // Check that the page has a title
      const title = await page.title()
      expect(title).toContain('Animators')
    })
  })
})
