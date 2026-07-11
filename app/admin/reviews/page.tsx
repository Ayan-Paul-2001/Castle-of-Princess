'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Trash2, MessageSquare, ChevronDown, Check, X, Send, Star } from 'lucide-react'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { Button } from '@/components/ui/button'
import {
  getAdminReviews,
  saveAdminReview,
  deleteAdminReview,
  getAdminProducts,
  type AdminReview,
} from '@/lib/products-store'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [productsList, setProductsList] = useState<any[]>([])
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Reply state
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    setReviews(getAdminReviews())
    setProductsList(getAdminProducts())
  }, [])

  const getProductLink = (productName: string) => {
    const found = productsList.find((p) => p.name === productName)
    if (found) {
      return `/products/${found.slug}`
    }
    return `/products/${productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
  }

  useEffect(() => {
    const handleClose = () => setIsFilterOpen(false)
    window.addEventListener('click', handleClose)
    return () => window.removeEventListener('click', handleClose)
  }, [])

  const filteredReviews = useMemo(() => {
    if (filterRating === 'all') return reviews
    return reviews.filter((review) => review.rating === filterRating)
  }, [filterRating, reviews])

  const handleDeleteReview = (id: string) => {
    const updated = deleteAdminReview(id)
    setReviews(updated)
    toast.success('Review deleted successfully')
  }

  const handleUpdateStatus = (review: AdminReview, status: 'approved' | 'rejected') => {
    const updatedReview: AdminReview = {
      ...review,
      status,
    }
    const updatedList = saveAdminReview(updatedReview)
    setReviews(updatedList)
    toast.success(`Review ${status} successfully`)
  }

  const handleSendReply = (review: AdminReview) => {
    if (!replyText.trim()) {
      toast.error('Reply content cannot be empty')
      return
    }

    const updatedReview: AdminReview = {
      ...review,
      reply: replyText.trim(),
      replyBy: 'Castle of Princess',
    }

    const updatedList = saveAdminReview(updatedReview)
    setReviews(updatedList)
    setReplyReviewId(null)
    setReplyText('')
    toast.success('Reply submitted successfully')
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Social Proof"
        title="Reviews"
        description="Review customer feedback and write professional replies directly to your storefront."
      />

      <AdminPanel
        title="Review Management"
        description="Filter reviews by star rating, delete inappropriate comments, and answer customer inquiries."
        action={
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex min-w-[180px] items-center justify-between rounded-full border border-white/10 bg-black/40 px-5 py-3 text-sm text-white outline-none hover:border-gold/30 transition-colors"
            >
              <span>
                {filterRating === 'all'
                  ? 'All Ratings'
                  : `${filterRating} Star${filterRating > 1 ? 's' : ''}`}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 z-30 w-48 rounded-xl border border-white/10 bg-black/90 p-1 shadow-2xl backdrop-blur-md">
                <button
                  onClick={() => {
                    setFilterRating('all')
                    setIsFilterOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                    filterRating === 'all' ? 'text-gold font-medium' : 'text-gray-300'
                  }`}
                >
                  <span>All Ratings</span>
                  {filterRating === 'all' && <Check className="h-4 w-4 text-gold" />}
                </button>
                {([5, 4, 3, 2, 1] as const).map((stars) => (
                  <button
                    key={stars}
                    onClick={() => {
                      setFilterRating(stars)
                      setIsFilterOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                      filterRating === stars ? 'text-gold font-medium' : 'text-gray-300'
                    }`}
                  >
                    <span>{stars} Stars</span>
                    {filterRating === stars && <Check className="h-4 w-4 text-gold" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-white text-lg">{review.title || 'Product Review'}</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-gold fill-gold' : 'text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider ${
                        review.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : review.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {review.status || 'pending'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400">
                    By <span className="text-white font-medium">{review.customer}</span> on{' '}
                    <Link
                      href={getProductLink(review.product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline font-medium"
                    >
                      {review.product}
                    </Link>
                  </p>
                  
                  {review.comment && (
                    <p className="text-sm text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5">
                      {review.comment}
                    </p>
                  )}

                  {/* Admin Reply Display */}
                  {review.reply && (
                    <div className="mt-3 pl-4 border-l-2 border-gold/40 space-y-1">
                      <p className="text-xs uppercase tracking-wider text-gold font-semibold">
                        {review.replyBy || 'Castle of Princess'}
                      </p>
                      <p className="text-sm text-gray-200 bg-gold/5 p-3 rounded-lg border border-gold/10">
                        {review.reply}
                      </p>
                    </div>
                  )}

                  {/* Reply Input Form */}
                  {replyReviewId === review.id && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/60 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wider text-gold font-semibold">
                          Reply as &quot;Castle of Princess&quot;
                        </span>
                        <button
                          onClick={() => {
                            setReplyReviewId(null)
                            setReplyText('')
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your response to this customer..."
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white outline-none focus:border-gold transition-colors resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyReviewId(null)
                            setReplyText('')
                          }}
                          className="rounded-full text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="gold"
                          onClick={() => handleSendReply(review)}
                          className="rounded-full text-xs"
                        >
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center gap-3 self-end md:self-start">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(review, 'approved')}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/10 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500/30 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all"
                      title="Approve Review"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(review, 'rejected')}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-500/10 bg-rose-500/5 text-rose-400 hover:border-rose-500/30 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                      title="Reject Review"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {!review.reply && replyReviewId !== review.id && (
                    <button
                      onClick={() => setReplyReviewId(review.id)}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-gray-300 hover:border-gold/30 hover:text-gold hover:bg-gold/5 transition-all"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Reply
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-400 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition-all"
                    title="Delete Review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredReviews.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">
              No reviews found matching this rating.
            </p>
          )}
        </div>
      </AdminPanel>
    </>
  )
}
