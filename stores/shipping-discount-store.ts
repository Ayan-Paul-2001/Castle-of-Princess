import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ShippingDiscountState {
  active: boolean
  condition: 'upper' | 'lower' | 'total'
  threshold: number
  shippingDhaka: number
  shippingOutside: number
  setActive: (active: boolean) => void
  setCondition: (condition: 'upper' | 'lower' | 'total') => void
  setThreshold: (threshold: number) => void
  setShippingDhaka: (fee: number) => void
  setShippingOutside: (fee: number) => void
  updateAll: (data: Partial<ShippingDiscountState>) => void
}

export const useShippingDiscountStore = create<ShippingDiscountState>()(
  persist(
    (set) => ({
      active: false,
      condition: 'upper',
      threshold: 0,
      shippingDhaka: 70,
      shippingOutside: 120,
      setActive: (active) => set({ active }),
      setCondition: (condition) => set({ condition }),
      setThreshold: (threshold) => set({ threshold }),
      setShippingDhaka: (shippingDhaka) => set({ shippingDhaka }),
      setShippingOutside: (shippingOutside) => set({ shippingOutside }),
      updateAll: (data) => set((state) => ({ ...state, ...data })),
    }),
    {
      name: 'cop_shipping_discount_store',
    }
  )
)
