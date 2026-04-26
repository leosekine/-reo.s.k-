interface CardProps {
  readonly children: React.ReactNode
  readonly className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl bg-white p-6 shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  )
}
