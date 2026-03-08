import React from 'react'
import HeaderBox from '../header/HeaderBox'
import FooterBox from '../footer/FooterBox'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.08); }
          66% { transform: translate(30px, -25px) scale(0.92); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-50px, 30px) rotate(180deg); }
        }
      `}</style>
      {/* Animated background orbs */}
      <div
        className="fixed -top-[20%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(56, 178, 172, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 20s ease-in-out infinite'
        }}
      />
      <div
        className="fixed -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 132, 255, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'floatReverse 25s ease-in-out infinite'
        }}
      />
      <div
        className="fixed top-[40%] right-[20%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(138, 75, 255, 0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'floatSlow 30s ease-in-out infinite'
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Main content */}
      <div className="relative z-[1] flex justify-center">
        <div className="flex w-full min-h-screen flex-col justify-between gap-0">
          <HeaderBox />
          <div className="flex-1 w-full py-4 px-2 md:py-6 md:px-4">
            {children}
          </div>
          <FooterBox />
        </div>
      </div>
    </div>
  )
}

export default Layout
