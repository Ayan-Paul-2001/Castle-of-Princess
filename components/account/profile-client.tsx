'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  User as UserIcon, 
  Heart, 
  ShoppingBag, 
  ArrowRight, 
  MapPin, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  ChevronDown, 
  Check 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { buttonVariants } from '@/components/ui/button'
import { LogoutButton } from '@/components/auth/logout-button'

export interface IAddress {
  _id?: string
  name: string
  phone: string
  address: string
  city: string
  postalCode: string
  isDefault: boolean
}

interface ProfileClientProps {
  initialUser: {
    id: string
    name: string
    email: string
  }
}

export function ProfileClient({ initialUser }: ProfileClientProps) {
  const [user, setUser] = useState(initialUser)
  const [addresses, setAddresses] = useState<IAddress[]>([])
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState(initialUser.name)
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)

  // Address form state
  const [addressForm, setAddressForm] = useState<Omit<IAddress, '_id'>>({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    isDefault: false
  })

  useEffect(() => {
    fetch('/api/account')
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses) {
          setAddresses(data.addresses)
        }
        if (data.name) {
          setUser((u) => ({ ...u, name: data.name }))
          setEditNameValue(data.name)
        }
      })
      .catch(() => {
        console.error('Failed to load profile data')
      })
  }, [])

  const handleSaveName = async () => {
    const trimmed = editNameValue.trim()
    if (!trimmed) {
      toast.error('Name cannot be empty')
      return
    }

    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUser((u) => ({ ...u, name: data.name }))
        setIsEditingName(false)
        toast.success('Name updated successfully!')
      } else {
        toast.error(data.error || 'Failed to update name')
      }
    } catch (e) {
      toast.error('Failed to update name')
    }
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.postalCode) {
      toast.error('Please fill out all address fields')
      return
    }

    let updatedAddresses = [...addresses]

    if (addressForm.isDefault) {
      // Unset default from others
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }))
    }

    if (editingAddressId !== null) {
      // Editing
      updatedAddresses = updatedAddresses.map(addr => {
        const id = addr._id || (addr as any).id
        if (id === editingAddressId) {
          return { ...addr, ...addressForm }
        }
        return addr
      })
    } else {
      // Adding new
      const tempId = `temp_${Date.now()}`
      updatedAddresses.push({
        _id: tempId,
        ...addressForm,
        // If it's the first address, make it default automatically
        isDefault: updatedAddresses.length === 0 ? true : addressForm.isDefault
      })
    }

    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: updatedAddresses.map(({ _id, ...rest }) => rest) }), // omit temp ids for mongo
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setAddresses(data.addresses || [])
        setIsAddingAddress(false)
        setEditingAddressId(null)
        resetAddressForm()
        toast.success(editingAddressId ? 'Address updated!' : 'Address added!')
      } else {
        toast.error(data.error || 'Failed to save address')
      }
    } catch (e) {
      toast.error('Failed to save address')
    }
  }

  const handleDeleteAddress = async (idToDelete: string) => {
    const updatedAddresses = addresses.filter(addr => {
      const id = addr._id || (addr as any).id
      return id !== idToDelete
    })

    // If we deleted the default address, make the first remaining one default
    const wasDefault = addresses.find(addr => (addr._id || (addr as any).id) === idToDelete)?.isDefault
    if (wasDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true
    }

    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: updatedAddresses.map(({ _id, ...rest }) => rest) }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setAddresses(data.addresses || [])
        toast.success('Address deleted!')
      } else {
        toast.error(data.error || 'Failed to delete address')
      }
    } catch (e) {
      toast.error('Failed to delete address')
    }
  }

  const handleSetDefault = async (idToDefault: string) => {
    const updatedAddresses = addresses.map(addr => {
      const id = addr._id || (addr as any).id
      return {
        ...addr,
        isDefault: id === idToDefault
      }
    })

    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: updatedAddresses.map(({ _id, ...rest }) => rest) }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setAddresses(data.addresses || [])
        toast.success('Default address updated!')
      } else {
        toast.error(data.error || 'Failed to update default address')
      }
    } catch (e) {
      toast.error('Failed to update default address')
    }
  }

  const startEditAddress = (addr: IAddress) => {
    const id = addr._id || (addr as any).id
    setEditingAddressId(id)
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault
    })
    setIsAddingAddress(true)
  }

  const resetAddressForm = () => {
    setAddressForm({
      name: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      isDefault: false
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-[1px]">
        <div className="rounded-[calc(2rem-1px)] bg-black/75 p-8 md:p-10">
          
          {/* Profile Header */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Profile</p>
                {!isEditingName && (
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-400 hover:text-gold transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {isEditingName ? (
                <div className="mt-4 flex flex-col gap-2 max-w-xs">
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="px-4 py-2 bg-black/50 border border-white/15 rounded-xl text-white outline-none focus:border-gold text-base"
                    placeholder="Enter name"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold text-black rounded-lg text-xs font-semibold hover:bg-gold-light transition-colors"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false)
                        setEditNameValue(user.name)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs font-semibold hover:bg-white/20 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h2 className="mt-4 font-playfair text-3xl font-semibold text-white">
                  {user.name}
                </h2>
              )}

              {user.email ? <p className="mt-3 text-sm text-gray-400">{user.email}</p> : null}
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold flex-shrink-0">
              <UserIcon className="h-6 w-6" />
            </div>
          </div>

          {/* Links Section */}
          <div className="mt-10 grid gap-3">
            <Link
              href="/wishlist"
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors hover:border-gold/30"
            >
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-gold/80" />
                <div>
                  <p className="text-sm font-medium text-white">Wishlist</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.28em] text-gray-500">
                    Saved products
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-500 transition-colors group-hover:text-gold" />
            </Link>

            <Link
              href="/account/orders"
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors hover:border-gold/30"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-gold/80" />
                <div>
                  <p className="text-sm font-medium text-white">Orders</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.28em] text-gray-500">
                    Order history
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-500 transition-colors group-hover:text-gold" />
            </Link>

            {/* Address Book Toggle */}
            <button
              onClick={() => setIsAddressBookOpen(!isAddressBookOpen)}
              className="group text-left w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors hover:border-gold/30"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gold/80" />
                <div>
                  <p className="text-sm font-medium text-white">Address book</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.28em] text-gray-500">
                    Manage delivery addresses
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-gray-400">
                  {addresses.length}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isAddressBookOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Address Book Panel */}
            {isAddressBookOpen && (
              <div className="mt-2 rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-4">
                
                {isAddingAddress ? (
                  /* Add / Edit Address Form */
                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <h4 className="text-sm font-semibold text-white font-playfair">
                      {editingAddressId ? 'Edit Delivery Address' : 'Add New Address'}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Receiver Name</label>
                        <input
                          type="text"
                          required
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-gold text-sm"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-gold text-sm"
                          placeholder="e.g. 017XXXXXXXX"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-gold text-sm"
                        placeholder="House #, Road #, Area details"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-gold text-sm"
                          placeholder="e.g. Dhaka"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                          className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-gold text-sm"
                          placeholder="e.g. 1200"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-black/50 text-gold focus:ring-gold focus:ring-offset-0"
                      />
                      <label htmlFor="isDefault" className="text-xs text-gray-400 cursor-pointer">
                        Set as default shipping address
                      </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gold text-black rounded-xl text-xs font-semibold hover:bg-gold-light transition-colors"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAddress(false)
                          setEditingAddressId(null)
                          resetAddressForm()
                        }}
                        className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/20 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Address List */
                  <div className="space-y-3">
                    {addresses.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No addresses saved yet.</p>
                    ) : (
                      addresses.map((addr) => {
                        const addrId = addr._id || (addr as any).id
                        return (
                          <div 
                            key={addrId} 
                            className="rounded-xl border border-white/10 bg-black/40 p-4 relative"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-white text-sm">{addr.name}</p>
                                  {addr.isDefault && (
                                    <span className="text-[10px] bg-gold/15 text-gold border border-gold/25 px-1.5 py-0.5 rounded font-medium">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                                <p className="text-xs text-gray-300 mt-2">{addr.address}</p>
                                <p className="text-xs text-gray-300">{addr.city} - {addr.postalCode}</p>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={() => startEditAddress(addr)}
                                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(addrId)}
                                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefault(addrId)}
                                className="mt-3 text-xs text-gold hover:underline font-medium block"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                        )
                      })
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        resetAddressForm()
                        setIsAddingAddress(true)
                      }}
                      className="w-full py-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 hover:border-gold/40 text-xs text-gray-400 hover:text-gold transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add New Address
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Continue shopping
            </Link>
            <div className="sm:flex-1">
              <LogoutButton />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
