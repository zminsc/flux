import React from 'react'

import localFont from 'next/font/local'

import './global.css'

const aileron = localFont({
  src: [
    {
      path: '../public/fonts/Aileron-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Aileron-Bold.otf',
      weight: '700',
      style: 'bold',
    },
  ],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={aileron.className}>
      <body>{children}</body>
    </html>
  )
}
