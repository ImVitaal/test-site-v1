import { auth } from './config'
import { redirect } from 'next/navigation'
import type { UserRole } from '@prisma/client'

export async function getSession() {
  return await auth()
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/login')
  }
  return session.user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect('/')
  }
  return user
}

export async function requireModerator() {
  return requireRole(['MODERATOR', 'ADMIN'])
}

export async function requireAdmin() {
  return requireRole(['ADMIN'])
}

export function canModerate(userRole: UserRole): boolean {
  return userRole === 'MODERATOR' || userRole === 'ADMIN'
}

export function canContribute(userRole: UserRole): boolean {
  return userRole !== 'USER' || userRole === 'CONTRIBUTOR'
}

export function getTrustLevel(trustScore: number): string {
  if (trustScore >= 201) return 'Expert'
  if (trustScore >= 51) return 'Trusted'
  if (trustScore >= 11) return 'Contributor'
  return 'New User'
}
