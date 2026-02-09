import { PrismaClient, Role, VerificationStatus, SubmissionStatus, RelationType, RankingType, RankingCategory, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Sakuga Legends database...\n')

  // ============================================
  // STUDIOS
  // ============================================
  console.log('Creating studios...')
  const studios = await Promise.all([
    prisma.studio.upsert({
      where: { slug: 'studio-ghibli' },
      update: {},
      create: {
        slug: 'studio-ghibli',
        name: 'Studio Ghibli',
        nativeName: 'スタジオジブリ',
        founded: 1985,
        logoUrl: null,
      },
    }),
    prisma.studio.upsert({
      where: { slug: 'bones' },
      update: {},
      create: {
        slug: 'bones',
        name: 'Bones',
        nativeName: 'ボンズ',
        founded: 1998,
        logoUrl: null,
      },
    }),
    prisma.studio.upsert({
      where: { slug: 'sunrise' },
      update: {},
      create: {
        slug: 'sunrise',
        name: 'Sunrise',
        nativeName: 'サンライズ',
        founded: 1972,
        dissolved: 2024,
        logoUrl: null,
      },
    }),
    prisma.studio.upsert({
      where: { slug: 'gainax' },
      update: {},
      create: {
        slug: 'gainax',
        name: 'Gainax',
        nativeName: 'ガイナックス',
        founded: 1984,
        logoUrl: null,
      },
    }),
    prisma.studio.upsert({
      where: { slug: 'madhouse' },
      update: {},
      create: {
        slug: 'madhouse',
        name: 'Madhouse',
        nativeName: 'マッドハウス',
        founded: 1972,
        logoUrl: null,
      },
    }),
    prisma.studio.upsert({
      where: { slug: 'toei-animation' },
      update: {},
      create: {
        slug: 'toei-animation',
        name: 'Toei Animation',
        nativeName: '東映アニメーション',
        founded: 1948,
        logoUrl: null,
      },
    }),
    prisma.studio.upsert({
      where: { slug: 'kyoto-animation' },
      update: {},
      create: {
        slug: 'kyoto-animation',
        name: 'Kyoto Animation',
        nativeName: '京都アニメーション',
        founded: 1981,
        logoUrl: null,
      },
    }),
    prisma.studio.upsert({
      where: { slug: 'mappa' },
      update: {},
      create: {
        slug: 'mappa',
        name: 'MAPPA',
        nativeName: 'MAPPA',
        founded: 2011,
        logoUrl: null,
      },
    }),
    prisma.studio.upsert({
      where: { slug: 'ufotable' },
      update: {},
      create: {
        slug: 'ufotable',
        name: 'ufotable',
        nativeName: 'ユーフォーテーブル',
        founded: 2000,
        logoUrl: null,
      },
    }),
    prisma.studio.upsert({
      where: { slug: 'trigger' },
      update: {},
      create: {
        slug: 'trigger',
        name: 'Studio Trigger',
        nativeName: 'トリガー',
        founded: 2011,
        logoUrl: null,
      },
    }),
  ])
  console.log(`  Created ${studios.length} studios`)

  // ============================================
  // ANIME
  // ============================================
  console.log('Creating anime series...')
  const anime = await Promise.all([
    prisma.anime.upsert({
      where: { slug: 'akira' },
      update: {},
      create: {
        slug: 'akira',
        title: 'Akira',
        nativeTitle: 'アキラ',
        romajiTitle: 'Akira',
        year: 1988,
        season: 'summer',
        malId: 47,
      },
    }),
    prisma.anime.upsert({
      where: { slug: 'spirited-away' },
      update: {},
      create: {
        slug: 'spirited-away',
        title: 'Spirited Away',
        nativeTitle: '千と千尋の神隠し',
        romajiTitle: 'Sen to Chihiro no Kamikakushi',
        year: 2001,
        season: 'summer',
        malId: 199,
      },
    }),
    prisma.anime.upsert({
      where: { slug: 'cowboy-bebop' },
      update: {},
      create: {
        slug: 'cowboy-bebop',
        title: 'Cowboy Bebop',
        nativeTitle: 'カウボーイビバップ',
        romajiTitle: 'Cowboy Bebop',
        year: 1998,
        season: 'spring',
        malId: 1,
      },
    }),
    prisma.anime.upsert({
      where: { slug: 'neon-genesis-evangelion' },
      update: {},
      create: {
        slug: 'neon-genesis-evangelion',
        title: 'Neon Genesis Evangelion',
        nativeTitle: '新世紀エヴァンゲリオン',
        romajiTitle: 'Shinseiki Evangelion',
        year: 1995,
        season: 'fall',
        malId: 30,
      },
    }),
    prisma.anime.upsert({
      where: { slug: 'fullmetal-alchemist-brotherhood' },
      update: {},
      create: {
        slug: 'fullmetal-alchemist-brotherhood',
        title: 'Fullmetal Alchemist: Brotherhood',
        nativeTitle: '鋼の錬金術師 FULLMETAL ALCHEMIST',
        romajiTitle: 'Hagane no Renkinjutsushi: Fullmetal Alchemist',
        year: 2009,
        season: 'spring',
        malId: 5114,
      },
    }),
    prisma.anime.upsert({
      where: { slug: 'my-hero-academia' },
      update: {},
      create: {
        slug: 'my-hero-academia',
        title: 'My Hero Academia',
        nativeTitle: '僕のヒーローアカデミア',
        romajiTitle: 'Boku no Hero Academia',
        year: 2016,
        season: 'spring',
        malId: 31964,
      },
    }),
    prisma.anime.upsert({
      where: { slug: 'mob-psycho-100' },
      update: {},
      create: {
        slug: 'mob-psycho-100',
        title: 'Mob Psycho 100',
        nativeTitle: 'モブサイコ100',
        romajiTitle: 'Mob Psycho 100',
        year: 2016,
        season: 'summer',
        malId: 32182,
      },
    }),
    prisma.anime.upsert({
      where: { slug: 'demon-slayer' },
      update: {},
      create: {
        slug: 'demon-slayer',
        title: 'Demon Slayer: Kimetsu no Yaiba',
        nativeTitle: '鬼滅の刃',
        romajiTitle: 'Kimetsu no Yaiba',
        year: 2019,
        season: 'spring',
        malId: 38000,
      },
    }),
    prisma.anime.upsert({
      where: { slug: 'one-punch-man' },
      update: {},
      create: {
        slug: 'one-punch-man',
        title: 'One Punch Man',
        nativeTitle: 'ワンパンマン',
        romajiTitle: 'One Punch Man',
        year: 2015,
        season: 'fall',
        malId: 30276,
      },
    }),
    prisma.anime.upsert({
      where: { slug: 'ghost-in-the-shell' },
      update: {},
      create: {
        slug: 'ghost-in-the-shell',
        title: 'Ghost in the Shell',
        nativeTitle: '攻殻機動隊',
        romajiTitle: 'Koukaku Kidoutai',
        year: 1995,
        malId: 43,
      },
    }),
    prisma.anime.upsert({
      where: { slug: 'naruto-shippuden' },
      update: {},
      create: {
        slug: 'naruto-shippuden',
        title: 'Naruto: Shippuden',
        nativeTitle: 'NARUTO -ナルト- 疾風伝',
        romajiTitle: 'Naruto: Shippuuden',
        year: 2007,
        season: 'winter',
        malId: 1735,
      },
    }),
    prisma.anime.upsert({
      where: { slug: 'flcl' },
      update: {},
      create: {
        slug: 'flcl',
        title: 'FLCL',
        nativeTitle: 'フリクリ',
        romajiTitle: 'FLCL',
        year: 2000,
        season: 'spring',
        malId: 227,
      },
    }),
  ])
  console.log(`  Created ${anime.length} anime series`)

  // Build lookup maps
  const studioMap = Object.fromEntries(studios.map((s) => [s.slug, s]))
  const animeMap = Object.fromEntries(anime.map((a) => [a.slug, a]))

  // ============================================
  // ANIMATORS
  // ============================================
  console.log('Creating animators...')
  const animators = await Promise.all([
    prisma.animator.upsert({
      where: { slug: 'yutaka-nakamura' },
      update: {},
      create: {
        slug: 'yutaka-nakamura',
        name: 'Yutaka Nakamura',
        nativeName: '中村豊',
        bio: 'One of the most celebrated key animators in the industry, known for his explosive action sequences and distinctive style. His work on Sword of the Stranger, My Hero Academia, and Cowboy Bebop has defined modern anime action. Recognized for his unique approach to weight, impact, and debris animation.',
        birthDate: new Date('1967-01-01'),
        photoUrl: null,
        twitterHandle: null,
      },
    }),
    prisma.animator.upsert({
      where: { slug: 'yoshinori-kanada' },
      update: {},
      create: {
        slug: 'yoshinori-kanada',
        name: 'Yoshinori Kanada',
        nativeName: '金田伊功',
        bio: 'A legendary animator who revolutionized anime action in the 1970s-80s. Creator of the "Kanada School" style characterized by dramatic perspective, bold poses, and exaggerated motion arcs. His influence extends through generations of animators.',
        birthDate: new Date('1952-02-05'),
        deathDate: new Date('2009-07-21'),
        photoUrl: null,
      },
    }),
    prisma.animator.upsert({
      where: { slug: 'norio-matsumoto' },
      update: {},
      create: {
        slug: 'norio-matsumoto',
        name: 'Norio Matsumoto',
        nativeName: '松本憲生',
        bio: 'Highly regarded key animator known for fluid, naturalistic movement and innovative camera work. His contributions to Naruto Shippuden fight sequences are widely studied. Famous for his ability to convey physics and momentum in hand-to-hand combat scenes.',
        birthDate: new Date('1969-01-01'),
        photoUrl: null,
      },
    }),
    prisma.animator.upsert({
      where: { slug: 'mitsuo-iso' },
      update: {},
      create: {
        slug: 'mitsuo-iso',
        name: 'Mitsuo Iso',
        nativeName: '磯光雄',
        bio: 'Pioneer of "full limited" animation technique, blending the fluidity of full animation with the stylistic economy of limited animation. Key contributor to Evangelion, Ghost in the Shell, and director of Dennou Coil. Known for technical precision and innovative approaches to effects animation.',
        birthDate: new Date('1966-01-01'),
        photoUrl: null,
      },
    }),
    prisma.animator.upsert({
      where: { slug: 'hiroyuki-imaishi' },
      update: {},
      create: {
        slug: 'hiroyuki-imaishi',
        name: 'Hiroyuki Imaishi',
        nativeName: '今石洋之',
        bio: 'Co-founder of Studio Trigger and the creative force behind Gurren Lagann, Kill la Kill, and Promare. Known for over-the-top, high-energy animation with bold lines and extreme proportions. A key figure in the Gainax school of animation.',
        birthDate: new Date('1971-10-04'),
        photoUrl: null,
      },
    }),
    prisma.animator.upsert({
      where: { slug: 'toshiyuki-inoue' },
      update: {},
      create: {
        slug: 'toshiyuki-inoue',
        name: 'Toshiyuki Inoue',
        nativeName: '井上俊之',
        bio: 'A master of realistic animation known for meticulous attention to detail and naturalistic movement. Key animator on Ghost in the Shell, Akira, and numerous Ghibli productions. His work exemplifies the highest standard of Japanese animation craft.',
        birthDate: new Date('1961-05-27'),
        photoUrl: null,
      },
    }),
    prisma.animator.upsert({
      where: { slug: 'tetsuya-takeuchi' },
      update: {},
      create: {
        slug: 'tetsuya-takeuchi',
        name: 'Tetsuya Takeuchi',
        nativeName: '竹内哲也',
        bio: 'A highly skilled key animator and animation director known for clean, impactful action cuts. Prolific contributor to Bones productions including Fullmetal Alchemist: Brotherhood and My Hero Academia.',
        photoUrl: null,
      },
    }),
    prisma.animator.upsert({
      where: { slug: 'yoh-yoshinari' },
      update: {},
      create: {
        slug: 'yoh-yoshinari',
        name: 'Yoh Yoshinari',
        nativeName: '吉成曜',
        bio: 'Director and animator known for his work at Gainax and Trigger. Directed Little Witch Academia and contributed key animation to Evangelion and FLCL. Known for expressive, fluid character animation with a European-influenced style.',
        birthDate: new Date('1971-05-06'),
        photoUrl: null,
      },
    }),
    prisma.animator.upsert({
      where: { slug: 'shinya-ohira' },
      update: {},
      create: {
        slug: 'shinya-ohira',
        name: 'Shinya Ohira',
        nativeName: '大平晋也',
        bio: 'An avant-garde animator known for pushing the boundaries of what anime can look like. His expressionistic, painterly style in works like Wanwa the Doggy and Genius Party is instantly recognizable. A divisive but deeply influential figure in the art of animation.',
        photoUrl: null,
      },
    }),
    prisma.animator.upsert({
      where: { slug: 'takeshi-honda' },
      update: {},
      create: {
        slug: 'takeshi-honda',
        name: 'Takeshi Honda',
        nativeName: '本田雄',
        bio: 'Veteran animator and character designer known for Evangelion, Millennium Actress, and Ponyo. Celebrated for his ability to bring emotional depth through subtle character acting and expressive facial animation.',
        birthDate: new Date('1968-03-12'),
        photoUrl: null,
      },
    }),
  ])
  console.log(`  Created ${animators.length} animators`)

  const animatorMap = Object.fromEntries(animators.map((a) => [a.slug, a]))

  // ============================================
  // STUDIO HISTORY
  // ============================================
  console.log('Creating studio history...')
  const studioHistories = await Promise.all([
    prisma.studioHistory.upsert({
      where: { animatorId_studioId_startYear: { animatorId: animatorMap['yutaka-nakamura']!.id, studioId: studioMap['bones']!.id, startYear: 2000 } },
      update: {},
      create: { animatorId: animatorMap['yutaka-nakamura']!.id, studioId: studioMap['bones']!.id, startYear: 2000, position: 'Key Animator' },
    }),
    prisma.studioHistory.upsert({
      where: { animatorId_studioId_startYear: { animatorId: animatorMap['yutaka-nakamura']!.id, studioId: studioMap['sunrise']!.id, startYear: 1990 } },
      update: {},
      create: { animatorId: animatorMap['yutaka-nakamura']!.id, studioId: studioMap['sunrise']!.id, startYear: 1990, endYear: 2000, position: 'Key Animator' },
    }),
    prisma.studioHistory.upsert({
      where: { animatorId_studioId_startYear: { animatorId: animatorMap['hiroyuki-imaishi']!.id, studioId: studioMap['gainax']!.id, startYear: 1995 } },
      update: {},
      create: { animatorId: animatorMap['hiroyuki-imaishi']!.id, studioId: studioMap['gainax']!.id, startYear: 1995, endYear: 2011, position: 'Animator / Director' },
    }),
    prisma.studioHistory.upsert({
      where: { animatorId_studioId_startYear: { animatorId: animatorMap['hiroyuki-imaishi']!.id, studioId: studioMap['trigger']!.id, startYear: 2011 } },
      update: {},
      create: { animatorId: animatorMap['hiroyuki-imaishi']!.id, studioId: studioMap['trigger']!.id, startYear: 2011, position: 'Co-founder / Director' },
    }),
    prisma.studioHistory.upsert({
      where: { animatorId_studioId_startYear: { animatorId: animatorMap['mitsuo-iso']!.id, studioId: studioMap['gainax']!.id, startYear: 1995 } },
      update: {},
      create: { animatorId: animatorMap['mitsuo-iso']!.id, studioId: studioMap['gainax']!.id, startYear: 1995, endYear: 2000, position: 'Key Animator' },
    }),
    prisma.studioHistory.upsert({
      where: { animatorId_studioId_startYear: { animatorId: animatorMap['toshiyuki-inoue']!.id, studioId: studioMap['studio-ghibli']!.id, startYear: 1990 } },
      update: {},
      create: { animatorId: animatorMap['toshiyuki-inoue']!.id, studioId: studioMap['studio-ghibli']!.id, startYear: 1990, position: 'Freelance Key Animator' },
    }),
    prisma.studioHistory.upsert({
      where: { animatorId_studioId_startYear: { animatorId: animatorMap['yoh-yoshinari']!.id, studioId: studioMap['gainax']!.id, startYear: 1995 } },
      update: {},
      create: { animatorId: animatorMap['yoh-yoshinari']!.id, studioId: studioMap['gainax']!.id, startYear: 1995, endYear: 2011, position: 'Key Animator' },
    }),
    prisma.studioHistory.upsert({
      where: { animatorId_studioId_startYear: { animatorId: animatorMap['yoh-yoshinari']!.id, studioId: studioMap['trigger']!.id, startYear: 2011 } },
      update: {},
      create: { animatorId: animatorMap['yoh-yoshinari']!.id, studioId: studioMap['trigger']!.id, startYear: 2011, position: 'Director / Key Animator' },
    }),
    prisma.studioHistory.upsert({
      where: { animatorId_studioId_startYear: { animatorId: animatorMap['takeshi-honda']!.id, studioId: studioMap['gainax']!.id, startYear: 1995 } },
      update: {},
      create: { animatorId: animatorMap['takeshi-honda']!.id, studioId: studioMap['gainax']!.id, startYear: 1995, endYear: 2005, position: 'Key Animator / Character Designer' },
    }),
    prisma.studioHistory.upsert({
      where: { animatorId_studioId_startYear: { animatorId: animatorMap['tetsuya-takeuchi']!.id, studioId: studioMap['bones']!.id, startYear: 2005 } },
      update: {},
      create: { animatorId: animatorMap['tetsuya-takeuchi']!.id, studioId: studioMap['bones']!.id, startYear: 2005, position: 'Key Animator / Animation Director' },
    }),
  ])
  console.log(`  Created ${studioHistories.length} studio history records`)

  // ============================================
  // CLIPS
  // ============================================
  console.log('Creating clips...')
  const clips = await Promise.all([
    prisma.clip.upsert({
      where: { slug: 'akira-bike-slide' },
      update: {},
      create: {
        slug: 'akira-bike-slide',
        title: 'Akira - Iconic Bike Slide',
        videoUrl: 'placeholder-stream-id-001',
        duration: 12,
        animeId: animeMap['akira']!.id,
        techniqueDescription: 'The legendary bike slide scene demonstrates masterful use of perspective distortion, light trails, and dynamic camera movement. The rotation of the motorcycle combined with the ground-level debris creates a sense of physical weight and velocity.',
        submissionStatus: 'APPROVED',
        viewCount: 15420,
        favoriteCount: 892,
        commentCount: 45,
        studioId: null,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'cowboy-bebop-spike-church' },
      update: {},
      create: {
        slug: 'cowboy-bebop-spike-church',
        title: 'Cowboy Bebop - Spike vs Vicious Church Fight',
        videoUrl: 'placeholder-stream-id-002',
        duration: 38,
        animeId: animeMap['cowboy-bebop']!.id,
        techniqueDescription: 'Showcases Nakamura\'s signature debris animation and impact frames. The fight choreography emphasizes weight transfer and momentum, with each blow carrying distinct physical force. Notable for the creative use of architectural destruction.',
        submissionStatus: 'APPROVED',
        viewCount: 8930,
        favoriteCount: 623,
        commentCount: 28,
        studioId: studioMap['sunrise']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'eva-unit01-berserk' },
      update: {},
      create: {
        slug: 'eva-unit01-berserk',
        title: 'Evangelion - Unit 01 Berserk Mode',
        videoUrl: 'placeholder-stream-id-003',
        duration: 30,
        animeId: animeMap['neon-genesis-evangelion']!.id,
        episodeNumber: 19,
        techniqueDescription: 'Mitsuo Iso\'s "full limited" technique is on full display. The berserk sequence uses minimal in-betweens but achieves visceral impact through precise timing, extreme poses, and innovative effects animation for the Eva\'s movements.',
        submissionStatus: 'APPROVED',
        viewCount: 12100,
        favoriteCount: 734,
        commentCount: 52,
        studioId: studioMap['gainax']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'naruto-pain-vs-naruto' },
      update: {},
      create: {
        slug: 'naruto-pain-vs-naruto',
        title: 'Naruto Shippuden - Pain vs Naruto',
        videoUrl: 'placeholder-stream-id-004',
        duration: 42,
        animeId: animeMap['naruto-shippuden']!.id,
        episodeNumber: 167,
        techniqueDescription: 'Norio Matsumoto\'s legendary fight sequence with extremely fluid character animation. Features innovative use of smear frames, squash-and-stretch, and dynamic camera rotation that became a reference point for anime action choreography.',
        submissionStatus: 'APPROVED',
        viewCount: 22300,
        favoriteCount: 1205,
        commentCount: 89,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'mha-deku-vs-todoroki' },
      update: {},
      create: {
        slug: 'mha-deku-vs-todoroki',
        title: 'My Hero Academia - Deku vs Todoroki',
        videoUrl: 'placeholder-stream-id-005',
        duration: 35,
        animeId: animeMap['my-hero-academia']!.id,
        episodeNumber: 23,
        techniqueDescription: 'Yutaka Nakamura\'s explosive action cut featuring his trademark impact frames, debris animation, and dynamic camera work. The collision of fire and ice effects demonstrates mastery of contrasting elemental FX animation.',
        submissionStatus: 'APPROVED',
        viewCount: 18700,
        favoriteCount: 945,
        commentCount: 67,
        studioId: studioMap['bones']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'mob-psycho-reigen-punch' },
      update: {},
      create: {
        slug: 'mob-psycho-reigen-punch',
        title: 'Mob Psycho 100 - Reigen\'s 1000% Punch',
        videoUrl: 'placeholder-stream-id-006',
        duration: 18,
        animeId: animeMap['mob-psycho-100']!.id,
        episodeNumber: 12,
        techniqueDescription: 'A tour de force of effects animation combining painterly backgrounds, psychedelic color shifts, and exaggerated impact animation. Multiple animators contributed to create a visually layered sequence that breaks from the show\'s usual style.',
        submissionStatus: 'APPROVED',
        viewCount: 9800,
        favoriteCount: 567,
        commentCount: 34,
        studioId: studioMap['bones']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'demon-slayer-ep19-hinokami' },
      update: {},
      create: {
        slug: 'demon-slayer-ep19-hinokami',
        title: 'Demon Slayer - Hinokami Kagura',
        videoUrl: 'placeholder-stream-id-007',
        duration: 40,
        animeId: animeMap['demon-slayer']!.id,
        episodeNumber: 19,
        techniqueDescription: 'ufotable\'s signature blend of 2D character animation with CG effects. The water and fire breathing techniques use flowing CG particles integrated seamlessly with hand-drawn action. Camera orbits around the characters in a continuous take.',
        submissionStatus: 'APPROVED',
        viewCount: 31500,
        favoriteCount: 1890,
        commentCount: 112,
        studioId: studioMap['ufotable']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'one-punch-man-saitama-vs-boros' },
      update: {},
      create: {
        slug: 'one-punch-man-saitama-vs-boros',
        title: 'One Punch Man - Saitama vs Boros Finale',
        videoUrl: 'placeholder-stream-id-008',
        duration: 44,
        animeId: animeMap['one-punch-man']!.id,
        episodeNumber: 12,
        techniqueDescription: 'Features contributions from multiple star animators. The sequence moves through distinct visual styles as different animators handle different cuts, creating a crescendo of escalating action that showcases the diversity of modern anime sakuga.',
        submissionStatus: 'APPROVED',
        viewCount: 25600,
        favoriteCount: 1456,
        commentCount: 95,
        studioId: studioMap['madhouse']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'ghost-in-the-shell-opening' },
      update: {},
      create: {
        slug: 'ghost-in-the-shell-opening',
        title: 'Ghost in the Shell - Thermo-optic Camouflage',
        videoUrl: 'placeholder-stream-id-009',
        duration: 28,
        animeId: animeMap['ghost-in-the-shell']!.id,
        techniqueDescription: 'Toshiyuki Inoue\'s meticulous attention to realistic movement and subtle weight distribution. The rooftop descent showcases his mastery of anatomical accuracy combined with cinematic framing that influenced an entire generation of sci-fi anime.',
        submissionStatus: 'APPROVED',
        viewCount: 11200,
        favoriteCount: 678,
        commentCount: 41,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'flcl-haruko-guitar' },
      update: {},
      create: {
        slug: 'flcl-haruko-guitar',
        title: 'FLCL - Haruko Guitar Swing',
        videoUrl: 'placeholder-stream-id-010',
        duration: 15,
        animeId: animeMap['flcl']!.id,
        episodeNumber: 1,
        techniqueDescription: 'Yoh Yoshinari\'s energetic character animation with extreme poses and dynamic line work. The guitar swing uses dramatic perspective foreshortening and squash-and-stretch that embodies Gainax\'s exuberant style.',
        submissionStatus: 'APPROVED',
        viewCount: 7600,
        favoriteCount: 423,
        commentCount: 22,
        studioId: studioMap['gainax']!.id,
      },
    }),
    // A couple pending/rejected clips to populate the moderation queue
    prisma.clip.upsert({
      where: { slug: 'fma-mustang-vs-envy' },
      update: {},
      create: {
        slug: 'fma-mustang-vs-envy',
        title: 'FMA:B - Mustang vs Envy',
        videoUrl: 'placeholder-stream-id-011',
        duration: 30,
        animeId: animeMap['fullmetal-alchemist-brotherhood']!.id,
        episodeNumber: 54,
        techniqueDescription: 'Intense fire effects animation with character acting that conveys rage and desperation through body language and timing.',
        submissionStatus: 'PENDING',
        studioId: studioMap['bones']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'spirited-away-train-scene' },
      update: {},
      create: {
        slug: 'spirited-away-train-scene',
        title: 'Spirited Away - Train on Water',
        videoUrl: 'placeholder-stream-id-012',
        duration: 25,
        animeId: animeMap['spirited-away']!.id,
        techniqueDescription: 'Subtle atmospheric animation showcasing Ghibli\'s mastery of quiet, contemplative scenes. The rippling water reflections and gentle character motion create a meditative mood.',
        submissionStatus: 'PENDING',
        studioId: studioMap['studio-ghibli']!.id,
      },
    }),
    // Additional clips for enhanced seed data
    prisma.clip.upsert({
      where: { slug: 'mha-all-might-vs-nomu' },
      update: {},
      create: {
        slug: 'mha-all-might-vs-nomu',
        title: 'My Hero Academia - All Might vs Nomu',
        videoUrl: 'placeholder-stream-id-013',
        duration: 36,
        animeId: animeMap['my-hero-academia']!.id,
        episodeNumber: 12,
        techniqueDescription: 'Explosive impact animation with Nakamura-style debris and shockwaves. Features extreme perspective shifts and weight distribution as All Might delivers devastating punches. The climactic "Plus Ultra" punch uses multiple impact frames and screen shake to convey overwhelming power.',
        submissionStatus: 'APPROVED',
        viewCount: 14200,
        favoriteCount: 856,
        commentCount: 54,
        studioId: studioMap['bones']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'mob-psycho-mogami-fight' },
      update: {},
      create: {
        slug: 'mob-psycho-mogami-fight',
        title: 'Mob Psycho 100 - Mob vs Mogami',
        videoUrl: 'placeholder-stream-id-014',
        duration: 32,
        animeId: animeMap['mob-psycho-100']!.id,
        episodeNumber: 7,
        techniqueDescription: 'Surreal psychedelic effects animation featuring rapidly shifting art styles and distorted perspectives. The sequence blends traditional character animation with abstract visual metaphors, creating a dreamlike battle within Mob\'s mindscape.',
        submissionStatus: 'APPROVED',
        viewCount: 11500,
        favoriteCount: 689,
        commentCount: 42,
        studioId: studioMap['bones']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'cowboy-bebop-asteroid-chase' },
      update: {},
      create: {
        slug: 'cowboy-bebop-asteroid-chase',
        title: 'Cowboy Bebop - Asteroid Gate Chase',
        videoUrl: 'placeholder-stream-id-015',
        duration: 28,
        animeId: animeMap['cowboy-bebop']!.id,
        episodeNumber: 9,
        techniqueDescription: 'Dynamic space chase featuring complex 3D movement through an asteroid field. Demonstrates precise mechanical animation with believable physics and momentum. The camera follows the Swordfish II through tight maneuvers with fluid rotations.',
        submissionStatus: 'APPROVED',
        viewCount: 6800,
        favoriteCount: 412,
        commentCount: 19,
        studioId: studioMap['sunrise']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'naruto-rock-lee-vs-gaara' },
      update: {},
      create: {
        slug: 'naruto-rock-lee-vs-gaara',
        title: 'Naruto - Rock Lee vs Gaara',
        videoUrl: 'placeholder-stream-id-016',
        duration: 40,
        animeId: animeMap['naruto-shippuden']!.id,
        episodeNumber: 48,
        techniqueDescription: 'Matsumoto\'s groundbreaking fight choreography showcasing ultra-fast taijutsu combat. Features innovative camera angles that rotate around the fighters mid-action, extensive use of smear frames for speed, and masterful weight transfer in hand-to-hand exchanges.',
        submissionStatus: 'APPROVED',
        viewCount: 19800,
        favoriteCount: 1123,
        commentCount: 78,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'flcl-robot-battle' },
      update: {},
      create: {
        slug: 'flcl-robot-battle',
        title: 'FLCL - Giant Robot Battle',
        videoUrl: 'placeholder-stream-id-017',
        duration: 38,
        animeId: animeMap['flcl']!.id,
        episodeNumber: 5,
        techniqueDescription: 'Imaishi\'s over-the-top mecha animation combining wild perspective shifts with exaggerated proportions. The robot movements defy realistic physics in favor of dramatic impact, featuring bold angular lines and explosive transformations characteristic of Gainax style.',
        submissionStatus: 'APPROVED',
        viewCount: 8200,
        favoriteCount: 534,
        commentCount: 31,
        studioId: studioMap['gainax']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'demon-slayer-zenitsu-thunderclap' },
      update: {},
      create: {
        slug: 'demon-slayer-zenitsu-thunderclap',
        title: 'Demon Slayer - Zenitsu Thunderclap Flash',
        videoUrl: 'placeholder-stream-id-018',
        duration: 22,
        animeId: animeMap['demon-slayer']!.id,
        episodeNumber: 17,
        techniqueDescription: 'Lightning-fast sword technique using ufotable\'s hybrid 2D/3D approach. The thunderclap effect combines CG particle lightning with traditional speed lines and afterimages. Camera work emphasizes the instant acceleration from stillness to maximum velocity.',
        submissionStatus: 'APPROVED',
        viewCount: 16700,
        favoriteCount: 923,
        commentCount: 58,
        studioId: studioMap['ufotable']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'one-punch-man-genos-vs-mosquito-girl' },
      update: {},
      create: {
        slug: 'one-punch-man-genos-vs-mosquito-girl',
        title: 'One Punch Man - Genos vs Mosquito Girl',
        videoUrl: 'placeholder-stream-id-019',
        duration: 34,
        animeId: animeMap['one-punch-man']!.id,
        episodeNumber: 2,
        techniqueDescription: 'High-intensity action featuring crisp mechanical animation for Genos and fluid organic movement for Mosquito Girl. The contrast in animation styles emphasizes their different natures. Fire effects and impact frames punctuate the urban destruction.',
        submissionStatus: 'APPROVED',
        viewCount: 13400,
        favoriteCount: 782,
        commentCount: 46,
        studioId: studioMap['madhouse']!.id,
      },
    }),
    prisma.clip.upsert({
      where: { slug: 'fma-greed-vs-bradley' },
      update: {},
      create: {
        slug: 'fma-greed-vs-bradley',
        title: 'FMA:B - Greed vs Bradley',
        videoUrl: 'placeholder-stream-id-020',
        duration: 37,
        animeId: animeMap['fullmetal-alchemist-brotherhood']!.id,
        episodeNumber: 43,
        techniqueDescription: 'Precise sword choreography animation with exceptional attention to combat flow and spacing. Bradley\'s superhuman speed is conveyed through strategic smear frames and motion blur, while Greed\'s ultimate shield provides opportunities for impact and debris animation.',
        submissionStatus: 'APPROVED',
        viewCount: 10600,
        favoriteCount: 645,
        commentCount: 38,
        studioId: studioMap['bones']!.id,
      },
    }),
  ])
  console.log(`  Created ${clips.length} clips`)

  const clipMap = Object.fromEntries(clips.map((c) => [c.slug, c]))

  // ============================================
  // ATTRIBUTIONS
  // ============================================
  console.log('Creating attributions...')
  const attributions = await Promise.all([
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['toshiyuki-inoue']!.id, clipId: clipMap['akira-bike-slide']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['toshiyuki-inoue']!.id,
        clipId: clipMap['akira-bike-slide']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Credited in official staff listing',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['yutaka-nakamura']!.id, clipId: clipMap['cowboy-bebop-spike-church']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['yutaka-nakamura']!.id,
        clipId: clipMap['cowboy-bebop-spike-church']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Confirmed via episode credits and animator interviews',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['mitsuo-iso']!.id, clipId: clipMap['eva-unit01-berserk']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['mitsuo-iso']!.id,
        clipId: clipMap['eva-unit01-berserk']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Well-documented in Evangelion production materials',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['norio-matsumoto']!.id, clipId: clipMap['naruto-pain-vs-naruto']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['norio-matsumoto']!.id,
        clipId: clipMap['naruto-pain-vs-naruto']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Episode credits and staff blog confirmation',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['yutaka-nakamura']!.id, clipId: clipMap['mha-deku-vs-todoroki']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['yutaka-nakamura']!.id,
        clipId: clipMap['mha-deku-vs-todoroki']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Confirmed via Bones studio production notes',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['toshiyuki-inoue']!.id, clipId: clipMap['ghost-in-the-shell-opening']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['toshiyuki-inoue']!.id,
        clipId: clipMap['ghost-in-the-shell-opening']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Official production credits',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['yoh-yoshinari']!.id, clipId: clipMap['flcl-haruko-guitar']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['yoh-yoshinari']!.id,
        clipId: clipMap['flcl-haruko-guitar']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'FLCL staff credits and production interviews',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['takeshi-honda']!.id, clipId: clipMap['eva-unit01-berserk']!.id, role: 'ANIMATION_DIRECTOR' } },
      update: {},
      create: {
        animatorId: animatorMap['takeshi-honda']!.id,
        clipId: clipMap['eva-unit01-berserk']!.id,
        role: 'ANIMATION_DIRECTOR',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Official episode credits',
      },
    }),
    // A speculative attribution
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['shinya-ohira']!.id, clipId: clipMap['mob-psycho-reigen-punch']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['shinya-ohira']!.id,
        clipId: clipMap['mob-psycho-reigen-punch']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'SPECULATIVE',
        sourceNote: 'Style analysis suggests involvement; not officially credited for this specific cut',
      },
    }),
    // Attributions for additional clips
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['yutaka-nakamura']!.id, clipId: clipMap['mha-all-might-vs-nomu']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['yutaka-nakamura']!.id,
        clipId: clipMap['mha-all-might-vs-nomu']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Confirmed via episode credits and Bones production notes',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['tetsuya-takeuchi']!.id, clipId: clipMap['mob-psycho-mogami-fight']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['tetsuya-takeuchi']!.id,
        clipId: clipMap['mob-psycho-mogami-fight']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Episode credits and staff interviews',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['toshiyuki-inoue']!.id, clipId: clipMap['cowboy-bebop-asteroid-chase']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['toshiyuki-inoue']!.id,
        clipId: clipMap['cowboy-bebop-asteroid-chase']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Credited in official episode credits',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['norio-matsumoto']!.id, clipId: clipMap['naruto-rock-lee-vs-gaara']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['norio-matsumoto']!.id,
        clipId: clipMap['naruto-rock-lee-vs-gaara']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Famous sequence confirmed by episode credits and animator interviews',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['hiroyuki-imaishi']!.id, clipId: clipMap['flcl-robot-battle']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['hiroyuki-imaishi']!.id,
        clipId: clipMap['flcl-robot-battle']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'FLCL production credits',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['yoh-yoshinari']!.id, clipId: clipMap['flcl-robot-battle']!.id, role: 'ANIMATION_DIRECTOR' } },
      update: {},
      create: {
        animatorId: animatorMap['yoh-yoshinari']!.id,
        clipId: clipMap['flcl-robot-battle']!.id,
        role: 'ANIMATION_DIRECTOR',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Episode animation director credit',
      },
    }),
    prisma.attribution.upsert({
      where: { animatorId_clipId_role: { animatorId: animatorMap['tetsuya-takeuchi']!.id, clipId: clipMap['fma-greed-vs-bradley']!.id, role: 'KEY_ANIMATION' } },
      update: {},
      create: {
        animatorId: animatorMap['tetsuya-takeuchi']!.id,
        clipId: clipMap['fma-greed-vs-bradley']!.id,
        role: 'KEY_ANIMATION',
        verificationStatus: 'VERIFIED',
        sourceNote: 'Bones staff credits and production materials',
      },
    }),
  ])
  console.log(`  Created ${attributions.length} attributions`)

  // ============================================
  // ANIMATOR RELATIONS
  // ============================================
  console.log('Creating animator relations...')
  const relations = await Promise.all([
    prisma.animatorRelation.upsert({
      where: { sourceId_targetId_relationType: { sourceId: animatorMap['yoshinori-kanada']!.id, targetId: animatorMap['hiroyuki-imaishi']!.id, relationType: 'MENTOR' } },
      update: {},
      create: {
        sourceId: animatorMap['yoshinori-kanada']!.id,
        targetId: animatorMap['hiroyuki-imaishi']!.id,
        relationType: 'MENTOR',
      },
    }),
    prisma.animatorRelation.upsert({
      where: { sourceId_targetId_relationType: { sourceId: animatorMap['yoshinori-kanada']!.id, targetId: animatorMap['yutaka-nakamura']!.id, relationType: 'MENTOR' } },
      update: {},
      create: {
        sourceId: animatorMap['yoshinori-kanada']!.id,
        targetId: animatorMap['yutaka-nakamura']!.id,
        relationType: 'MENTOR',
      },
    }),
    prisma.animatorRelation.upsert({
      where: { sourceId_targetId_relationType: { sourceId: animatorMap['yutaka-nakamura']!.id, targetId: animatorMap['tetsuya-takeuchi']!.id, relationType: 'COLLEAGUE' } },
      update: {},
      create: {
        sourceId: animatorMap['yutaka-nakamura']!.id,
        targetId: animatorMap['tetsuya-takeuchi']!.id,
        relationType: 'COLLEAGUE',
      },
    }),
    prisma.animatorRelation.upsert({
      where: { sourceId_targetId_relationType: { sourceId: animatorMap['hiroyuki-imaishi']!.id, targetId: animatorMap['yoh-yoshinari']!.id, relationType: 'COLLEAGUE' } },
      update: {},
      create: {
        sourceId: animatorMap['hiroyuki-imaishi']!.id,
        targetId: animatorMap['yoh-yoshinari']!.id,
        relationType: 'COLLEAGUE',
      },
    }),
    prisma.animatorRelation.upsert({
      where: { sourceId_targetId_relationType: { sourceId: animatorMap['mitsuo-iso']!.id, targetId: animatorMap['takeshi-honda']!.id, relationType: 'COLLEAGUE' } },
      update: {},
      create: {
        sourceId: animatorMap['mitsuo-iso']!.id,
        targetId: animatorMap['takeshi-honda']!.id,
        relationType: 'COLLEAGUE',
      },
    }),
    prisma.animatorRelation.upsert({
      where: { sourceId_targetId_relationType: { sourceId: animatorMap['norio-matsumoto']!.id, targetId: animatorMap['yoshinori-kanada']!.id, relationType: 'INFLUENCED_BY' } },
      update: {},
      create: {
        sourceId: animatorMap['norio-matsumoto']!.id,
        targetId: animatorMap['yoshinori-kanada']!.id,
        relationType: 'INFLUENCED_BY',
      },
    }),
  ])
  console.log(`  Created ${relations.length} animator relations`)

  // ============================================
  // TAGS
  // ============================================
  console.log('Creating tags...')
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'smear-frame' }, update: {}, create: { slug: 'smear-frame', name: 'Smear Frame', category: 'technique', description: 'An intentionally distorted in-between frame that creates a sense of speed and motion blur. The subject is stretched or smeared across the frame.' } }),
    prisma.tag.upsert({ where: { slug: 'impact-frame' }, update: {}, create: { slug: 'impact-frame', name: 'Impact Frame', category: 'technique', description: 'A sudden flash or high-contrast frame inserted at the moment of collision to emphasize force and impact.' } }),
    prisma.tag.upsert({ where: { slug: 'debris-animation' }, update: {}, create: { slug: 'debris-animation', name: 'Debris Animation', category: 'technique', description: 'The animation of flying rocks, dust, glass shards, and other particles during action sequences.' } }),
    prisma.tag.upsert({ where: { slug: 'effects-animation' }, update: {}, create: { slug: 'effects-animation', name: 'Effects Animation', category: 'technique', description: 'Animation of non-character elements: fire, water, smoke, lightning, explosions, and other environmental effects.' } }),
    prisma.tag.upsert({ where: { slug: 'character-acting' }, update: {}, create: { slug: 'character-acting', name: 'Character Acting', category: 'technique', description: 'Subtle, expressive character animation that conveys personality and emotion through gesture and movement.' } }),
    prisma.tag.upsert({ where: { slug: 'fight-choreography' }, update: {}, create: { slug: 'fight-choreography', name: 'Fight Choreography', category: 'style', description: 'Well-choreographed combat sequences with clear spatial awareness and martial arts-inspired movement.' } }),
    prisma.tag.upsert({ where: { slug: 'kanada-school' }, update: {}, create: { slug: 'kanada-school', name: 'Kanada School', category: 'style', description: 'Animation style inspired by Yoshinori Kanada, characterized by dramatic poses, bold perspective, and stylized motion arcs.' } }),
    prisma.tag.upsert({ where: { slug: 'full-limited' }, update: {}, create: { slug: 'full-limited', name: 'Full Limited', category: 'technique', description: 'A technique pioneered by Mitsuo Iso that achieves fluid motion using fewer drawings through precise timing and key pose selection.' } }),
    prisma.tag.upsert({ where: { slug: 'mecha' }, update: {}, create: { slug: 'mecha', name: 'Mecha', category: 'content', description: 'Mechanical/robot animation, often requiring understanding of rigid body movement and mechanical design.' } }),
    prisma.tag.upsert({ where: { slug: 'fire-effects' }, update: {}, create: { slug: 'fire-effects', name: 'Fire Effects', category: 'technique', description: 'Animation of flames and fire, requiring understanding of fluid dynamics and light emission.' } }),
    prisma.tag.upsert({ where: { slug: 'camera-movement' }, update: {}, create: { slug: 'camera-movement', name: 'Camera Movement', category: 'technique', description: 'Dynamic virtual camera work including panning, tracking, rotation, and perspective shifts during animated sequences.' } }),
    prisma.tag.upsert({ where: { slug: 'weight-physics' }, update: {}, create: { slug: 'weight-physics', name: 'Weight & Physics', category: 'technique', description: 'Animation that convincingly conveys the physical weight, mass, and momentum of characters and objects.' } }),
  ])
  console.log(`  Created ${tags.length} tags`)

  const tagMap = Object.fromEntries(tags.map((t) => [t.slug, t]))

  // ============================================
  // CLIP-TAG ASSOCIATIONS
  // ============================================
  console.log('Creating clip-tag associations...')
  const clipTags = [
    { clipSlug: 'akira-bike-slide', tagSlugs: ['effects-animation', 'camera-movement', 'weight-physics'] },
    { clipSlug: 'cowboy-bebop-spike-church', tagSlugs: ['fight-choreography', 'debris-animation', 'impact-frame', 'kanada-school'] },
    { clipSlug: 'eva-unit01-berserk', tagSlugs: ['full-limited', 'mecha', 'effects-animation'] },
    { clipSlug: 'naruto-pain-vs-naruto', tagSlugs: ['fight-choreography', 'smear-frame', 'camera-movement'] },
    { clipSlug: 'mha-deku-vs-todoroki', tagSlugs: ['impact-frame', 'debris-animation', 'fire-effects', 'kanada-school'] },
    { clipSlug: 'mob-psycho-reigen-punch', tagSlugs: ['effects-animation', 'impact-frame'] },
    { clipSlug: 'demon-slayer-ep19-hinokami', tagSlugs: ['effects-animation', 'fire-effects', 'camera-movement'] },
    { clipSlug: 'one-punch-man-saitama-vs-boros', tagSlugs: ['fight-choreography', 'debris-animation', 'effects-animation', 'impact-frame'] },
    { clipSlug: 'ghost-in-the-shell-opening', tagSlugs: ['character-acting', 'weight-physics'] },
    { clipSlug: 'flcl-haruko-guitar', tagSlugs: ['smear-frame', 'character-acting', 'kanada-school'] },
    // Tag associations for additional clips
    { clipSlug: 'mha-all-might-vs-nomu', tagSlugs: ['impact-frame', 'debris-animation', 'weight-physics', 'kanada-school'] },
    { clipSlug: 'mob-psycho-mogami-fight', tagSlugs: ['effects-animation', 'character-acting'] },
    { clipSlug: 'cowboy-bebop-asteroid-chase', tagSlugs: ['camera-movement', 'weight-physics', 'mecha'] },
    { clipSlug: 'naruto-rock-lee-vs-gaara', tagSlugs: ['fight-choreography', 'smear-frame', 'camera-movement', 'weight-physics'] },
    { clipSlug: 'flcl-robot-battle', tagSlugs: ['mecha', 'effects-animation', 'kanada-school'] },
    { clipSlug: 'demon-slayer-zenitsu-thunderclap', tagSlugs: ['effects-animation', 'smear-frame', 'camera-movement'] },
    { clipSlug: 'one-punch-man-genos-vs-mosquito-girl', tagSlugs: ['fight-choreography', 'fire-effects', 'impact-frame', 'debris-animation'] },
    { clipSlug: 'fma-greed-vs-bradley', tagSlugs: ['fight-choreography', 'smear-frame', 'debris-animation'] },
  ]

  let clipTagCount = 0
  for (const { clipSlug, tagSlugs } of clipTags) {
    const clip = clipMap[clipSlug]
    if (!clip) continue
    for (const tagSlug of tagSlugs) {
      const tag = tagMap[tagSlug]
      if (!tag) continue
      await prisma.clipTag.upsert({
        where: { clipId_tagId: { clipId: clip.id, tagId: tag.id } },
        update: {},
        create: { clipId: clip.id, tagId: tag.id },
      })
      clipTagCount++
    }
  }
  console.log(`  Created ${clipTagCount} clip-tag associations`)

  // ============================================
  // GLOSSARY TERMS
  // ============================================
  console.log('Creating glossary terms...')
  const glossaryTerms = await Promise.all([
    prisma.glossaryTerm.upsert({
      where: { slug: 'sakuga' },
      update: {},
      create: {
        slug: 'sakuga',
        term: 'Sakuga',
        definition: 'Literally "drawing" in Japanese, but in the anime community it specifically refers to sequences of particularly fluid, expressive, or technically impressive animation. Sakuga moments often feature increased frame counts, complex movement, and notable artistic flair compared to the surrounding animation.',
        relatedTerms: ['key-animation', 'in-between'],
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'key-animation' },
      update: {},
      create: {
        slug: 'key-animation',
        term: 'Key Animation',
        definition: 'The primary drawings that define the start, end, and critical points of a movement. Key animators (genga-man) create these foundational frames, which are then connected by in-between artists. Key animation requires strong drawing skills, understanding of movement and timing.',
        relatedTerms: ['sakuga', 'in-between', 'genga'],
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'in-between' },
      update: {},
      create: {
        slug: 'in-between',
        term: 'In-Between',
        definition: 'The drawings created between key frames to create smooth motion. In-between animation (douga) fills the gaps between key poses. More in-betweens generally means smoother motion, while fewer creates a snappier feel.',
        relatedTerms: ['key-animation', 'full-limited-animation'],
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'smear-frame' },
      update: {},
      create: {
        slug: 'smear-frame',
        term: 'Smear Frame',
        definition: 'A single frame where a character or object is intentionally distorted, stretched, or blurred to convey rapid motion. When played at full speed, smear frames are invisible to the eye but create a convincing sense of velocity. A staple of both Western and Japanese animation.',
        relatedTerms: ['impact-frame', 'speed-lines'],
        exampleClipId: clipMap['naruto-pain-vs-naruto']?.id,
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'impact-frame' },
      update: {},
      create: {
        slug: 'impact-frame',
        term: 'Impact Frame',
        definition: 'A high-contrast or inverted-color frame inserted at the exact moment of a hit or collision. Creates a flash effect that emphasizes force. Often accompanied by screen shake and debris. Popularized by Yoshinori Kanada.',
        relatedTerms: ['smear-frame', 'kanada-school'],
        exampleClipId: clipMap['mha-deku-vs-todoroki']?.id,
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'kanada-school' },
      update: {},
      create: {
        slug: 'kanada-school',
        term: 'Kanada School',
        definition: 'An animation style originating from legendary animator Yoshinori Kanada, characterized by dramatic poses, bold use of perspective, stylized motion arcs (especially S-curves and figure-8 patterns), and distinctive impact effects. The Kanada school influenced generations of animators.',
        relatedTerms: ['impact-frame', 'kanada-dragon'],
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'full-limited-animation' },
      update: {},
      create: {
        slug: 'full-limited-animation',
        term: 'Full Limited Animation',
        definition: 'A technique pioneered by Mitsuo Iso that bridges full animation (drawing every frame) and limited animation (using fewer drawings). Achieves remarkably fluid results by carefully selecting which moments need full detail and which can be abbreviated, focusing on timing over frame count.',
        relatedTerms: ['key-animation', 'in-between'],
        exampleClipId: clipMap['eva-unit01-berserk']?.id,
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'genga' },
      update: {},
      create: {
        slug: 'genga',
        term: 'Genga',
        definition: 'The Japanese term for key animation drawings. Raw genga (rough key frames) are the unclean versions drawn by key animators before they are refined. Genga comparisons are popular in the sakuga community for studying an animator\'s raw technique.',
        relatedTerms: ['key-animation', 'douga'],
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'douga' },
      update: {},
      create: {
        slug: 'douga',
        term: 'Douga',
        definition: 'The cleaned-up and finalized animation drawings, including both key frames and in-betweens, ready for scanning and coloring. Also refers to the in-between animation process itself.',
        relatedTerms: ['genga', 'in-between'],
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'itano-circus' },
      update: {},
      create: {
        slug: 'itano-circus',
        term: 'Itano Circus',
        definition: 'An animation technique named after Ichiro Itano, featuring a swarm of missiles or projectiles spiraling through the air while being pursued or dodged. Characterized by complex 3D trajectory paths and dramatic camera angles following the projectiles. Iconic in mecha anime.',
        relatedTerms: ['mecha', 'effects-animation'],
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'animation-director' },
      update: {},
      create: {
        slug: 'animation-director',
        term: 'Animation Director',
        definition: 'Also known as Sakkan (作画監督). The supervisor who reviews and corrects key animation to ensure visual consistency across different key animators. A critical quality-control role that harmonizes individual animator styles into a cohesive whole. Episode animation directors handle individual episodes, while chief animation directors oversee entire series.',
        relatedTerms: ['key-animation', 'genga'],
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'timing-charts' },
      update: {},
      create: {
        slug: 'timing-charts',
        term: 'Timing Charts',
        definition: 'Notation written by key animators on their genga to instruct in-betweeners on the spacing and timing between key frames. Uses numbers and symbols to indicate how many frames between poses and whether motion should ease in/out or remain constant. Essential communication tool in the animation pipeline.',
        relatedTerms: ['key-animation', 'in-between', 'genga'],
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'layout' },
      update: {},
      create: {
        slug: 'layout',
        term: 'Layout',
        definition: 'The stage where camera framing, perspective, and character placement are determined. Layout artists create rough drawings that establish the 3D space, camera angle, and composition before key animation begins. Good layouts are crucial for dynamic camera work and spatial coherence.',
        relatedTerms: ['key-animation', 'genga'],
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'speed-lines' },
      update: {},
      create: {
        slug: 'speed-lines',
        term: 'Speed Lines',
        definition: 'Radiating or parallel lines drawn in the background to convey rapid movement or intense emotion. Can indicate motion direction, create dramatic focus, or add energy to a scene. A fundamental manga and anime visual convention that works in tandem with smear frames and other motion techniques.',
        relatedTerms: ['smear-frame', 'impact-frame'],
        exampleClipId: clipMap['demon-slayer-zenitsu-thunderclap']?.id,
      },
    }),
    prisma.glossaryTerm.upsert({
      where: { slug: 'debris-animation' },
      update: {},
      create: {
        slug: 'debris-animation',
        term: 'Debris Animation',
        definition: 'The animation of rocks, dust particles, glass shards, wood splinters, and other environmental debris during action scenes. A signature element of many top action animators, particularly Yutaka Nakamura. Debris adds weight, impact, and environmental interaction to make action feel grounded and powerful.',
        relatedTerms: ['impact-frame', 'effects-animation', 'kanada-school'],
        exampleClipId: clipMap['cowboy-bebop-spike-church']?.id,
      },
    }),
  ])
  console.log(`  Created ${glossaryTerms.length} glossary terms`)

  // ============================================
  // RANKING LISTS
  // ============================================
  console.log('Creating ranking lists...')
  const rankingLists = await Promise.all([
    prisma.rankingList.upsert({
      where: { slug: 'top-action-animators' },
      update: {},
      create: {
        slug: 'top-action-animators',
        title: 'Top Action Animators of All Time',
        description: 'Community-voted ranking of the greatest action key animators in anime history.',
        type: 'COMMUNITY',
        category: 'ANIMATOR',
        isActive: true,
      },
    }),
    prisma.rankingList.upsert({
      where: { slug: 'best-sakuga-moments-2024' },
      update: {},
      create: {
        slug: 'best-sakuga-moments-2024',
        title: 'Best Sakuga Moments of 2024',
        description: 'Editorial picks for the most impressive animation sequences released in 2024.',
        type: 'EDITORIAL',
        category: 'CLIP',
        isActive: true,
      },
    }),
  ])

  // Add ranking items
  const rankingItems = await Promise.all([
    prisma.rankingItem.upsert({
      where: { listId_rank: { listId: rankingLists[0]!.id, rank: 1 } },
      update: {},
      create: { listId: rankingLists[0]!.id, rank: 1, animatorId: animatorMap['yutaka-nakamura']!.id, voteCount: 2451 },
    }),
    prisma.rankingItem.upsert({
      where: { listId_rank: { listId: rankingLists[0]!.id, rank: 2 } },
      update: {},
      create: { listId: rankingLists[0]!.id, rank: 2, animatorId: animatorMap['norio-matsumoto']!.id, voteCount: 1893 },
    }),
    prisma.rankingItem.upsert({
      where: { listId_rank: { listId: rankingLists[0]!.id, rank: 3 } },
      update: {},
      create: { listId: rankingLists[0]!.id, rank: 3, animatorId: animatorMap['yoshinori-kanada']!.id, voteCount: 1756 },
    }),
    prisma.rankingItem.upsert({
      where: { listId_rank: { listId: rankingLists[0]!.id, rank: 4 } },
      update: {},
      create: { listId: rankingLists[0]!.id, rank: 4, animatorId: animatorMap['mitsuo-iso']!.id, voteCount: 1544 },
    }),
    prisma.rankingItem.upsert({
      where: { listId_rank: { listId: rankingLists[0]!.id, rank: 5 } },
      update: {},
      create: { listId: rankingLists[0]!.id, rank: 5, animatorId: animatorMap['toshiyuki-inoue']!.id, voteCount: 1320 },
    }),
  ])
  console.log(`  Created ${rankingLists.length} ranking lists with ${rankingItems.length} items`)

  // ============================================
  // DEMO USER
  // ============================================
  console.log('Creating demo user...')
  await prisma.user.upsert({
    where: { email: 'demo@sakuga-legends.dev' },
    update: {},
    create: {
      email: 'demo@sakuga-legends.dev',
      name: 'Demo User',
      role: 'CONTRIBUTOR',
      trustScore: 75,
      contributionCount: 12,
    },
  })
  console.log('  Created demo user')

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\nSeed complete!')
  console.log(`  Studios: ${studios.length}`)
  console.log(`  Anime: ${anime.length}`)
  console.log(`  Animators: ${animators.length}`)
  console.log(`  Studio Histories: ${studioHistories.length}`)
  console.log(`  Clips: ${clips.length}`)
  console.log(`  Attributions: ${attributions.length}`)
  console.log(`  Relations: ${relations.length}`)
  console.log(`  Tags: ${tags.length}`)
  console.log(`  Clip-Tag Associations: ${clipTagCount}`)
  console.log(`  Glossary Terms: ${glossaryTerms.length}`)
  console.log(`  Ranking Lists: ${rankingLists.length}`)
  console.log(`  Ranking Items: ${rankingItems.length}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
