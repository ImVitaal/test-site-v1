import slugify from 'slugify'

export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  })
}

export function generateUniqueSlug(text: string, existingSlugs: string[]): string {
  const baseSlug = generateSlug(text)

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug
  }

  let counter = 1
  let uniqueSlug = `${baseSlug}-${counter}`

  while (existingSlugs.includes(uniqueSlug)) {
    counter++
    uniqueSlug = `${baseSlug}-${counter}`
  }

  return uniqueSlug
}
