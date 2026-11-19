import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import React from 'react';
import { ScrollProgressBar } from '@/components/common/ScrollProgressBar';
import { SmoothScrollProvider } from '@/components/common/SmoothScrollProvider';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

const mainFont = localFont({ src: '../../public/fonts/SUITE-Medium.woff2' });

export const metadata: Metadata = {
  title: '하고만달 (HAGO-MANDAL) | 오타니 쇼헤이 투타 모션 & 9×9 만다라트 계획표',
  description:
    '오타니의 투구에서 타격으로 이어지는 스크롤 애니메이션과 함께 만다라트(Mandal-Art) 81칸 계획표를 설계하고 실천하는 웹 서비스',
};

export interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="ko">
      <body
        className={`${mainFont.className} min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-sky-500 selection:text-slate-950`}
      >
        <SmoothScrollProvider>
          <ScrollProgressBar />
          <Navbar />
          {children}
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
};

export default RootLayout;
