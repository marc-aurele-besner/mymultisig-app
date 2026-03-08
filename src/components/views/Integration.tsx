import React from 'react'
import BigCard from '../cards/BigCard'

const Integration: React.FC = () => {
  return (
    <div className="flex justify-center">
      <BigCard className="min-h-[50vh] max-w-[1200px]">
        <div className="flex flex-col items-center justify-center">
          <h2 className="pb-4 text-2xl font-bold text-foreground">Integration</h2>
          <p className="mt-16 pt-8 text-xl font-bold text-foreground">
            This section is under construction
          </p>
        </div>
      </BigCard>
    </div>
  )
}

export default Integration
