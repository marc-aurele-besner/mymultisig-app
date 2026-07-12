import React from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageButtonProps {
  placeholder: string
  imagePath: string
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'glass'
}

const MotionButton = motion(Button)

const ImageButton: React.FC<ImageButtonProps> = ({
  placeholder,
  imagePath,
  onClick,
  loading: isLoading,
  disabled: isDisabled,
  variant = 'primary'
}) => {
  const variantClass = {
    primary: 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90',
    secondary: 'bg-blue-600 text-white shadow-md hover:bg-blue-700',
    glass: 'border border-border bg-background/80 shadow-md backdrop-blur-sm hover:bg-accent'
  }

  return (
    <MotionButton
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'm-2 h-auto w-full gap-3 px-6 py-4 text-base font-semibold md:w-[94%]',
        variantClass[variant],
        (isDisabled || isLoading) && 'opacity-50 cursor-not-allowed'
      )}
      onClick={onClick}
      disabled={isDisabled || isLoading}
    >
      <Image
        src={imagePath}
        alt={placeholder}
        width={24}
        height={24}
        className="rounded object-contain"
      />
      <span>{placeholder}</span>
    </MotionButton>
  )
}

export default ImageButton
