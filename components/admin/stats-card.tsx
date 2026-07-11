import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils/cn'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  format?: 'number' | 'currency' | 'percentage'
}

export default function StatsCard({ title, value, change, icon, format = 'number' }: StatsCardProps) {
  const displayValue = format === 'currency' && typeof value === 'number'
    ? formatPrice(value)
    : format === 'percentage'
    ? `${value}%`
    : value

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 hover:glow-gold transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 glass rounded-xl text-gold">{icon}</div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm ${
              change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{displayValue}</h3>
      <p className="text-gray-500 text-sm">{title}</p>
    </motion.div>
  )
}
