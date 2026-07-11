export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  image: string
  category: string
  readTime: string
  publishedAt: string
  author: string
  href: string
  ctaLabel: string
  ctaHref: string
  keyPoints: string[]
  sections: {
    heading: string
    paragraphs: string[]
  }[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'korean-skincare-routine',
    title: 'How to Build a Korean Skincare Routine for Bangladesh Weather',
    excerpt:
      'A balanced routine for humidity, heat, and barrier care using lightweight layers that still feel luxurious.',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&h=1100&fit=crop&auto=format',
    category: 'Routine Guide',
    readTime: '6 min read',
    publishedAt: 'May 25, 2026',
    author: 'Castle of Princess Editorial Team',
    href: '/blog/korean-skincare-routine',
    ctaLabel: 'Shop routine essentials',
    ctaHref: '/products?sort=featured',
    keyPoints: [
      'Choose breathable layers for humid weather instead of heavy cream stacking.',
      'Protect the barrier with gentle cleansing and steady hydration.',
      'Use sunscreen daily to preserve glow, tone, and long-term skin clarity.',
    ],
    sections: [
      {
        heading: 'Start with climate-aware cleansing',
        paragraphs: [
          'Bangladesh weather often means heat, humidity, dust, and longer hours outdoors. That makes the first step of a Korean skincare routine especially important. You want a cleanser that removes sweat, sunscreen, and buildup without leaving the skin overly tight.',
          'A low-pH cleanser works well because it keeps the routine elegant and effective while avoiding that stripped feeling that can trigger more oil or irritation later in the day.',
        ],
      },
      {
        heading: 'Layer hydration without making skin heavy',
        paragraphs: [
          'The best K-beauty routines for this climate rely on fluid layers rather than thick texture overload. A lightweight toner, followed by a treatment essence or serum, gives skin hydration while still feeling breathable.',
          'If the skin is combination or oily, one serum and one gel-cream moisturiser is usually enough. Dry or barrier-weakened skin can go one step richer at night with a more cushioning moisturiser.',
        ],
      },
      {
        heading: 'Keep actives strategic and elegant',
        paragraphs: [
          'A premium routine is not about adding the most steps. It is about choosing the fewest steps that work together. Acne-prone skin may benefit from BHA or niacinamide, while dull skin can lean into brightening ingredients like vitamin C, rice extract, or propolis.',
          'Keep the routine calm, consistent, and visually refined. Your results usually improve more from regularity than from aggressive product rotation.',
        ],
      },
      {
        heading: 'Never skip daytime protection',
        paragraphs: [
          'Sunscreen completes the routine. It protects against visible darkening, post-acne marks, and dehydration caused by sun exposure. In a hot climate, elegant UV protection should feel lightweight, fresh, and easy to reapply.',
          'When sunscreen feels beautiful on the skin, consistency becomes effortless. That is one of the biggest reasons Korean skincare routines remain so effective in daily life.',
        ],
      },
    ],
  },
  {
    slug: 'glass-skin-guide',
    title: 'The Modern Glass Skin Guide: Glow Without Grease',
    excerpt:
      'Discover the textures, formulas, and layering rhythm behind dewy, luminous skin that still feels refined.',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&h=1100&fit=crop&auto=format',
    category: 'Glow',
    readTime: '5 min read',
    publishedAt: 'May 25, 2026',
    author: 'Castle of Princess Editorial Team',
    href: '/blog/glass-skin-guide',
    ctaLabel: 'Shop glass skin edit',
    ctaHref: '/products?concern=glass-skin',
    keyPoints: [
      'Glass skin comes from hydration, smoothness, and consistent barrier care.',
      'Glow looks most luxurious when the skin stays clear and balanced, not greasy.',
      'Snail mucin, rice extract, and propolis are strong foundations for this routine.',
    ],
    sections: [
      {
        heading: 'Glass skin starts with smooth texture',
        paragraphs: [
          'The most recognizable part of glass skin is light reflection. That reflection only happens when skin texture looks even, hydrated, and calm. Before chasing shine, focus on reducing roughness, dehydration, and irritation.',
          'Gentle exfoliation once or twice a week can help, but the real transformation usually comes from repeated hydration and barrier repair over time.',
        ],
      },
      {
        heading: 'Use formulas that build clarity and bounce',
        paragraphs: [
          'Toners and essences with rice, snail mucin, panthenol, or hyaluronic acid are ideal because they bring both water content and a cushioned finish to the skin. These formulas help create the soft, luminous look associated with modern glow routines.',
          'A serum can then add focus, whether that means extra brightening, calmness, or elasticity.',
        ],
      },
      {
        heading: 'Finish with a polished glow, not an oily one',
        paragraphs: [
          'A lightweight moisturiser is often enough during the day, especially in warm weather. The goal is a satin-fresh finish that holds moisture in place without sliding into visible oiliness.',
          'The best glass skin results come from balance. When the skin barrier is supported, the glow looks expensive, healthy, and naturally lit from within.',
        ],
      },
    ],
  },
  {
    slug: 'acne-treatment',
    title: 'Acne-Friendly K-Beauty Ingredients That Actually Make Sense',
    excerpt:
      'A premium, beginner-friendly breakdown of calming exfoliants, pore care, and hydration for breakout-prone skin.',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1400&h=1100&fit=crop&auto=format',
    category: 'Acne Care',
    readTime: '7 min read',
    publishedAt: 'May 25, 2026',
    author: 'Castle of Princess Editorial Team',
    href: '/blog/acne-treatment',
    ctaLabel: 'Shop acne care',
    ctaHref: '/products?concern=acne',
    keyPoints: [
      'BHA helps with congestion, but hydration keeps acne routines sustainable.',
      'Soothing ingredients matter just as much as treatment actives.',
      'Consistent, moderate skincare usually outperforms harsh routines.',
    ],
    sections: [
      {
        heading: 'Treat breakouts without punishing the skin',
        paragraphs: [
          'Many acne routines fail because they become too aggressive too quickly. Over-cleansing, over-exfoliating, or combining too many actives can leave the skin reactive, dehydrated, and more inflamed.',
          'K-beauty routines tend to work well because they blend treatment with comfort. That means clarifying ingredients are usually paired with hydration and calmness.',
        ],
      },
      {
        heading: 'Look for actives with a clear role',
        paragraphs: [
          'BHA helps unclog pores and smooth congestion. Niacinamide can support oil balance and tone. Tea tree, centella, or heartleaf can calm visible irritation and help routines feel more wearable for sensitive breakout-prone skin.',
          'Instead of stacking every trend ingredient together, choose one or two targeted steps and let them work consistently for several weeks.',
        ],
      },
      {
        heading: 'Hydration protects progress',
        paragraphs: [
          'Acne skin still needs moisture. A well-hydrated skin barrier is more resilient and often less reactive overall. Lightweight layers, soothing toners, and a breathable moisturiser help the routine stay comfortable.',
          'This is where premium skincare feels different. The best formulas are effective, but they also keep the skin looking calm, refined, and balanced while you treat the concern.',
        ],
      },
    ],
  },
  {
    slug: 'brand-review',
    title: 'Best Korean Skincare Brands to Start With in 2026',
    excerpt:
      'A quick editorial guide to COSRX, Beauty of Joseon, Anua, Some By Mi, and Round Lab.',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&h=1100&fit=crop&auto=format',
    category: 'Brand Review',
    readTime: '4 min read',
    publishedAt: 'May 25, 2026',
    author: 'Castle of Princess Editorial Team',
    href: '/blog/brand-review',
    ctaLabel: 'Browse brand collections',
    ctaHref: '/brands',
    keyPoints: [
      'Each brand serves a slightly different skin mood, concern, and texture preference.',
      'The best starting point depends on your concern, not on hype alone.',
      'A curated store experience helps narrow premium brands into practical choices.',
    ],
    sections: [
      {
        heading: 'Start with your skin goal',
        paragraphs: [
          'The easiest way to choose a Korean skincare brand is by asking what your skin needs most right now. Barrier comfort, breakouts, glow, calmness, and lightweight moisture all point toward different hero brands.',
          'When a store curates carefully, the brand page becomes a shortcut rather than a wall of names.',
        ],
      },
      {
        heading: 'What each major brand does well',
        paragraphs: [
          'COSRX is a strong starting point for repair, gentle acne care, and dependable daily essentials. Beauty of Joseon leans into glow, brightening, and elegant Hanbang-inspired formulas. Anua is excellent for calming stressed, reactive complexions.',
          'Some By Mi is more treatment-focused, especially for pores and texture. Round Lab is often the comfort choice for soft hydration and barrier support.',
        ],
      },
      {
        heading: 'Luxury discovery should still feel practical',
        paragraphs: [
          'A premium skincare shopping experience should feel beautiful, but it also needs to guide you clearly. The best brand edits make it obvious where to start and where to go next.',
          'That is why curated brand libraries matter. They transform product discovery into a more confident, more emotionally engaging journey.',
        ],
      },
    ],
  },
]

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}
