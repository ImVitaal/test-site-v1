import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getSession } from '@/lib/auth/utils'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session?.user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
