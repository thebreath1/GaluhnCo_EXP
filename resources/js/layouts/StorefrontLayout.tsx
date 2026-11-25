import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import type { SectionContent } from '@/components/landing/cms';
import FloatingWhatsApp from '@/components/landing/FloatingWhatsApp';
import Navbar from '@/components/landing/Navbar';

const FooterSection = lazy(() => import('@/components/landing/FooterSection'));

interface StorefrontLayoutProps {
    children: ReactNode;
    footerContent?: SectionContent;
    showFooter?: boolean;
    showFloatingWhatsApp?: boolean;
}

export default function StorefrontLayout({
    children,
    footerContent,
    showFooter = true,
    showFloatingWhatsApp = true,
}: StorefrontLayoutProps) {
    return (
        <div className="no-scrollbar min-h-screen bg-[#F2EBDC] font-sans text-[#16233B] antialiased selection:bg-[#A88B54]/25 selection:text-[#16233B]">
            <Navbar />

            {children}

            {showFooter && (
                <Suspense
                    fallback={
                        <div
                            className="min-h-[320px] bg-[#16233B]"
                            aria-hidden="true"
                        />
                    }
                >
                    <FooterSection content={footerContent} />
                </Suspense>
            )}

            {showFloatingWhatsApp && <FloatingWhatsApp />}
        </div>
    );
}
