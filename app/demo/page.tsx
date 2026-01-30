'use client'

export default function DemoPage() {
  const mockClips = [
    {
      id: '1',
      title: 'Amazing Sword Fight Scene',
      thumbnailUrl: 'https://placehold.co/600x400/1a1a1a/white?text=Sakuga+Clip+1',
      anime: { title: 'Sword Art Online' },
      animators: [{ name: 'Yutaka Nakamura' }]
    },
    {
      id: '2',
      title: 'Epic Transformation Sequence',
      thumbnailUrl: 'https://placehold.co/600x400/2a2a2a/white?text=Sakuga+Clip+2',
      anime: { title: 'My Hero Academia' },
      animators: [{ name: 'Yoshimichi Kameda' }]
    },
    {
      id: '3',
      title: 'Intense Action Choreography',
      thumbnailUrl: 'https://placehold.co/600x400/3a3a3a/white?text=Sakuga+Clip+3',
      anime: { title: 'Demon Slayer' },
      animators: [{ name: 'Ufotable Team' }]
    },
  ]

  const featuredAnimator = {
    name: 'Yutaka Nakamura',
    bio: 'Legendary animator known for his dynamic and fluid action sequences',
    totalClips: 47,
    signatureClip: {
      title: 'One Punch Man - Saitama vs Genos',
      videoUrl: 'https://placehold.co/1920x1080/111/white?text=Video+Placeholder'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Sakuga Legends
          </h1>
          <nav className="flex gap-6">
            <a href="#" className="hover:text-red-500 transition">Browse</a>
            <a href="#" className="hover:text-red-500 transition">Animators</a>
            <a href="#" className="hover:text-red-500 transition">About</a>
          </nav>
        </div>
      </header>

      {/* Hero Section - Featured Animator */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="rounded-2xl bg-gradient-to-r from-red-900/20 to-orange-900/20 p-8 border border-red-900/30">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-sm uppercase tracking-wide text-red-400 mb-2">Featured Animator</p>
                <h2 className="text-5xl font-bold mb-4">{featuredAnimator.name}</h2>
                <p className="text-zinc-400 text-lg mb-6">{featuredAnimator.bio}</p>
                <div className="flex gap-6 mb-6">
                  <div>
                    <p className="text-3xl font-bold text-red-500">{featuredAnimator.totalClips}</p>
                    <p className="text-sm text-zinc-500">Clips in Archive</p>
                  </div>
                </div>
                <button className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold transition">
                  View Profile
                </button>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center">
                <div className="text-center p-8">
                  <p className="text-zinc-500">Signature Clip:</p>
                  <p className="text-xl font-semibold mt-2">{featuredAnimator.signatureClip.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Clips Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-8">Recent Additions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {mockClips.map((clip) => (
              <div key={clip.id} className="group cursor-pointer">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-zinc-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-600/80 flex items-center justify-center group-hover:scale-110 transition">
                      <div className="w-0 h-0 border-l-8 border-l-white border-y-6 border-y-transparent ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-red-500 transition">{clip.title}</h3>
                <p className="text-sm text-zinc-500">{clip.anime.title}</p>
                <p className="text-xs text-zinc-600">by {clip.animators[0].name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-zinc-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-red-600 rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl">
                🎨
              </div>
              <h3 className="text-xl font-semibold mb-2">Curated Archive</h3>
              <p className="text-zinc-400">Hand-picked sakuga moments from legendary animators</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-600 rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl">
                🔍
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Attribution</h3>
              <p className="text-zinc-400">Learn who animated your favorite scenes</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl">
                📚
              </div>
              <h3 className="text-xl font-semibold mb-2">Educational Resources</h3>
              <p className="text-zinc-400">Explore animator profiles and their techniques</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-4 mt-20">
        <div className="container mx-auto max-w-6xl text-center text-zinc-500">
          <p>© 2026 Sakuga Legends - Celebrating Animation Excellence</p>
          <p className="text-sm mt-2 text-zinc-600">Demo Page (Database Connection Required for Full Site)</p>
        </div>
      </footer>
    </div>
  )
}
