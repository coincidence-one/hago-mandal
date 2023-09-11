import './globals.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local';

const mainFont = localFont({ src: '../../public/fonts/SUITE-Medium.woff2' })

export const metadata: Metadata = {
  title: '하고만달',
  description: 'website for make mandalart',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={mainFont.className}>{children}</body>
    </html>
  )
}
