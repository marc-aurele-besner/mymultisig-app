import * as React from 'react'
import { cn } from '@/lib/utils'

interface LoadingDotsProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: string
  size?: 'sm' | 'default'
}

// Three ember dots pulsing in sequence — the app's shared "reading the chain"
// indicator. Pass a label to render the explanatory text alongside.
const LoadingDots: React.FC<LoadingDotsProps> = ({ label, size = 'default', className, ...props }) => {
  const dotClass = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'
  return (
    <span role='status' className={cn('inline-flex items-center gap-3', className)} {...props}>
      <span className='inline-flex items-center gap-1'>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(dotClass, 'rounded-full bg-primary')}
            style={{
              animation: 'loading-dot 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.16}s`
            }}
          />
        ))}
      </span>
      {label != null && <span className='text-sm text-muted-foreground'>{label}</span>}
      {label == null && <span className='sr-only'>Loading</span>}
    </span>
  )
}

export { LoadingDots }
