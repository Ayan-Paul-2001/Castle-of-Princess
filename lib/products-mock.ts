export interface MockProduct {
  id: string
  productId: string
  name: string
  slug: string
  image: string
  images: string[]
  price: number
  salePrice?: number
  rating: number
  reviewCount: number
  featured: boolean
  trending: boolean
  onSale: boolean
  stock: number
  category: string
  brand: string
  skinTypes: string[]
  skinConcerns: string[]
  soldCount: number
  createdAt: string
  description: string
  shortDescription: string
  ingredients: string
  howToUse: string
  tags: string[]
}

export const mockProducts: MockProduct[] = [
  {
    id: '1',
    productId: 'prod_1',
    name: 'COSRX Advanced Snail 96 Mucin Power Essence',
    slug: 'cosrx-advanced-snail-96-mucin-power-essence',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&h=800&q=80',
    ],
    price: 3500,
    salePrice: 2800,
    rating: 4.8,
    reviewCount: 245,
    featured: true,
    trending: true,
    onSale: true,
    stock: 25,
    category: 'serum-essence',
    brand: 'COSRX',
    skinTypes: ['Dry', 'Normal', 'Combination', 'Sensitive'],
    skinConcerns: ['Hydration', 'Brightening', 'Aging'],
    soldCount: 420,
    createdAt: '2024-09-18',
    shortDescription: 'A hydrating essence with 96% snail mucin for radiant, rejuvenated skin.',
    description: `Experience the power of snail mucin with COSRX Advanced Snail 96 Mucin Power Essence. This lightweight essence is formulated with 96% snail secretion filtrate, which is rich in nutrients and helps to repair and rejuvenate your skin.\n\nSnail mucin has been used for centuries for its healing properties, and this essence harnesses that power in a concentrated formula. It helps to:\n- Hydrate and nourish dry skin\n- Reduce the appearance of fine lines and wrinkles\n- Improve skin texture and tone\n- Fade dark spots and hyperpigmentation\n- Speed up skin recovery\n\nThe lightweight, non-sticky formula absorbs quickly into the skin, making it perfect for layering with other skincare products. Suitable for all skin types, especially those with dry or damaged skin.`,
    ingredients: 'Snail Secretion Filtrate, Betaine, Sodium Hyaluronate, Panthenol, Allantoin, Arginine, Carbomer, Phenoxyethanol',
    howToUse: 'After cleansing and toning, apply a proper amount to face and massage gently for better absorption. Follow with moisturizer. Use morning and night.',
    tags: ['Hydrating', 'Snail Mucin', 'K-Beauty', 'Bestseller'],
  },
  {
    id: '2',
    productId: 'prod_2',
    name: 'Beauty of Joseon Relief Toner',
    slug: 'beauty-of-joseon-relief-toner',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1601612628452-9e99ced43524?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?w=800&h=800&fit=crop',
    ],
    price: 2200,
    rating: 4.9,
    reviewCount: 189,
    featured: true,
    trending: false,
    onSale: false,
    stock: 30,
    category: 'toner-mist',
    brand: 'Beauty of Joseon',
    skinTypes: ['Sensitive', 'Normal', 'Dry'],
    skinConcerns: ['Hydration', 'Brightening'],
    soldCount: 350,
    createdAt: '2024-10-03',
    shortDescription: 'A balancing daily toner inspired by traditional Korean herbal care to soothe and hydrate.',
    description: `A calming daily toner that balances, softens, and preps the skin barrier with lightweight hydration inspired by traditional Korean herbal care.\n\nFormulated with natural Hanbang ingredients (Korean traditional medicine) like rice extract and ginseng root water, it protects against environmental stressors while keeping the skin barrier hydrated and smooth. Ideal for preparing the skin to receive subsequent skincare layers.`,
    ingredients: 'Rice Bran Water, Ginseng Root Water, Green Tea Extract, Glycerin, Butylene Glycol, 1,2-Hexanediol',
    howToUse: 'After cleansing, pour a moderate amount onto cotton pads or clean hands and gently pat across the face and neck until absorbed.',
    tags: ['Toner', 'Hanbang', 'Soothing', 'Brightening'],
  },
  {
    id: '3',
    productId: 'prod_3',
    name: 'Anua Heartleaf 77% Soothing Toner',
    slug: 'anua-heartleaf-77-sooting-toner',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&h=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=800&fit=crop',
    ],
    price: 1950,
    salePrice: 1650,
    rating: 4.7,
    reviewCount: 156,
    featured: false,
    trending: true,
    onSale: true,
    stock: 8,
    category: 'toner-mist',
    brand: 'Anua',
    skinTypes: ['Sensitive', 'Oily', 'Combination'],
    skinConcerns: ['Acne', 'Hydration', 'Pore'],
    soldCount: 275,
    createdAt: '2024-11-12',
    shortDescription: 'A viral soothing toner with 77% Heartleaf extract to reduce redness and acne.',
    description: `A cult-favorite calming toner powered by high heartleaf concentration to soothe visible irritation, balance oil, and refresh acne-prone skin.\n\nThis extremely lightweight formula is designed specifically to target redness, inflammation, and troubled skin. It helps restore moisture-oil balance while gently exfoliating to clear pores and refine skin texture. Highly recommended for acne-prone skin types.`,
    ingredients: 'Houttuynia Cordata Extract (77%), Water, 1,2-Hexanediol, Glycerin, Betaine, Centella Asiatica Extract, Chamomilla Recutita (Matricaria) Flower Extract',
    howToUse: 'Apply a generous amount to clean skin morning and night. Can be used as a toner sheet mask by soaking cotton pads and placing on irritated areas for 5-10 minutes.',
    tags: ['Heartleaf', 'Sensitive Skin', 'Calming', 'Acne Care'],
  },
  {
    id: '4',
    productId: 'prod_4',
    name: 'Some By Mi AHA BHA PHA 30 Days Miracle Toner',
    slug: 'some-by-mi-aha-bha-pha-30-days-miracle-toner',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&h=800&q=80',
    ],
    price: 2800,
    rating: 4.6,
    reviewCount: 312,
    featured: true,
    trending: true,
    onSale: false,
    stock: 15,
    category: 'toner-mist',
    brand: 'Some By Mi',
    skinTypes: ['Oily', 'Combination'],
    skinConcerns: ['Acne', 'Pore'],
    soldCount: 390,
    createdAt: '2024-08-28',
    shortDescription: 'A multi-exfoliating toner that helps clear acne and brightens skin within 30 days.',
    description: `Cleanse and clear your skin with Some By Mi AHA BHA PHA 30 Days Miracle Toner. Contains 10,000ppm of natural tea tree extract alongside gentle chemical exfoliants (AHA, BHA, and PHA) to lift dead skin cells, shrink pores, and reduce acne without causing dryness.\n\nWith a pH of 5.5, it respects skin barrier health while active ingredients like Niacinamide help clear acne spots and hyperpigmentation. Perfect for oily, combination, or breakout-prone skin.`,
    ingredients: 'Water, Butylene Glycol, Dipropylene Glycol, Glycerin, Niacinamide, Melaleuca Alternifolia (Tea Tree) Leaf Extract, Salicylic Acid, Lactobionic Acid, Citric Acid',
    howToUse: 'Sweep gently across clean skin using a cotton pad. Avoid eye contours. Ideal for evening routines, followed by hydrating serums and creams.',
    tags: ['Exfoliating', 'Tea Tree', 'Acne Relief', 'Pore Control'],
  },
  {
    id: '5',
    productId: 'prod_5',
    name: 'Round Lab Dokdo Tone Softening Lotion',
    slug: 'round-lab-dokdo-tone-softening-lotion',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800&h=800&fit=crop',
    ],
    price: 2400,
    rating: 4.8,
    reviewCount: 98,
    featured: false,
    trending: false,
    onSale: false,
    stock: 22,
    category: 'moisturiser',
    brand: 'Round Lab',
    skinTypes: ['Dry', 'Sensitive', 'Normal'],
    skinConcerns: ['Hydration', 'Aging'],
    soldCount: 210,
    createdAt: '2024-07-09',
    shortDescription: 'A lightweight daily lotion with deep sea minerals for soft, supple skin.',
    description: `A lightweight lotion with mineral-rich hydration that leaves the skin silky, comfortable, and ready for layering without heaviness.\n\nEnriched with 72 types of natural minerals from Ulleungdo deep sea water, this daily lotion keeps the skin hydrated for 24 hours. The ultra-light fluid texture absorbs instantly without greasiness, soothing dryness and building a robust moisture barrier. Excellent for dry, normal, or highly sensitive skin.`,
    ingredients: 'Purified Water, Glycerin, Deep Sea Water, Panthenol, Allantoin, Triple Hyaluronic Acid, Macadamia Integrifolia Seed Oil',
    howToUse: 'After applying serum, pump a small amount onto fingers and sweep smoothly across the entire face and neck. Tap lightly to absorb.',
    tags: ['Lotion', 'Deep Sea Water', 'Mineral Hydration', 'Barrier Support'],
  },
  {
    id: '6',
    productId: 'prod_6',
    name: 'COSRX Low pH Good Morning Cleanser',
    slug: 'cosrx-low-ph-good-morning-cleanser',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop',
    ],
    price: 1800,
    salePrice: 1500,
    rating: 4.5,
    reviewCount: 423,
    featured: false,
    trending: true,
    onSale: true,
    stock: 40,
    category: 'cleanser',
    brand: 'COSRX',
    skinTypes: ['Oily', 'Combination', 'Normal'],
    skinConcerns: ['Acne', 'Pore'],
    soldCount: 480,
    createdAt: '2024-12-01',
    shortDescription: 'A gentle gel cleanser that maintains skin natural pH while lifting oil and dirt.',
    description: `Wake up to balanced, hydrated skin with the COSRX Low pH Good Morning Gel Cleanser. Formulated with tea tree oil and natural BHAs, this cleanser sweeps away sebum, old dead cells, and night-time residues while respecting the skin barrier's natural pH.\n\nThe mild gel texture turns into a rich, gentle lather upon contact with water, making it perfect for your daily morning and double-cleansing routines. Leaves skin feeling clean and refreshed without any tight or stripped sensation.`,
    ingredients: 'Water, Cocamidopropyl Betaine, Sodium Lauroyl Methyl Isethionate, Tea Tree Leaf Oil, Cryptomeria Japonica Leaf Extract, Salicylic Acid',
    howToUse: 'Squeeze a small amount onto damp hands. Work into a lather and massage gently over wet face, avoiding the eyes. Rinse thoroughly with lukewarm water.',
    tags: ['Gel Cleanser', 'Low pH', 'Tea Tree Oil', 'Daily Cleanse'],
  },
]
