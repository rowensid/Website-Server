'use client'

import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo A&S Studio Project - Using regular img tag to avoid Next.js Image config issues */}
      <div className={`${sizeClasses[size]} relative rounded-lg overflow-hidden shadow-lg shadow-purple-500/25`}>
        <img
          src="https://z-cdn-media.chatglm.cn/files/d66918b7-d857-404c-b906-106aeb7314bc_pasted_image_1761064872435.png?auth_key=1792601023-dd799744fc324e6cba1e7bfd4baf99d2-0-3bda3d0790fb9ac3bc437e366085ffc7"
          alt="A&S Studio Project Logo"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Company Name */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-bold bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight`}>
            A & S
          </span>
          <span className={`text-xs ${size === 'sm' ? 'text-[10px]' : 'text-xs'} text-gray-400 leading-tight`}>
            STUDIO PROJECT
          </span>
        </div>
      )}
    </div>
  )
}