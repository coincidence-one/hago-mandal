import './globals.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local';
import Link from 'next/link';

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
      <body className={mainFont.className} >
        <div className='bg-slate-950'>
          <nav className='flex items-center justify-between px-20 py-5'>
            <section className='flex items-center gap-5'>
              <Link href="/profiles">
                <p className='text-[#f8f8f8] font-bold text-xl'>프로필</p>
              </Link>
              <Link href="/profiles">
                <p className='text-[#f8f8f8] font-bold text-xl'>템플릿</p>
              </Link>
            </section>
            <section className='flex items-center gap-5'>
              <Link href="/profiles">
                <button className=' text-[#f8f8f8] font-bold text-xl rounded border-2 p-2'>회원가입</button>
              </Link>
              <Link href="/profiles">
                <button className='text-[#010409] bg-white font-bold text-xl rounded border-2 p-2'>로그인</button>
              </Link>
            </section>
          </nav>
          {children}
        </div>
      </body>
    </html >
  )
}
