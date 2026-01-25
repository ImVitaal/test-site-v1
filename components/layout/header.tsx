'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { mainNav } from '@/config/navigation'

interface HeaderProps {
  user?: {
    name: string | null
    image: string | null
  } | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-display text-xl font-bold text-gradient">Sakuga Legends</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-accent',
                pathname === item.href ? 'text-accent' : 'text-foreground-muted'
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Search & User */}
        <div className="flex items-center space-x-4">
          {/* Search Button */}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Search className="h-4 w-4 mr-2" />
            <span className="text-foreground-muted">Search...</span>
            <kbd className="ml-4 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-surface px-1.5 font-mono text-[10px] font-medium sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* User Menu */}
          {user ? (
            <Link href="/profile">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block py-2 text-sm font-medium transition-colors hover:text-accent',
                  pathname === item.href ? 'text-accent' : 'text-foreground-muted'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
