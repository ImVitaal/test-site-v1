export interface NavItem {
  title: string
  href: string
  description?: string
  disabled?: boolean
  external?: boolean
  icon?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const mainNav: NavItem[] = [
  {
    title: 'Animators',
    href: '/animators',
    description: 'Browse and discover talented key animators',
  },
  {
    title: 'Clips',
    href: '/clips',
    description: 'Explore the sakuga clip database',
  },
  {
    title: 'Glossary',
    href: '/glossary',
    description: 'Learn animation terminology',
  },
]

export const userNav: NavItem[] = [
  {
    title: 'Profile',
    href: '/profile',
  },
  {
    title: 'Favorites',
    href: '/favorites',
  },
  {
    title: 'Collections',
    href: '/collections',
  },
]

export const moderatorNav: NavItem[] = [
  {
    title: 'Moderation',
    href: '/moderation',
  },
  {
    title: 'Clip Queue',
    href: '/moderation/clips',
  },
]

export const footerNav: NavSection[] = [
  {
    title: 'Platform',
    items: [
      { title: 'Animators', href: '/animators' },
      { title: 'Clips', href: '/clips' },
      { title: 'Glossary', href: '/glossary' },
      { title: 'Rankings', href: '/rankings' },
    ],
  },
  {
    title: 'Community',
    items: [
      { title: 'Discord', href: 'https://discord.gg/sakugalegends', external: true },
      { title: 'Twitter', href: 'https://twitter.com/sakugalegends', external: true },
      { title: 'Contribute', href: '/contribute' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Service', href: '/terms' },
      { title: 'DMCA', href: '/dmca' },
    ],
  },
]
