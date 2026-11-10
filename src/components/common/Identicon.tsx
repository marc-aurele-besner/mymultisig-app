import React from 'react'
import { cn } from '@/lib/utils'

export interface IdenticonProps {
  // Address (or any string) the pattern is derived from.
  value: string
  size?: number
  className?: string
}

// Small symmetric block pattern derived from an address, in the theme's warm
// hue range. It gives each address a recognisable face so long hex strings
// can be told apart at a glance; it is not a security feature.
const Identicon: React.FC<IdenticonProps> = ({ value, size = 28, className }) => {
  const text = value.toLowerCase()
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  const hue = 20 + (hash % 60)
  let bits = hash
  const cells: React.ReactNode[] = []
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      bits = (bits * 1103515245 + 12345) >>> 0
      if (((bits >> 16) & 1) === 0) continue
      cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />)
      if (x < 2) cells.push(<rect key={`${4 - x}-${y}`} x={4 - x} y={y} width={1} height={1} />)
    }
  }
  return (
    <svg
      viewBox='-1 -1 7 7'
      width={size}
      height={size}
      aria-hidden
      shapeRendering='crispEdges'
      fill={`oklch(0.68 0.16 ${hue})`}
      className={cn('shrink-0 rounded-md bg-muted', className)}
    >
      {cells}
    </svg>
  )
}

export default Identicon
