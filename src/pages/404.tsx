import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

const Error: React.FC = () => {
  return (
    <div className='flex min-h-[50vh] items-center justify-center'>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className='flex flex-col items-center text-center'
      >
        <p className='font-mono text-xs tracking-[0.2em] text-primary'>ERROR 404</p>
        <h1 className='mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl'>
          This page does not exist
        </h1>
        <p className='mt-4 max-w-md text-sm leading-relaxed text-muted-foreground'>
          The address may be mistyped, or the page may have moved. Your multisigs are unaffected.
        </p>
        <div className='mt-8 flex flex-wrap justify-center gap-3'>
          <Button asChild>
            <Link href='/'>Back to home</Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/open-multisig'>Open a multisig</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'Page not found — MyMultiSig',
      noIndex: true
    }
  }
}

export default Error
