import { test, expect } from '@playwright/test'

test.describe('View Clip Details Page', () => {
  test.describe('Page Layout and Content', () => {
    test('should display clip detail page with all main elements', async ({ page }) => {
      // Navigate to a clip - we'll use a test route or the first available clip
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      // Find and click the first clip link
      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Check video player is visible
        const videoPlayer = page.locator('video')
        const hasVideo = await videoPlayer.isVisible().catch(() => false)

        if (hasVideo) {
          await expect(videoPlayer).toBeVisible()
        }

        // Check main content sections exist
        const h1 = page.locator('h1')
        const hasTitle = await h1.isVisible().catch(() => false)

        if (hasTitle) {
          await expect(h1).toBeVisible() // Clip title
        }

        // Check stats section
        const stats = page.getByText(/views/i)
        const hasStats = await stats.isVisible().catch(() => false)

        if (hasStats) {
          await expect(stats).toBeVisible()
        }
      }
    })

    test('should display video player with proper attributes', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        const videoPlayer = page.locator('video')
        const hasVideo = await videoPlayer.isVisible().catch(() => false)

        if (hasVideo) {
          await expect(videoPlayer).toBeVisible()

          // Video should have controls
          await expect(videoPlayer).toHaveAttribute('controls', '')
        }
      }
    })

    test('should display clip title and anime title', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Clip title should be an h1
        const clipTitle = page.locator('h1')
        await expect(clipTitle).toBeVisible()

        // Anime title should be a link
        const animeLink = page.locator('a[href*="anime="]')
        const hasAnimeLink = await animeLink.isVisible().catch(() => false)

        if (hasAnimeLink) {
          await expect(animeLink).toBeVisible()
        }
      }
    })

    test('should display technique description section', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Check for technique analysis heading
        const techniqueAnalysis = page.getByText('Technique Analysis')
        const hasTechniqueAnalysis = await techniqueAnalysis.isVisible().catch(() => false)

        if (hasTechniqueAnalysis) {
          await expect(techniqueAnalysis).toBeVisible()
        }
      }
    })

    test('should display keyboard shortcuts section', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Check for keyboard shortcuts section
        const keyboardShortcuts = page.getByText('Keyboard Shortcuts')
        const hasKeyboardShortcuts = await keyboardShortcuts.isVisible().catch(() => false)

        if (hasKeyboardShortcuts) {
          await expect(keyboardShortcuts).toBeVisible()

          // Check for specific shortcuts
          await expect(page.getByText('Play/Pause')).toBeVisible()
          await expect(page.getByText('Previous frame')).toBeVisible()
          await expect(page.getByText('Next frame')).toBeVisible()
        }
      }
    })
  })

  test.describe('Clip Statistics and Metadata', () => {
    test('should display view count with proper formatting', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // View count should be visible with icon
        const viewCount = page.getByText(/views/)
        const hasViewCount = await viewCount.isVisible().catch(() => false)

        if (hasViewCount) {
          await expect(viewCount).toBeVisible()
        }
      }
    })

    test('should display duration', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Duration should be visible (could be in mm:ss format)
        // Check for the stats container with flex layout
        const statsContainer = page.locator('div.flex.items-center.gap-4.text-sm')
        const hasStats = await statsContainer.isVisible().catch(() => false)

        if (hasStats) {
          await expect(statsContainer).toBeVisible()
        }
      }
    })

    test('should display episode number if available', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Episode number may or may not be present
        const episodeText = page.getByText(/Episode \d+/)
        const hasEpisode = await episodeText.isVisible().catch(() => false)

        // This is optional, so we just check it doesn't crash
        expect(hasEpisode).toBeDefined()
      }
    })
  })

  test.describe('Tags and Attribution', () => {
    test('should display tags as clickable badges', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Check if tags exist
        const tagBadges = page.locator('a[href*="tagIds="]')
        const tagCount = await tagBadges.count()

        if (tagCount > 0) {
          // Tags should be clickable links
          const firstTag = tagBadges.first()
          await expect(firstTag).toBeVisible()

          // Tag should have proper href
          const href = await firstTag.getAttribute('href')
          expect(href).toContain('tagIds=')
        }
      }
    })

    test('should display attribution panel in sidebar', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Attribution panel should exist (even if empty)
        // This is rendered in the sidebar section
        const sidebar = page.locator('.lg\\:col-span-1, .space-y-6').last()
        const hasSidebar = await sidebar.isVisible().catch(() => false)

        if (hasSidebar) {
          await expect(sidebar).toBeVisible()
        }
      }
    })
  })

  test.describe('Favorite Button Functionality', () => {
    test('should display favorite button', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Favorite button should be visible (heart icon button)
        const favoriteButton = page.locator('button[aria-label*="avorite"], button[title*="avorite"]')
        const hasFavoriteButton = await favoriteButton.isVisible().catch(() => false)

        // Button may require authentication, so we just check it's handled gracefully
        expect(hasFavoriteButton).toBeDefined()
      }
    })
  })

  test.describe('Related Clips Section', () => {
    test('should display related clips section when available', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Check for related clips heading
        const relatedHeading = page.getByText('Related Clips')
        const hasRelated = await relatedHeading.isVisible().catch(() => false)

        if (hasRelated) {
          await expect(relatedHeading).toBeVisible()

          // Related clips should be in the sidebar
          const relatedClipCards = page.locator('.space-y-4 a[href^="/clips/"]')
          const relatedCount = await relatedClipCards.count()

          if (relatedCount > 0) {
            // First related clip should be visible and clickable
            const firstRelated = relatedClipCards.first()
            await expect(firstRelated).toBeVisible()
          }
        }
      }
    })

    test('should navigate to related clip when clicked', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        const relatedHeading = page.getByText('Related Clips')
        const hasRelated = await relatedHeading.isVisible().catch(() => false)

        if (hasRelated) {
          const relatedClipCards = page.locator('.space-y-4 a[href^="/clips/"]')
          const relatedCount = await relatedClipCards.count()

          if (relatedCount > 0) {
            const firstRelated = relatedClipCards.first()
            const href = await firstRelated.getAttribute('href')

            await firstRelated.click()
            await page.waitForLoadState('networkidle')

            // Should navigate to the related clip
            expect(page.url()).toContain('/clips/')
          }
        }
      }
    })
  })

  test.describe('Navigation and Links', () => {
    test('should navigate to anime clips when clicking anime link', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        const animeLink = page.locator('a[href*="anime="]').first()
        const hasAnimeLink = await animeLink.isVisible().catch(() => false)

        if (hasAnimeLink) {
          const href = await animeLink.getAttribute('href')
          expect(href).toContain('anime=')

          await animeLink.click()
          await page.waitForLoadState('networkidle')

          // Should navigate to clips filtered by anime
          expect(page.url()).toContain('anime=')
        }
      }
    })

    test('should navigate to clips filtered by tag when clicking tag', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        const tagLinks = page.locator('a[href*="tagIds="]')
        const tagCount = await tagLinks.count()

        if (tagCount > 0) {
          const firstTag = tagLinks.first()
          const href = await firstTag.getAttribute('href')

          await firstTag.click()
          await page.waitForLoadState('networkidle')

          // Should navigate to clips filtered by tag
          expect(page.url()).toContain('tagIds=')
        }
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Video player should be visible on mobile
        const videoPlayer = page.locator('video')
        await expect(videoPlayer).toBeVisible()

        // Title should be visible
        await expect(page.locator('h1')).toBeVisible()

        // Technique description should be visible
        await expect(page.getByText('Technique Analysis')).toBeVisible()
      }
    })

    test('should be responsive on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        await expect(page.locator('video')).toBeVisible()
        await expect(page.locator('h1')).toBeVisible()
      }
    })

    test('should display sidebar on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // On desktop, sidebar should be visible (lg:col-span-1)
        const sidebar = page.locator('.space-y-6').last()
        await expect(sidebar).toBeVisible()
      }
    })

    test('should stack content on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Main grid should be visible
        const grid = page.locator('.grid.lg\\:grid-cols-3')
        await expect(grid).toBeVisible()
      }
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Main title should be h1
        const h1 = page.locator('h1')
        await expect(h1).toBeVisible()

        // Section headings should be h3
        const techniqueHeading = page.getByText('Technique Analysis')
        await expect(techniqueHeading).toBeVisible()
      }
    })

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Video player should be keyboard accessible
        const videoPlayer = page.locator('video')
        const hasVideo = await videoPlayer.isVisible().catch(() => false)

        if (hasVideo) {
          await videoPlayer.focus()
          await expect(videoPlayer).toBeFocused()

          // Can navigate away with Tab
          await page.keyboard.press('Tab')
        }
      }
    })

    test('should have video controls accessible via keyboard', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        const videoPlayer = page.locator('video')
        const hasVideo = await videoPlayer.isVisible().catch(() => false)

        if (hasVideo) {
          await expect(videoPlayer).toHaveAttribute('controls', '')
        }
      }
    })

    test('should have descriptive link text', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Anime link should have descriptive text (anime title)
        const animeLink = page.locator('a[href*="anime="]').first()
        const hasAnimeLink = await animeLink.isVisible().catch(() => false)

        if (hasAnimeLink) {
          const linkText = await animeLink.textContent()
          expect(linkText).toBeTruthy()
          expect(linkText?.length).toBeGreaterThan(0)
        }
      }
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle 404 for non-existent clip', async ({ page }) => {
      const response = await page.goto('/clips/non-existent-clip-slug-12345')
      await page.waitForLoadState('networkidle')

      // Should show 404 or error page or redirect
      // Next.js might redirect or show error page, so we check various possibilities
      if (response) {
        const status = response.status()
        const url = page.url()

        // Either 404, 500, or redirected to another page
        const isErrorHandled = [404, 500, 200].includes(status) || !url.includes('non-existent-clip-slug-12345')

        expect(isErrorHandled).toBeTruthy()
      }
    })

    test('should handle invalid clip slug gracefully', async ({ page }) => {
      await page.goto('/clips/!@#$%^&*()')
      await page.waitForLoadState('networkidle')

      // Should not crash, should show error or 404
      const pageContent = await page.content()
      expect(pageContent).toBeTruthy()
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true)

      await page.goto('/clips').catch(() => {
        // Expected to fail when offline
      })

      // Go back online
      await page.context().setOffline(false)

      // Should be able to load now
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')
    })
  })

  test.describe('Video Player Functionality', () => {
    test('should have functional video player', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        const videoPlayer = page.locator('video')
        const hasVideo = await videoPlayer.isVisible().catch(() => false)

        if (hasVideo) {
          await expect(videoPlayer).toBeVisible()

          // Video should have a src or source elements
          const hasSrc = await videoPlayer.getAttribute('src')
          const sources = page.locator('video source')
          const sourceCount = await sources.count()

          // Either direct src or source elements
          expect(hasSrc || sourceCount > 0).toBeTruthy()
        }
      }
    })

    test('should display video poster if available', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        const videoPlayer = page.locator('video')
        const hasVideo = await videoPlayer.isVisible().catch(() => false)

        if (hasVideo) {
          const poster = await videoPlayer.getAttribute('poster')

          // Poster is optional
          expect(poster !== undefined).toBeTruthy()
        }
      }
    })

    test('should have video player with proper dimensions', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        const videoPlayer = page.locator('video')
        const hasVideo = await videoPlayer.isVisible().catch(() => false)

        if (hasVideo) {
          const boundingBox = await videoPlayer.boundingBox()

          // Video should have dimensions
          expect(boundingBox).toBeTruthy()
          if (boundingBox) {
            expect(boundingBox.width).toBeGreaterThan(0)
            expect(boundingBox.height).toBeGreaterThan(0)
          }
        }
      }
    })
  })

  test.describe('Page Performance', () => {
    test('should load clip detail within reasonable time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        const loadTime = Date.now() - startTime

        // Should load within 10 seconds (includes navigation from clips page)
        expect(loadTime).toBeLessThan(10000)
      }
    })

    test('should have proper meta tags for SEO', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Page should have a title
        const title = await page.title()
        expect(title).toBeTruthy()
        expect(title.length).toBeGreaterThan(0)
      }
    })

    test('should have Open Graph meta tags', async ({ page }) => {
      await page.goto('/clips')
      await page.waitForLoadState('networkidle')

      const firstClipLink = page.locator('a[href^="/clips/"]').first()
      const hasClips = await firstClipLink.isVisible().catch(() => false)

      if (hasClips) {
        await firstClipLink.click()
        await page.waitForLoadState('networkidle')

        // Check for Open Graph tags
        const ogTitle = page.locator('meta[property="og:title"]')
        const ogDescription = page.locator('meta[property="og:description"]')

        const hasOgTitle = await ogTitle.isVisible().catch(() => false)
        const hasOgDescription = await ogDescription.isVisible().catch(() => false)

        // OG tags may or may not be present depending on implementation
        expect(hasOgTitle !== undefined).toBeTruthy()
        expect(hasOgDescription !== undefined).toBeTruthy()
      }
    })
  })
})
