'use client'

type AdminPanelProps = {
  title?: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function AdminPanel({
  title,
  description,
  action,
  children,
  className = '',
}: AdminPanelProps) {
  return (
    <section className={`glass rounded-2xl p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            {title && <h2 className="text-xl font-semibold text-white">{title}</h2>}
            {description && <p className="mt-2 text-sm text-gray-400">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
