import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  image: string
  price: number
  salePrice?: number
  quantity: number
  variant?: string
}

interface CartState {
  carts: Record<string, CartItem[]>
  activeUserId: string
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  setActiveUser: (userId: string) => void
}

const updateItems = (set: any, get: any, updater: (items: CartItem[]) => CartItem[]) => {
  const { items, activeUserId, carts } = get()
  const newItems = updater(items)
  set({
    items: newItems,
    carts: {
      ...carts,
      [activeUserId]: newItems
    }
  })
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},
      activeUserId: 'guest',
      items: [],
      isOpen: false,

      addItem: (item) => {
        updateItems(set, get, (items) => {
          const existingItem = items.find(
            (i) => i.productId === item.productId && i.variant === item.variant
          )
          if (existingItem) {
            return items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          } else {
            return [...items, item]
          }
        })
      },

      removeItem: (id) => {
        updateItems(set, get, (items) => items.filter((item) => item.id !== id))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          updateItems(set, get, (items) => items.filter((item) => item.id !== id))
          return
        }
        updateItems(set, get, (items) =>
          items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        )
      },

      clearCart: () => {
        updateItems(set, get, () => [])
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),

      openCart: () => set({ isOpen: true }),

      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.salePrice || item.price
          return total + price * item.quantity
        }, 0)
      },

      setActiveUser: (userId) => {
        const { activeUserId, carts } = get()
        if (userId === activeUserId) return
        
        set({
          activeUserId: userId,
          items: carts[userId] || []
        })
      },
    }),
    {
      name: 'castle-cart',
    }
  )
)
