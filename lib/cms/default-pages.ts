export type CmsPageSeed = {
  key: 'home' | 'brands' | 'about'
  title: string
  sections: Array<{
    id: string
    type: string
    enabled: boolean
    data: any
  }>
}

export const defaultCmsPages: Record<CmsPageSeed['key'], CmsPageSeed> = {
  home: {
    key: 'home',
    title: 'Home Page',
    sections: [
      {
        id: 'home_hero',
        type: 'home.hero',
        enabled: true,
        data: {
          autoSlideMs: 5000,
          particles: [
            { left: '8%', top: '18%', delay: '0.2s' },
            { left: '15%', top: '70%', delay: '1.1s' },
            { left: '22%', top: '38%', delay: '0.7s' },
            { left: '30%', top: '82%', delay: '1.8s' },
            { left: '37%', top: '16%', delay: '0.4s' },
            { left: '43%', top: '58%', delay: '1.4s' },
            { left: '51%', top: '26%', delay: '0.9s' },
            { left: '59%', top: '76%', delay: '1.6s' },
            { left: '66%', top: '35%', delay: '0.6s' },
            { left: '74%', top: '63%', delay: '1.3s' },
            { left: '82%', top: '22%', delay: '0.5s' },
            { left: '89%', top: '48%', delay: '1.9s' },
          ],
          slides: [
            {
              eyebrow: 'Luxury K-Beauty',
              title: 'Glossy Rituals For Radiant Skin',
              description:
                'Discover premium Korean skincare and cosmetics curated for modern beauty lovers in Bangladesh.',
              accent:
                'Exclusive launches, bestsellers, and silky formulas in one destination.',
              image:
                'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80',
              primaryHref: '/products',
              primaryLabel: 'Shop The Collection',
              secondaryHref: '/products?featured=true',
              secondaryLabel: 'View Featured',
            },
            {
              eyebrow: 'Glass Skin Edit',
              title: 'Hydration That Looks Like Light',
              description:
                'Build a glow-first routine with essences, toners, and serums from iconic Korean skincare brands.',
              accent:
                'Shop glossy textures and barrier-loving formulas for luminous skin.',
              image:
                'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1600&q=80',
              primaryHref: '/products?concern=glass-skin',
              primaryLabel: 'Shop Glass Skin',
              secondaryHref: '/products?category=serum-essence',
              secondaryLabel: 'Explore Serums',
            },
            {
              eyebrow: 'Flash Beauty Drop',
              title: 'New Season. New Princess Energy.',
              description:
                'Elevate your beauty shelf with trending Korean skincare, makeup, and limited-time luxury offers.',
              accent:
                'Designed for soft glam mornings, silky nights, and premium gifting.',
              image:
                'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80',
              primaryHref: '/products?onSale=true',
              primaryLabel: 'Shop Offers',
              secondaryHref: '/about',
              secondaryLabel: 'Our Story',
            },
          ],
        },
      },
      {
        id: 'home_categories',
        type: 'home.categories',
        enabled: true,
        data: {
          eyebrow: 'Categories',
          title: 'Shop By Category',
          description: 'Curated skincare essentials for every step of your ritual.',
          items: [
            {
              name: 'Cleanser',
              slug: 'cleanser',
              image: '/categories/Cleanser.jpg',
              description: 'Daily cleansing essentials for soft, balanced skin.',
            },
            {
              name: 'Toner & Mist',
              slug: 'toner-mist',
              image: '/categories/Toner%20%26%20Mist.jpg',
              description: 'Hydrating layers that prep your skin for glow.',
            },
            {
              name: 'Serum & Essence',
              slug: 'serum-essence',
              image: '/categories/Serum%20%26%20Essence.jpg',
              description: 'Targeted treatments for radiance, calm, and clarity.',
            },
            {
              name: 'Moisturiser',
              slug: 'moisturiser',
              image: '/categories/Moisturiser.jpg',
              description: 'Silky moisture to seal in hydration and comfort.',
            },
            {
              name: 'Sun Protection',
              slug: 'sun-protection',
              image: '/categories/Sun%20Protection.jpg',
              description: 'Daily SPF protection with elegant lightweight textures.',
            },
            {
              name: 'Face Mask',
              slug: 'face-mask',
              image: '/categories/Face%20Mask.jpg',
              description: 'Weekly glow rituals for a smoother, brighter finish.',
            },
          ],
        },
      },
      {
        id: 'home_gallery',
        type: 'home.gallery',
        enabled: true,
        data: {
          eyebrow: 'Gallery',
          title: 'Luxury Beauty Gallery',
          description: 'Editorial imagery that matches the mood of your routine.',
          items: [
            {
              title: 'Glossy Shelf',
              subtitle: 'Luxury skincare display',
              image:
                'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=900&h=1200&fit=crop&auto=format',
              span: 'md:row-span-2',
            },
            {
              title: 'Radiance Ritual',
              subtitle: 'Silky textures and soft glow',
              image:
                'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&h=900&fit=crop&auto=format',
              span: '',
            },
            {
              title: 'K-Beauty Mood',
              subtitle: 'Modern feminine beauty',
              image:
                'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&h=900&fit=crop&auto=format',
              span: '',
            },
            {
              title: 'Premium Care',
              subtitle: 'Hydration, calm, and glow',
              image:
                'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&h=1200&fit=crop&auto=format',
              span: '',
            },
            {
              title: 'Beauty Ritual',
              subtitle: 'Editorial-inspired luxury frame',
              image:
                'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=900&h=1200&fit=crop&auto=format',
              span: 'md:col-span-2',
            },
            {
              title: 'Silk Glow',
              subtitle: 'Soft gold ambience',
              image:
                'https://images.unsplash.com/photo-1526045478516-99145907023c?w=900&h=1200&fit=crop&auto=format',
              span: '',
            },
            {
              title: 'Night Ritual',
              subtitle: 'Cinematic skincare mood',
              image:
                'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&h=900&fit=crop&auto=format',
              span: '',
            },
            {
              title: 'Gloss Finish',
              subtitle: 'Luminous textures',
              image:
                'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=900&h=900&fit=crop&auto=format',
              span: '',
            },
          ],
        },
      },
      {
        id: 'home_best_selling',
        type: 'home.bestSelling',
        enabled: true,
        data: {
          eyebrow: 'Best Selling',
          title: 'Best Selling Essentials',
          description: 'Shop the products customers repurchase for barrier comfort and glow.',
          ctaHref: '/products?sort=best-selling',
          ctaLabel: 'Explore Best Selling',
          beautyShots: [
            {
              title: 'Glow Ritual',
              image:
                'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&h=1200&fit=crop&auto=format',
            },
            {
              title: 'Editorial Shelf',
              image:
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1200&fit=crop&auto=format',
            },
            {
              title: 'Soft Luxury',
              image:
                'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&h=1200&fit=crop&auto=format',
            },
          ],
          products: [
            {
              id: 'best-1',
              productId: 'best-prod-1',
              name: 'COSRX Advanced Snail 96 Mucin Power Essence',
              slug: 'cosrx-advanced-snail-96-mucin-power-essence',
              image:
                'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=700&fit=crop',
              price: 3500,
              salePrice: 2800,
              rating: 4.8,
              reviewCount: 245,
              featured: true,
              trending: true,
              onSale: true,
              stock: 25,
            },
            {
              id: 'best-2',
              productId: 'best-prod-2',
              name: 'Beauty of Joseon Relief Toner',
              slug: 'beauty-of-joseon-relief-toner',
              image:
                'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=700&fit=crop',
              price: 2200,
              rating: 4.9,
              reviewCount: 189,
              featured: true,
              trending: false,
              onSale: false,
              stock: 30,
            },
            {
              id: 'best-3',
              productId: 'best-prod-3',
              name: 'Some By Mi AHA BHA PHA Miracle Toner',
              slug: 'some-by-mi-aha-bha-pha-miracle-toner',
              image:
                'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=700&fit=crop',
              price: 2800,
              salePrice: 2490,
              rating: 4.7,
              reviewCount: 312,
              featured: false,
              trending: true,
              onSale: true,
              stock: 18,
            },
            {
              id: 'best-4',
              productId: 'best-prod-4',
              name: 'Anua Heartleaf 77% Soothing Toner',
              slug: 'anua-heartleaf-77-soothing-toner',
              image:
                'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&h=700&q=80',
              price: 1950,
              salePrice: 1650,
              rating: 4.7,
              reviewCount: 156,
              featured: false,
              trending: true,
              onSale: true,
              stock: 8,
            },
          ],
        },
      },
      {
        id: 'home_featured_products',
        type: 'home.featuredProducts',
        enabled: true,
        data: {
          eyebrow: 'Featured',
          title: 'Featured Products',
          description: 'A premium edit of hero formulas and top-rated essentials.',
          ctaHref: '/products?featured=true',
          ctaLabel: 'Browse Featured',
          products: [
            {
              id: 'feat-1',
              productId: 'feat-prod-1',
              name: 'Round Lab Dokdo Tone Softening Lotion',
              slug: 'round-lab-dokdo-tone-softening-lotion',
              image:
                'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=700&fit=crop',
              price: 2400,
              rating: 4.8,
              reviewCount: 98,
              featured: true,
              trending: false,
              onSale: false,
              stock: 22,
            },
            {
              id: 'feat-2',
              productId: 'feat-prod-2',
              name: 'COSRX Low pH Good Morning Cleanser',
              slug: 'cosrx-low-ph-good-morning-cleanser',
              image:
                'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=700&fit=crop',
              price: 1800,
              salePrice: 1500,
              rating: 4.5,
              reviewCount: 423,
              featured: true,
              trending: true,
              onSale: true,
              stock: 40,
            },
            {
              id: 'feat-3',
              productId: 'feat-prod-3',
              name: 'Premium Glow Barrier Cream',
              slug: 'premium-glow-barrier-cream',
              image:
                'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=700&fit=crop',
              price: 3200,
              salePrice: 2890,
              rating: 4.9,
              reviewCount: 134,
              featured: true,
              trending: false,
              onSale: true,
              stock: 16,
            },
            {
              id: 'feat-4',
              productId: 'feat-prod-4',
              name: 'Silky UV Defense Sun Essence',
              slug: 'silky-uv-defense-sun-essence',
              image:
                'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=600&h=700&fit=crop',
              price: 2600,
              rating: 4.6,
              reviewCount: 87,
              featured: true,
              trending: true,
              onSale: false,
              stock: 11,
            },
          ],
        },
      },
      {
        id: 'home_all_products_mini',
        type: 'home.allProductsMini',
        enabled: true,
        data: {
          eyebrow: 'All Products',
          title: 'All Products',
          description: 'A quick peek into the full collection.',
          items: [
            {
              name: 'Snail Mucin Essence',
              slug: 'cosrx-advanced-snail-96-mucin-power-essence',
              image:
                'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop',
              price: '৳2,800',
            },
            {
              name: 'Relief Toner',
              slug: 'beauty-of-joseon-relief-toner',
              image:
                'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=300&h=300&fit=crop',
              price: '৳2,200',
            },
            {
              name: 'Heartleaf Toner',
              slug: 'anua-heartleaf-77-soothing-toner',
              image:
                'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&h=300&q=80',
              price: '৳1,650',
            },
            {
              name: 'Miracle Toner',
              slug: 'some-by-mi-aha-bha-pha-miracle-toner',
              image:
                'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
              price: '৳2,490',
            },
            {
              name: 'Dokdo Lotion',
              slug: 'round-lab-dokdo-tone-softening-lotion',
              image:
                'https://images.unsplash.com/photo-1617897903246-719242758050?w=300&h=300&fit=crop',
              price: '৳2,400',
            },
            {
              name: 'Morning Cleanser',
              slug: 'cosrx-low-ph-good-morning-cleanser',
              image:
                'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop',
              price: '৳1,500',
            },
            {
              name: 'Barrier Cream',
              slug: 'premium-glow-barrier-cream',
              image:
                'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
              price: '৳2,890',
            },
            {
              name: 'Sun Essence',
              slug: 'silky-uv-defense-sun-essence',
              image:
                'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=300&h=300&fit=crop',
              price: '৳2,600',
            },
          ],
        },
      },
      {
        id: 'home_featured_brands',
        type: 'home.brands',
        enabled: true,
        data: {
          eyebrow: 'Brands',
          title: 'Featured Brands',
          description:
            'Discover the premium names behind Castle of Princess, selected for modern glow rituals.',
          brands: [
            'COSRX',
            'Beauty of Joseon',
            'Anua',
            'Some By Mi',
            'Round Lab',
            'SKIN1004',
            'Laneige',
            'Innisfree',
          ],
        },
      },
      {
        id: 'home_concerns',
        type: 'home.concerns',
        enabled: true,
        data: {
          eyebrow: 'Shop by Concern',
          title: 'Find Your Perfect Solution',
          items: [
            { name: 'Acne', icon: '🔥' },
            { name: 'Dry Skin', icon: '💧' },
            { name: 'Oily Skin', icon: '⚡' },
            { name: 'Sensitive', icon: '🌸' },
            { name: 'Glass Skin', icon: '✨' },
            { name: 'Dark Spots', icon: '🌙' },
          ],
        },
      },
      {
        id: 'home_reviews',
        type: 'home.reviews',
        enabled: true,
        data: {
          eyebrow: 'Customer Reviews',
          title: 'Loved By Beauty Customers',
          description:
            'Real feedback from customers who trust Castle of Princess for authentic Korean skincare and cosmetics.',
          items: [
            {
              name: 'Nusrat Jahan',
              location: 'Dhaka',
              rating: 5,
              image:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&auto=format',
              title: 'The products feel genuinely premium',
              review:
                'My order arrived beautifully packed and every product felt authentic. The COSRX essence completely changed my skin texture within weeks.',
            },
            {
              name: 'Farzana Ahmed',
              location: 'Chattogram',
              rating: 5,
              image:
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&auto=format',
              title: 'Luxury shopping experience',
              review:
                'The website looks elegant and the skincare selection is amazing. I loved how easy it was to find products for sensitive skin.',
            },
            {
              name: 'Sadia Rahman',
              location: 'Sylhet',
              rating: 5,
              image:
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&auto=format',
              title: 'Best K-beauty store I have tried',
              review:
                'I ordered toner, cleanser, and sunscreen. Everything was original, delivery was smooth, and my skin has never looked this fresh.',
            },
          ],
        },
      },
      {
        id: 'home_newsletter',
        type: 'home.newsletter',
        enabled: true,
        data: {
          eyebrow: 'Newsletter',
          title: 'Stay in the Glow Loop',
          description:
            'Get early access to new arrivals, brand drops, and premium offers curated for Bangladesh.',
          images: [
            {
              title: 'Glow Ritual',
              image:
                'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&h=1200&fit=crop&auto=format',
            },
            {
              title: 'Editorial Shelf',
              image:
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1200&fit=crop&auto=format',
            },
          ],
        },
      },
    ],
  },
  brands: {
    key: 'brands',
    title: 'Brands Page',
    sections: [
      {
        id: 'brands_hero',
        type: 'brands.hero',
        enabled: true,
        data: {
          badge: 'Brand Library',
          title:
            'Curated Korean beauty brands for a more elevated skincare ritual.',
          description:
            'Discover the premium names behind Castle of Princess, selected for visible results, luxurious textures, and formulas that fit modern skincare needs in Bangladesh.',
          primaryHref: '/products?sort=featured',
          primaryLabel: 'Shop Brand Edit',
          secondaryHref: '/concerns',
          secondaryLabel: 'Explore Skin Concerns',
          heroImage:
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=1500&fit=crop&auto=format',
          sideCardEyebrow: 'Luxury Selection',
          sideCardTitle: 'Modern K-beauty icons with a polished, editorial finish.',
        },
      },
      {
        id: 'brands_promises',
        type: 'brands.promises',
        enabled: true,
        data: {
          items: [
            {
              title: 'Authentic Sourcing',
              description:
                'Curated from trusted Korean beauty lines with luxury retail presentation.',
              icon: 'ShieldCheck',
            },
            {
              title: 'Concern-Based Selection',
              description:
                'Chosen for acne, sensitivity, hydration, brightening, and barrier support.',
              icon: 'Sparkles',
            },
            {
              title: 'Premium Results',
              description:
                'Each brand is selected for texture, finish, and visible skin confidence.',
              icon: 'Star',
            },
          ],
        },
      },
      {
        id: 'brands_grid',
        type: 'brands.grid',
        enabled: true,
        data: {
          eyebrow: 'Featured Brands',
          title: 'Discover Your Signature Routine',
          description:
            "Each brand card leads into a product discovery flow tailored around that label's bestselling aesthetic and ingredient philosophy.",
          items: [
            {
              name: 'COSRX',
              tagline: 'Barrier-first essentials with cult-favorite actives.',
              description:
                'Known for skin-repairing formulas, snail mucin icons, and gentle acne care that fits daily Bangladeshi routines.',
              image:
                'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&h=1400&fit=crop&auto=format',
              specialties: ['Barrier Repair', 'Acne Care', 'Hydration'],
            },
            {
              name: 'Beauty of Joseon',
              tagline: 'Hanbang-inspired glow care with elegant textures.',
              description:
                'A brand celebrated for rice and ginseng-powered formulas that deliver calm brightness and a refined glow.',
              image:
                'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&h=1400&fit=crop&auto=format',
              specialties: ['Brightening', 'Hanbang', 'Glow'],
            },
            {
              name: 'Anua',
              tagline: 'Modern calming care for sensitive, stressed skin.',
              description:
                'Heartleaf-rich, minimal formulas designed to soothe irritation, refine texture, and keep routines breathable.',
              image:
                'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&h=1400&fit=crop&auto=format',
              specialties: ['Calming', 'Sensitive Skin', 'Balance'],
            },
            {
              name: 'Some By Mi',
              tagline: 'AHA/BHA/PHA treatment icons with a premium feel.',
              description:
                'A high-performance K-beauty brand loved for exfoliating routines and concern-focused treatment products.',
              image:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=1400&fit=crop&auto=format',
              specialties: ['Texture Care', 'Pore Refining', 'Acne Control'],
            },
            {
              name: 'Round Lab',
              tagline: 'Comforting hydration with a clean, airy feel.',
              description:
                'Round Lab delivers soft, moisture-rich formulas that support skin barrier strength and everyday comfort.',
              image:
                'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&h=1400&fit=crop&auto=format',
              specialties: ['Moisture', 'Barrier Support', 'Softening'],
            },
          ],
        },
      },
    ],
  },
  about: {
    key: 'about',
    title: 'About Page',
    sections: [
      {
        id: 'about_hero',
        type: 'about.hero',
        enabled: true,
        data: {
          badge: 'Our Story',
          title: 'Castle of Princess brings Korean skincare luxury to Bangladesh.',
          description:
            'We curate authentic Korean skincare and cosmetics with an editorial eye—so every routine feels elegant, premium, and effortless.',
          primaryHref: '/products',
          primaryLabel: 'Shop the collection',
          secondaryHref: '/brands',
          secondaryLabel: 'Explore brands',
          heroImage:
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&h=1100&fit=crop&auto=format',
          heroImageAlt: 'Castle of Princess editorial skincare',
        },
      },
      {
        id: 'about_highlights',
        type: 'about.highlights',
        enabled: true,
        data: {
          items: [
            {
              title: 'Premium Curation',
              description:
                'We select Korean skincare icons for texture, results, and authentic sourcing.',
              icon: 'Sparkles',
            },
            {
              title: 'Bangladesh Ready',
              description:
                'Product edits tailored for humidity, glow routines, and everyday barrier comfort.',
              icon: 'ShieldCheck',
            },
            {
              title: 'Luxury Experience',
              description:
                'A glossy, high-end shopping journey designed for modern beauty lovers.',
              icon: 'Star',
            },
          ],
        },
      },
      {
        id: 'about_mission',
        type: 'about.mission',
        enabled: true,
        data: {
          title: 'Our Mission',
          paragraphs: [
            'Castle of Princess exists to make Korean skincare feel more premium, more accessible, and more trustworthy for customers in Bangladesh.',
            'From barrier-focused essentials to glow-first routines, we curate products with an editorial mindset so every step feels intentional.',
          ],
          image:
            'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1400&h=1200&fit=crop&auto=format',
          imageAlt: 'Skincare ritual flatlay',
        },
      },
      {
        id: 'about_pillars',
        type: 'about.pillars',
        enabled: true,
        data: {
          title: 'Core Pillars',
          items: [
            {
              title: 'Authenticity',
              description:
                'We focus on authentic products from recognized Korean skincare and beauty brands.',
            },
            {
              title: 'Elegance',
              description:
                'Every interface and routine is designed to feel glossy, calm, and luxurious.',
            },
            {
              title: 'Guidance',
              description:
                'We help customers discover the right products through concerns, brands, and editorial content.',
            },
          ],
        },
      },
      {
        id: 'about_cta',
        type: 'about.cta',
        enabled: true,
        data: {
          title: 'Ready to build your glow ritual?',
          description:
            'Browse the full collection or contact us for guidance on products and routines.',
          primaryHref: '/products',
          primaryLabel: 'Shop now',
          secondaryHref: '/contact',
          secondaryLabel: 'Contact us',
        },
      },
    ],
  },
}
