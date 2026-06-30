export function SkeletonRow({ width = '100%', height = 14 }) {
  return (
    <div
      className="skeleton"
      style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}
    />
  )
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} width={i === rows - 1 ? '60%' : '100%'} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 3 }) {
  return (
    <div className="p-2">
      <div className="flex gap-2 mb-2">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonRow key={i} width={80} height={10} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-2 mb-1.5">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonRow key={c} width={80} height={12} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function LoadingSpinner({ size = 16, label }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label && <span className="text-xs">{label}</span>}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {Icon && <Icon size={32} className="text-gray-600 mb-2" aria-hidden="true" />}
      <p className="text-sm text-gray-400 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
