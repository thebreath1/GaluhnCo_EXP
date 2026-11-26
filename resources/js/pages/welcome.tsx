import { Head } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { MotionConfig } from 'motion/react';
import type { GroupedLandingContent } from '@/components/landing/cms';
import type { Product, PublicPromotion } from '@/types/product';

// ── Above-the-fold — eager import (LCP critical path) ────────────────────────
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import StorefrontLayout from '@/layouts/StorefrontLayout';

// ── Below-the-fold — lazy import (code-split, downloaded after FCP) ───────────
const CatalogSection = lazy(
    () => import('@/components/landing/CatalogSection'),
);
const WhyChooseUsSection = lazy(
    () => import('@/components/landing/WhyChooseUsSection'),
);
const HowToOrderSection = lazy(
    () => import('@/components/landing/HowToOrderSection'),
);
const CorporateSection = lazy(
    () => import('@/components/landing/CorporateSection'),
);
const TestimonialsSection = lazy(
    () => import('@/components/landing/TestimonialsSection'),
);
const FaqSection = lazy(() => import('@/components/landing/FaqSection'));
const ClosingCtaSection = lazy(
    () => import('@/components/landing/ClosingCtaSection'),
);

export type { Product };

export interface PartnerItem {
    id: number;
    name: string;
    sector: string | null;
    logo_url: string | null;
}

export interface WelcomeProps {
    products?: Product[];
    categories?: string[];
    activePromotions?: PublicPromotion[];
    partners?: PartnerItem[];
    contents?: GroupedLandingContent;
}

// Skeleton placeholder ringan — ditampilkan saat chunk lazy sedang diunduh.
// Tinggi min-h sesuai section agar tidak ada layout jump.
function SectionSkeleton({
    minHeight = 'min-h-[480px]',
}: {
    minHeight?: string;
}) {
    return <div className={`${minHeight} bg-[#F2EBDC]`} aria-hidden="true" />;
}

export default function Welcome({
    products = [],
    categories = [],
    activePromotions = [],
    partners = [],
    contents = {},
}: WelcomeProps) {
    return (
        <MotionConfig reducedMotion="user">
            <Head>
                <title>
                    Galuh &amp; Co. — Curated Luxury Hampers &amp; Corporate
                    Gifting
                </title>
                <meta
                    name="description"
                    content="Kurasi hampers eksklusif dengan kemasan penuh estetika dan sentuhan personal untuk merayakan setiap momen istimewa."
                />
            </Head>

            <StorefrontLayout footerContent={contents.footer}>
                {/* ── Above-the-fold (eager) ── */}
                <HeroSection
                    products={products}
                    content={contents.hero}
                    seasonalContent={contents.seasonal}
                />
                <AboutSection products={products} content={contents.about} />

                {/* ── Below-the-fold (lazy + Suspense) ── */}

                <Suspense
                    fallback={<SectionSkeleton minHeight="min-h-[600px]" />}
                >
                    <CatalogSection
                        products={products}
                        categories={categories}
                        activePromotions={activePromotions}
                        content={contents.catalog}
                    />
                </Suspense>

                <Suspense
                    fallback={<SectionSkeleton minHeight="min-h-[480px]" />}
                >
                    <WhyChooseUsSection content={contents.why_us} />
                </Suspense>

                <Suspense
                    fallback={<SectionSkeleton minHeight="min-h-[400px]" />}
                >
                    <HowToOrderSection content={contents.how_to_order} />
                </Suspense>

                <Suspense
                    fallback={<SectionSkeleton minHeight="min-h-[600px]" />}
                >
                    <CorporateSection
                        partners={partners}
                        content={contents.corporate}
                    />
                </Suspense>

                <Suspense
                    fallback={<SectionSkeleton minHeight="min-h-[480px]" />}
                >
                    <TestimonialsSection content={contents.testimonials} />
                </Suspense>

                <Suspense
                    fallback={<SectionSkeleton minHeight="min-h-[400px]" />}
                >
                    <FaqSection content={contents.faq} />
                </Suspense>

                <Suspense
                    fallback={<SectionSkeleton minHeight="min-h-[320px]" />}
                >
                    <ClosingCtaSection content={contents.footer} />
                </Suspense>
            </StorefrontLayout>
        </MotionConfig>
    );
}
