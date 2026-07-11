export type AdminMetric = {
  title: string
  value: number
  change: number
  format?: 'number' | 'currency' | 'percentage'
}

export type AdminProduct = {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  brand: string
  category: string
  price: number
  salePrice?: number
  stock: number
  images: Array<{
    id: string
    url: string
    alt: string
    isPrimary: boolean
  }>
  skinTypes: string[]
  skinConcerns: string[]
  tags: string[]
  ingredients?: string
  howToUse?: string
  variants: Array<{
    id: string
    name: string
    value: string
    stock: number
    priceModifier: number
  }>
  rating: number
  reviewCount: number
  status: 'active' | 'draft'
  featured: boolean
  trending: boolean
  onSale: boolean
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  sku: string
  soldCount?: number
}

export type AdminCategory = {
  id: string
  name: string
  slug: string
  productCount: number
  featured: boolean
  image?: string
}

export type AdminOrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type AdminOrder = {
  id: string
  customer: string
  email: string
  amount: number
  status: AdminOrderStatus
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
  date: string
  items: number
  city: string
  transactionId?: string
  walletPhone?: string
  paymentMethod?: string
  shippingAddress?: {
    name: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
}

export type AdminCustomer = {
  id: string
  name: string
  email: string
  contactNumber: string
  orders: number
  spent: number
  city: string
  status: 'active' | 'vip' | 'inactive'
  lastOrder: string
}

export type AdminCoupon = {
  id: string
  code: string
  discount: number
  type: 'percent' | 'fixed'
  minimumSpend: number
  expiresAt: string
  active: boolean
  description?: string
}

export type AdminBanner = {
  id: string
  title: string
  placement: 'home-hero' | 'category-strip' | 'flash-sale'
  cta: string
  active: boolean
}

export type AdminSubscriber = {
  id: string
  email: string
  source: string
  subscribedAt: string
  status: 'subscribed' | 'unsubscribed'
}

export type AdminReview = {
  id: string
  product: string
  customer: string
  rating: number
  title: string
  status?: 'pending' | 'approved' | 'rejected'
  reply?: string
  replyBy?: string
  comment?: string
}

export const adminMetrics: AdminMetric[] = [
  { title: 'Total Revenue', value: 1250000, change: 12.5, format: 'currency' },
  { title: 'Total Orders', value: 456, change: 8.2 },
  { title: 'Total Customers', value: 1234, change: 15.3 },
  { title: 'Conversion Rate', value: 4.8, change: 1.4, format: 'percentage' },
]

export const adminProducts: AdminProduct[] = [
  {
    id: 'prod_1',
    name: 'COSRX Advanced Snail 96 Mucin Power Essence',
    slug: 'cosrx-advanced-snail-96-mucin-power-essence',
    description:
      'A deeply hydrating Korean essence enriched with snail secretion filtrate to visibly plump, repair, and smooth tired skin while supporting a glossy glass-skin finish.',
    shortDescription: 'Iconic repair essence for hydration, bounce, and glow.',
    brand: 'COSRX',
    category: 'Serum & Essence',
    price: 3500,
    salePrice: 2800,
    stock: 25,
    soldCount: 125,
    images: [
      {
        id: 'prod_1_img_1',
        url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
        alt: 'COSRX Snail essence hero bottle',
        isPrimary: true,
      },
      {
        id: 'prod_1_img_2',
        url: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1200&q=80',
        alt: 'Hydrating essence texture close-up',
        isPrimary: false,
      },
    ],
    skinTypes: ['dry', 'normal', 'combination', 'sensitive'],
    skinConcerns: ['hydration', 'brightening'],
    tags: ['snail mucin', 'repair', 'glass skin'],
    ingredients: 'Snail secretion filtrate, sodium hyaluronate, panthenol.',
    howToUse: 'Apply after toner and pat into skin morning and night.',
    variants: [
      {
        id: 'prod_1_var_1',
        name: 'Size',
        value: '100ml',
        stock: 25,
        priceModifier: 0,
      },
    ],
    rating: 4.9,
    reviewCount: 128,
    status: 'active',
    featured: true,
    trending: true,
    onSale: true,
    seo: {
      title: 'COSRX Snail 96 Mucin Essence in Bangladesh',
      description: 'Premium Korean snail essence for deep hydration and glow.',
      keywords: ['cosrx bangladesh', 'snail mucin essence', 'glass skin essence'],
    },
    sku: 'COP-COSRX-001',
  },
  {
    id: 'prod_2',
    name: 'Beauty of Joseon Relief Toner',
    slug: 'beauty-of-joseon-relief-toner',
    description:
      'A calming daily toner that balances, softens, and preps the skin barrier with lightweight hydration inspired by traditional Korean herbal care.',
    shortDescription: 'Balancing daily toner for calm, clear, refined skin.',
    brand: 'Beauty of Joseon',
    category: 'Toner & Mist',
    price: 2200,
    stock: 30,
    soldCount: 98,
    images: [
      {
        id: 'prod_2_img_1',
        url: 'https://images.unsplash.com/photo-1601612628452-9e99ced43524?auto=format&fit=crop&w=1200&q=80',
        alt: 'Beauty of Joseon toner bottle',
        isPrimary: true,
      },
      {
        id: 'prod_2_img_2',
        url: 'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=1200&q=80',
        alt: 'Korean toner styling visual',
        isPrimary: false,
      },
    ],
    skinTypes: ['normal', 'combination', 'sensitive'],
    skinConcerns: ['hydration', 'brightening'],
    tags: ['toner', 'hanbang', 'soothing'],
    ingredients: 'Rice extract, ginseng root water, green tea extract.',
    howToUse: 'Sweep across face after cleansing using hands or cotton pad.',
    variants: [
      {
        id: 'prod_2_var_1',
        name: 'Size',
        value: '150ml',
        stock: 30,
        priceModifier: 0,
      },
    ],
    rating: 4.7,
    reviewCount: 86,
    status: 'active',
    featured: true,
    trending: false,
    onSale: false,
    seo: {
      title: 'Beauty of Joseon Relief Toner Bangladesh',
      description: 'A gentle balancing toner for everyday glow and calm skin.',
      keywords: ['beauty of joseon toner', 'korean toner bd', 'relief toner'],
    },
    sku: 'COP-BOJ-002',
  },
  {
    id: 'prod_3',
    name: 'Anua Heartleaf 77% Soothing Toner',
    slug: 'anua-heartleaf-77-soothing-toner',
    description:
      'A cult-favorite calming toner powered by high heartleaf concentration to soothe visible irritation, balance oil, and refresh acne-prone skin.',
    shortDescription: 'Soothing toner for redness, oil balance, and clarity.',
    brand: 'Anua',
    category: 'Toner & Mist',
    price: 1950,
    salePrice: 1650,
    stock: 8,
    soldCount: 87,
    images: [
      {
        id: 'prod_3_img_1',
        url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80',
        alt: 'Anua heartleaf toner product image',
        isPrimary: true,
      },
      {
        id: 'prod_3_img_2',
        url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80',
        alt: 'Calming skincare bottle detail',
        isPrimary: false,
      },
    ],
    skinTypes: ['oily', 'combination', 'sensitive'],
    skinConcerns: ['acne', 'pore', 'hydration'],
    tags: ['heartleaf', 'sensitive skin', 'calming toner'],
    ingredients: 'Heartleaf extract, centella asiatica, panthenol.',
    howToUse: 'Layer 1 to 3 times onto clean skin for soothing hydration.',
    variants: [
      {
        id: 'prod_3_var_1',
        name: 'Size',
        value: '250ml',
        stock: 8,
        priceModifier: 0,
      },
    ],
    rating: 4.8,
    reviewCount: 63,
    status: 'active',
    featured: false,
    trending: true,
    onSale: true,
    seo: {
      title: 'Anua Heartleaf 77 Toner Bangladesh',
      description: 'A viral Korean soothing toner for acne-prone and sensitive skin.',
      keywords: ['anua toner', 'heartleaf toner', 'acne toner bd'],
    },
    sku: 'COP-ANUA-003',
  },
  {
    id: 'prod_4',
    name: 'Round Lab Dokdo Tone Softening Lotion',
    slug: 'round-lab-dokdo-tone-softening-lotion',
    description:
      'A lightweight lotion with mineral-rich hydration that leaves the skin silky, comfortable, and ready for layering without heaviness.',
    shortDescription: 'Silky mineral lotion for lightweight daily moisture.',
    brand: 'Round Lab',
    category: 'Moisturiser',
    price: 2400,
    stock: 22,
    soldCount: 34,
    images: [
      {
        id: 'prod_4_img_1',
        url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
        alt: 'Round Lab lotion bottle flatlay',
        isPrimary: true,
      },
      {
        id: 'prod_4_img_2',
        url: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=1200&q=80',
        alt: 'Moisturising lotion texture visual',
        isPrimary: false,
      },
    ],
    skinTypes: ['dry', 'normal', 'combination'],
    skinConcerns: ['hydration', 'brightening'],
    tags: ['dokdo', 'lotion', 'daily moisturiser'],
    ingredients: 'Deep sea water, panthenol, allantoin.',
    howToUse: 'Use as a lightweight moisturiser after serum.',
    variants: [
      {
        id: 'prod_4_var_1',
        name: 'Size',
        value: '200ml',
        stock: 22,
        priceModifier: 0,
      },
    ],
    rating: 4.5,
    reviewCount: 31,
    status: 'draft',
    featured: false,
    trending: false,
    onSale: false,
    seo: {
      title: 'Round Lab Dokdo Lotion Bangladesh',
      description: 'Silky lightweight moisturiser for balanced hydration.',
      keywords: ['round lab dokdo', 'korean moisturiser bd', 'dokdo lotion'],
    },
    sku: 'COP-RLAB-004',
  },
]

export const adminCategories: AdminCategory[] = [
  {
    id: 'cat_1',
    name: 'Cleanser',
    slug: 'cleanser',
    productCount: 14,
    featured: true,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cat_2',
    name: 'Toner & Mist',
    slug: 'toner-mist',
    productCount: 19,
    featured: true,
    image: 'https://images.unsplash.com/photo-1601612628452-9e99ced43524?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cat_3',
    name: 'Serum & Essence',
    slug: 'serum-essence',
    productCount: 22,
    featured: true,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cat_4',
    name: 'Moisturiser',
    slug: 'moisturiser',
    productCount: 16,
    featured: false,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
  },
]

export const adminOrders: AdminOrder[] = [
  {
    id: 'CP202401001',
    customer: 'Fatima Rahman',
    email: 'fatima@example.com',
    amount: 5800,
    status: 'processing',
    paymentStatus: 'paid',
    date: '2026-05-21',
    items: 2,
    city: 'Dhaka',
  },
  {
    id: 'CP202401002',
    customer: 'Ayesha Khan',
    email: 'ayesha@example.com',
    amount: 3200,
    status: 'shipped',
    paymentStatus: 'paid',
    date: '2026-05-20',
    items: 1,
    city: 'Chattogram',
  },
  {
    id: 'CP202401003',
    customer: 'Sadia Islam',
    email: 'sadia@example.com',
    amount: 8900,
    status: 'pending',
    paymentStatus: 'pending',
    date: '2026-04-19',
    items: 3,
    city: 'Sylhet',
  },
  {
    id: 'CP202401004',
    customer: 'Nadia Hassan',
    email: 'nadia@example.com',
    amount: 4500,
    status: 'delivered',
    paymentStatus: 'paid',
    date: '2026-03-18',
    items: 2,
    city: 'Khulna',
  },
]

export const adminCustomers: AdminCustomer[] = [
  {
    id: 'cus_1',
    name: 'Fatima Rahman',
    email: 'fatima@example.com',
    contactNumber: '+8801712345678',
    orders: 8,
    spent: 26500,
    city: 'Dhaka',
    status: 'vip',
    lastOrder: '2026-05-21',
  },
  {
    id: 'cus_2',
    name: 'Ayesha Khan',
    email: 'ayesha@example.com',
    contactNumber: '+8801812345678',
    orders: 4,
    spent: 12200,
    city: 'Chattogram',
    status: 'active',
    lastOrder: '2026-05-20',
  },
  {
    id: 'cus_3',
    name: 'Sadia Islam',
    email: 'sadia@example.com',
    contactNumber: '+8801912345678',
    orders: 1,
    spent: 8900,
    city: 'Sylhet',
    status: 'active',
    lastOrder: '2026-05-19',
  },
  {
    id: 'cus_4',
    name: 'Maliha Noor',
    email: 'maliha@example.com',
    contactNumber: '+8801612345678',
    orders: 0,
    spent: 0,
    city: 'Dhaka',
    status: 'inactive',
    lastOrder: 'No orders yet',
  },
]

export const adminCoupons: AdminCoupon[] = [
  {
    id: 'coupon_1',
    code: 'GLOW10',
    discount: 10,
    type: 'percent',
    minimumSpend: 2500,
    expiresAt: '2026-06-30',
    active: true,
  },
  {
    id: 'coupon_2',
    code: 'PRINCESS500',
    discount: 500,
    type: 'fixed',
    minimumSpend: 4000,
    expiresAt: '2026-07-15',
    active: true,
  },
]

export const adminBanners: AdminBanner[] = [
  {
    id: 'banner_1',
    title: 'Flash Sale on Best Sellers',
    placement: 'home-hero',
    cta: 'Shop the sale',
    active: true,
  },
  {
    id: 'banner_2',
    title: 'Sensitive Skin Week',
    placement: 'category-strip',
    cta: 'Explore calming care',
    active: false,
  },
]

export const adminSubscribers: AdminSubscriber[] = [
  {
    id: 'sub_1',
    email: 'glowlover@example.com',
    source: 'Homepage newsletter',
    subscribedAt: '2026-05-20',
    status: 'subscribed',
  },
  {
    id: 'sub_2',
    email: 'beautyfeed@example.com',
    source: 'Blog article',
    subscribedAt: '2026-05-18',
    status: 'subscribed',
  },
  {
    id: 'sub_3',
    email: 'optout@example.com',
    source: 'Campaign landing page',
    subscribedAt: '2026-05-11',
    status: 'unsubscribed',
  },
]

export const adminReviews: AdminReview[] = [
  {
    id: 'rev_1',
    product: 'COSRX Advanced Snail 96 Mucin Power Essence',
    customer: 'Fatima Rahman',
    rating: 5,
    title: 'Skin feels deeply hydrated',
    status: 'approved',
  },
  {
    id: 'rev_2',
    product: 'Anua Heartleaf 77% Soothing Toner',
    customer: 'Ayesha Khan',
    rating: 4,
    title: 'Very calming for redness',
    status: 'pending',
  },
  {
    id: 'rev_3',
    product: 'Beauty of Joseon Relief Toner',
    customer: 'Nadia Hassan',
    rating: 3,
    title: 'Nice but packaging arrived damaged',
    status: 'rejected',
  },
]

export const topProducts = [
  { name: 'COSRX Snail Mucin', sales: 125 },
  { name: 'Beauty of Joseon Toner', sales: 98 },
  { name: 'Anua Heartleaf Toner', sales: 87 },
  { name: 'Some By Mi Toner', sales: 76 },
]

export const lowStockProducts = [
  { name: 'Anua Heartleaf Toner', stock: 3 },
  { name: 'COSRX Salicylic Acid', stock: 5 },
  { name: 'Some By Mi Serum', stock: 2 },
]
