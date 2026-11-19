import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import React from 'react';
import { ScrollProgressBar } from '@/components/common/ScrollProgressBar';
import { SmoothScrollProvider } from '@/components/common/SmoothScrollProvider';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

const mainFont = localFont({ src: '../../public/fonts/SUITE-Medium.woff2' });

const resolveSiteUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://hago-mandal.vercel.app';
};

const SITE_URL = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  themeColor: '#0b0c0e',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  title: {
    default: '하고만달 (HAGO-MANDAL) | 오타니 쇼헤이 81칸 만다라트 스튜디오',
    template: '%s | 하고만달 (HAGO-MANDAL)',
  },
  description:
    '오타니 쇼헤이의 투구와 홈런 스크롤 스토리텔링, 매일 1구씩 타석에 서서 완성하는 81칸 만다라트(Mandal-Art) 플래너 & 스카우팅 리포트.',
  keywords: [
    '만다라트',
    '오타니 만다라트',
    '오타니 쇼헤이',
    '81칸 계획표',
    '만다라트 작성',
    '목표 달성 앱',
    '하고만달',
    'HAGO-MANDAL',
    'Mandal-Art',
    '스크롤리텔링',
  ],
  authors: [{ name: 'HAGO-MANDAL' }],
  creator: 'HAGO-MANDAL',
  publisher: 'HAGO-MANDAL',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: '하고만달 (HAGO-MANDAL)',
    title: '하고만달 (HAGO-MANDAL) | 너도 만다라트를 하면 오타니처럼 될 수 있다',
    description:
      '오타니의 165km/h 투구와 138m 홈런 서사, 오늘의 1구 타석 시스템, 오타니 vs 내 보드 스카우팅 리포트로 나만의 81칸 만다라트를 완성하세요.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '하고만달 (HAGO-MANDAL) — 오타니 쇼헤이 81칸 만다라트 스튜디오',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '하고만달 (HAGO-MANDAL) | 오타니 쇼헤이 81칸 만다라트 스튜디오',
    description:
      '재능이 아니라 설계도의 차이였습니다. 매일 1구씩 실행하며 완성하는 81칸 만다라트 플래너.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '하고만달 (HAGO-MANDAL)',
  description:
    '오타니 쇼헤이의 투타 스크롤리텔링과 매일 1구 타석 시스템, 스카우팅 리포트를 제공하는 인터랙티브 9×9(81칸) 만다라트 플래너.',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web',
  inLanguage: 'ko-KR',
  url: SITE_URL,
};

export interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="ko">
      <body
        className={`${mainFont.className} min-h-screen bg-[#0b0c0e] text-[#f4f1ea] antialiased selection:bg-[#f4b942] selection:text-[#0b0c0e]`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
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
