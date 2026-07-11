'use client'

import { motion } from 'framer-motion'

type AdminPageHeaderProps = {
  eyebrow?: string
  title: string
  description: string
  action?: React.ReactNode
}

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.32em] text-gold/70">{eyebrow}</p>
        )}
        <h1 className="mt-3 font-playfair text-4xl font-bold text-gradient-gold">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-gray-400">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  )
}
