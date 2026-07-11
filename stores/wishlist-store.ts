import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  productId: string
  name: string
  slug?: string
  image: string
  price: number
  salePrice?: number
}

interface WishlistState {
  wishlists: Record<string, WishlistItem[]>
  activeUserId: string
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleItem: (item: WishlistItem) => void
  clearWishlist: () => void
  getTotalItems: () => number
  setActiveUser: (userId: string) => void
}

const updateItems = (set: any, get: any, updater: (items: WishlistItem[]) => WishlistItem[]) => {
  const { items, activeUserId, wishlists } = get()
  const newItems = updater(items)
  set({
    items: newItems,
    wishlists: {
      ...wishlists,
      [activeUserId]: newItems
    }
  })
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlists: {},
      activeUserId: 'guest',
      items: [],

      addItem: (item) => {
        const exists = get().isInWishlist(item.productId)
        if (!exists) {
          updateItems(set, get, (items) => [...items, item])
        }
      },

      removeItem: (productId) => {
        updateItems(set, get, (items) => items.filter((item) => item.productId !== productId))
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId)
      },

      toggleItem: (item) => {
        if (get().isInWishlist(item.productId)) {
          get().removeItem(item.productId)
        } else {
          get().addItem(item)
        }
      },

      clearWishlist: () => {
        updateItems(set, get, () => [])
      },

      getTotalItems: () => get().items.length,

      setActiveUser: (userId) => {
        const { activeUserId, wishlists } = get()
        if (userId === activeUserId) return
        
        set({
          activeUserId: userId,
          items: wishlists[userId] || []
        })
      },
    }),
    {
      name: 'castle-wishlist',
    }
  )
)
