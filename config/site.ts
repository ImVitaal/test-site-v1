export const siteConfig = {
  name: 'Sakuga Legends',
  description:
    'The definitive platform for celebrating and cataloging the most talented key animators in the anime industry.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://sakugalegends.com',
  ogImage: '/images/og-default.jpg',
  links: {
    twitter: 'https://twitter.com/sakugalegends',
    discord: 'https://discord.gg/sakugalegends',
    github: 'https://github.com/sakugalegends',
  },
  creator: 'Sakuga Legends Team',
  keywords: [
    'sakuga',
    'animation',
    'anime',
    'key animator',
    'animator',
    'animation analysis',
    'anime database',
  ],
}

export type SiteConfig = typeof siteConfig
