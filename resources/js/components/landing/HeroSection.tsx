import { Link, usePage } from '@inertiajs/react';
import type { Variants } from 'motion/react';
import {
    AnimatePresence,
    motion,
    useInView,
    useReducedMotion,
} from 'motion/react';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import B2BCustomizerController from '@/actions/App/Http/Controllers/B2BCustomizerController';
import PromoMarquee from '@/components/landing/PromoMarquee';
import { getCmsText, type SectionContent } from '@/components/landing/cms';
import type { SharedPageProps } from '@/types';
import type { Product } from '@/types/product';

interface HeroSectionProps {
    products?: Product[];
    content?: SectionContent;
    seasonalContent?: SectionContent;
}

type SeasonThemeKey = 'default' | 'ramadan' | 'christmas' | 'cny' | 'wedding';

interface SeasonThemeConfig {
    eyebrowFallback: string;
    cutoutImage: string;
    cutoutAlt: string;
}

const SEASONAL_THEMES: Record<SeasonThemeKey, SeasonThemeConfig> = {
    default: {
        eyebrowFallback: 'Signature Luxury Collection',
        cutoutImage: '/asset/hero/parcel-default.svg',
        cutoutAlt:
            'Kurasi Gift Box Mewah Galuh & Co. dengan pita satin Muted Brass',
    },
    ramadan: {
        eyebrowFallback: 'RAMADAN CURATION 2026',
        cutoutImage: '/asset/hero/parcel-ramadan.svg',
        cutoutAlt:
            'Hampers Ramadan & Idul Fitri Galuh & Co. dengan ornamen ketupat emas',
    },
    christmas: {
        eyebrowFallback: 'NOEL & YEAR END 2026',
        cutoutImage: '/asset/hero/parcel-christmas.svg',
        cutoutAlt:
            'Hampers Natal & Akhir Tahun Galuh & Co. dengan aksen pinus dan pita emas',
    },
    cny: {
        eyebrowFallback: 'LUNAR PROSPERITY EDITION',
        cutoutImage: '/asset/hero/parcel-cny.svg',
        cutoutAlt:
            'Hampers Imlek Galuh & Co. dengan simpul sutra emas dan kemasan mewah',
    },
    wedding: {
        eyebrowFallback: 'BESPOKE WEDDING & SOUVENIR',
        cutoutImage: '/asset/hero/parcel-wedding.svg',
        cutoutAlt:
            'Keepsake Box Pernikahan & Souvenir Galuh & Co. dengan segel lilin eksklusif',
    },
};

const ROTATING_WORDS = ['Istimewa', 'Korporat', 'Hari Raya', 'Pernikahan'];

type Phase = 'typing' | 'pausing' | 'erasing' | 'switching';

interface TypewriterState {
    displayText: string;
    wordIndex: number;
    phase: Phase;
}

function useRotatingTypewriter(
    words: string[],
    {
        typeSpeed = 80,
        eraseSpeed = 45,
        pauseAfterType = 2200,
        pauseAfterErase = 350,
        active = true,
        reducedMotion = false,
    } = {},
) {
    const [state, setState] = useState<TypewriterState>({
        displayText: words[0] ?? '',
        wordIndex: 0,
        phase: 'pausing',
    });

    useEffect(() => {
        if (!active || reducedMotion) {
            setState({
                displayText: words[0] ?? '',
                wordIndex: 0,
                phase: 'pausing',
            });
            return;
        }

        const { displayText, wordIndex, phase } = state;
        const currentWord = words[wordIndex] ?? '';

        if (phase === 'typing') {
            if (displayText.length < currentWord.length) {
                const t = setTimeout(
                    () =>
                        setState((s) => ({
                            ...s,
                            displayText: currentWord.slice(
                                0,
                                s.displayText.length + 1,
                            ),
                        })),
                    typeSpeed,
                );
                return () => clearTimeout(t);
            }
            setState((s) => ({ ...s, phase: 'pausing' }));
            return;
        }

        if (phase === 'pausing') {
            const t = setTimeout(
                () => setState((s) => ({ ...s, phase: 'erasing' })),
                pauseAfterType,
            );
            return () => clearTimeout(t);
        }

        if (phase === 'erasing') {
            if (displayText.length > 0) {
                const t = setTimeout(
                    () =>
                        setState((s) => ({
                            ...s,
                            displayText: s.displayText.slice(0, -1),
                        })),
                    eraseSpeed,
                );
                return () => clearTimeout(t);
            }
            setState((s) => ({ ...s, phase: 'switching' }));
            return;
        }

        if (phase === 'switching') {
            const nextIndex = (wordIndex + 1) % words.length;
            const t = setTimeout(
                () =>
                    setState({
                        displayText: '',
                        wordIndex: nextIndex,
                        phase: 'typing',
                    }),
                pauseAfterErase,
            );
            return () => clearTimeout(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, active, reducedMotion]);

    return {
        displayText: state.displayText,
        isTyping: state.phase === 'typing' || state.phase === 'pausing',
    };
}

function longestWord(words: string[]): string {
    return words.reduce((a, b) => (b.length > a.length ? b : a), '');
}

function resolveSeasonTheme(rawTheme: string): SeasonThemeKey {
    const normalized = rawTheme.trim().toLowerCase();
    if (
        normalized === 'ramadan' ||
        normalized === 'christmas' ||
        normalized === 'cny' ||
        normalized === 'wedding'
    ) {
        return normalized;
    }
    return 'default';
}

function SeasonalOrnament({ theme }: { theme: SeasonThemeKey }) {
    if (theme === 'ramadan') {
        return (
            <svg
                aria-hidden="true"
                viewBox="0 0 420 420"
                fill="none"
                className="pointer-events-none absolute inset-0 m-auto size-[340px] text-[#A88B54] opacity-25 sm:size-[420px]"
            >
                <circle
                    cx="210"
                    cy="210"
                    r="186"
                    stroke="currentColor"
                    strokeWidth="0.9"
                    strokeDasharray="6 6"
                />
                <path
                    d="M210 38 L256 164 L382 210 L256 256 L210 382 L164 256 L38 210 L164 164 Z"
                    stroke="currentColor"
                    strokeWidth="0.85"
                />
                <circle
                    cx="210"
                    cy="210"
                    r="128"
                    stroke="currentColor"
                    strokeWidth="0.75"
                />
                <path
                    d="M286 84 A72 72 0 1 0 342 152 A56 56 0 1 1 286 84 Z"
                    stroke="currentColor"
                    strokeWidth="0.9"
                />
            </svg>
        );
    }

    if (theme === 'christmas') {
        return (
            <svg
                aria-hidden="true"
                viewBox="0 0 420 420"
                fill="none"
                className="pointer-events-none absolute inset-0 m-auto size-[340px] text-[#A88B54] opacity-25 sm:size-[420px]"
            >
                <circle
                    cx="210"
                    cy="210"
                    r="184"
                    stroke="currentColor"
                    strokeWidth="0.85"
                    strokeDasharray="4 7"
                />
                <path
                    d="M210 30 L210 390 M30 210 L390 210 M82 82 L338 338 M338 82 L82 338"
                    stroke="currentColor"
                    strokeWidth="0.7"
                />
                <circle
                    cx="210"
                    cy="210"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="0.8"
                />
            </svg>
        );
    }

    if (theme === 'cny') {
        return (
            <svg
                aria-hidden="true"
                viewBox="0 0 420 420"
                fill="none"
                className="pointer-events-none absolute inset-0 m-auto size-[340px] text-[#A88B54] opacity-25 sm:size-[420px]"
            >
                <circle
                    cx="210"
                    cy="210"
                    r="186"
                    stroke="currentColor"
                    strokeWidth="0.9"
                />
                <circle
                    cx="210"
                    cy="210"
                    r="164"
                    stroke="currentColor"
                    strokeWidth="0.75"
                    strokeDasharray="8 5"
                />
                <rect
                    x="118"
                    y="118"
                    width="184"
                    height="184"
                    rx="12"
                    transform="rotate(45 210 210)"
                    stroke="currentColor"
                    strokeWidth="0.85"
                />
            </svg>
        );
    }

    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 420 420"
            fill="none"
            className="pointer-events-none absolute inset-0 m-auto size-[340px] text-[#A88B54] opacity-25 sm:size-[420px]"
        >
            <circle
                cx="210"
                cy="210"
                r="186"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeDasharray="5 6"
            />
            <ellipse
                cx="210"
                cy="210"
                rx="195"
                ry="118"
                transform="rotate(-24 210 210)"
                stroke="currentColor"
                strokeWidth="0.75"
            />
            <ellipse
                cx="210"
                cy="210"
                rx="195"
                ry="118"
                transform="rotate(24 210 210)"
                stroke="currentColor"
                strokeWidth="0.75"
            />
        </svg>
    );
}

const SPLASH_PARTICLES = [
    { left: '12%', top: '18%', size: 3, delay: 0.1, duration: 3.4 },
    { left: '24%', top: '72%', size: 2, delay: 0.5, duration: 4.1 },
    { left: '32%', top: '28%', size: 2.5, delay: 0.9, duration: 3.8 },
    { left: '44%', top: '14%', size: 2, delay: 0.3, duration: 4.3 },
    { left: '58%', top: '82%', size: 3, delay: 0.7, duration: 3.6 },
    { left: '68%', top: '22%', size: 2.5, delay: 0.2, duration: 4.0 },
    { left: '78%', top: '66%', size: 3, delay: 0.8, duration: 3.5 },
    { left: '86%', top: '34%', size: 2, delay: 0.4, duration: 4.2 },
    { left: '18%', top: '48%', size: 2, delay: 1.1, duration: 3.9 },
    { left: '82%', top: '84%', size: 2.5, delay: 0.6, duration: 3.7 },
    { left: '38%', top: '86%', size: 2, delay: 1.0, duration: 4.4 },
    { left: '62%', top: '12%', size: 2, delay: 0.4, duration: 3.9 },
    { left: '9%', top: '80%', size: 2.5, delay: 0.7, duration: 4.1 },
    { left: '91%', top: '16%', size: 2.5, delay: 0.2, duration: 3.5 },
] as const;

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.13, delayChildren: 0.32 },
    },
};

const fadeUpChild: Variants = {
    hidden: { opacity: 0, y: 56 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
    },
};

export default function HeroSection({
    content,
    seasonalContent,
}: HeroSectionProps) {
    const shouldReduceMotion = useReducedMotion() ?? false;
    const { seasonalRibbon } = usePage<SharedPageProps>().props;
    const [showSplash, setShowSplash] = useState(true);
    const [heroRevealed, setHeroRevealed] = useState(false);

    useEffect(() => {
        if (shouldReduceMotion || window.location.hash !== '') {
            setShowSplash(false);
            setHeroRevealed(true);
            return;
        }

        const revealTimer = window.setTimeout(() => {
            setShowSplash(false);
            setHeroRevealed(true);
        }, 2100);

        const handleSkip = () => {
            setShowSplash(false);
            setHeroRevealed(true);
        };

        window.addEventListener('keydown', handleSkip, { once: true });

        return () => {
            window.clearTimeout(revealTimer);
            window.removeEventListener('keydown', handleSkip);
        };
    }, [shouldReduceMotion]);

    useEffect(() => {
        if (showSplash && !shouldReduceMotion) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showSplash, shouldReduceMotion]);

    const seasonThemeKey = resolveSeasonTheme(
        getCmsText(content, 'hero_season_theme', 'ramadan'),
    );
    const theme = SEASONAL_THEMES[seasonThemeKey];

    const isSeasonalActive =
        seasonalContent?.seasonal_ribbon_active !== undefined &&
        seasonalContent?.seasonal_ribbon_active !== null
            ? seasonalContent.seasonal_ribbon_active === '1'
            : (seasonalRibbon?.active ?? false);

    const seasonalText = (
        seasonalContent?.seasonal_ribbon_text ??
        seasonalRibbon?.text ??
        ''
    ).trim();

    const seasonalLink = (
        seasonalContent?.seasonal_ribbon_link ??
        seasonalRibbon?.link ??
        ''
    ).trim();

    const heroSeasonEyebrow = getCmsText(
        content,
        'hero_season_eyebrow',
        '',
    ).trim();
    const hasSeasonalAnnouncement = isSeasonalActive && seasonalText !== '';
    const eyebrowText = hasSeasonalAnnouncement
        ? seasonalText
        : heroSeasonEyebrow ||
          getCmsText(content, 'eyebrow', theme.eyebrowFallback);
    const isClickableEyebrow = hasSeasonalAnnouncement && seasonalLink !== '';

    const rawWords = getCmsText(
        content,
        'rotating_words',
        ROTATING_WORDS.join(','),
    );
    const parsedWords = rawWords
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean);
    const activeWords = parsedWords.length > 0 ? parsedWords : ROTATING_WORDS;

    const headlineRef = useRef<HTMLHeadingElement>(null);
    const inView = useInView(headlineRef, { once: true, margin: '-80px' });

    const { displayText, isTyping } = useRotatingTypewriter(activeWords, {
        typeSpeed: 85,
        eraseSpeed: 50,
        pauseAfterType: 2400,
        pauseAfterErase: 380,
        active: inView && heroRevealed,
        reducedMotion: shouldReduceMotion,
    });

    const headlineLine1 = getCmsText(
        content,
        'headline_line_1',
        'Merangkai Kehangatan',
    );
    const headlineLine2 = getCmsText(
        content,
        'headline_line_2',
        'dalam Setiap Bingkisan',
    );
    const subtitleText =
        getCmsText(content, 'hero_subtitle', '').trim() ||
        getCmsText(
            content,
            'subheadline',
            'Kurasi hampers eksklusif dengan kemasan penuh estetika dan sentuhan personal untuk merayakan momen berharga bersama orang terdekat maupun relasi bisnis.',
        );

    const primaryCtaText =
        getCmsText(content, 'hero_cta_text', '').trim() ||
        getCmsText(content, 'primary_cta_label', 'Jelajahi Koleksi');
    const primaryCtaLink =
        getCmsText(content, 'hero_cta_link', '').trim() || '#koleksi';

    const uploadedHeroImage = getCmsText(content, 'hero_image', '').trim();
    const activeCutoutImage = uploadedHeroImage || theme.cutoutImage;

    const handleSmoothScroll = (
        e: React.MouseEvent<HTMLAnchorElement>,
        targetId: string,
    ) => {
        e.preventDefault();
        document
            .querySelector(targetId)
            ?.scrollIntoView({ behavior: 'smooth' });
    };

    const primaryCtaClasses =
        'group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#A88B54] px-7 py-3.5 font-sans text-sm font-semibold tracking-wide text-[#16233B] shadow-lg shadow-[#A88B54]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#B89B64] active:scale-[0.98] sm:w-auto sm:text-base';

    const eyebrowPillClasses =
        'group inline-flex max-w-full items-center gap-2.5 rounded-full border border-[#A88B54]/40 bg-[#1E2F4D]/80 px-4 py-1.5 backdrop-blur-sm transition-colors duration-200';

    const clickableEyebrowInner = (
        <>
            <SparklesIcon className="size-3.5 shrink-0 text-[#A88B54]" />
            <span className="truncate font-sans text-[11px] font-semibold tracking-[0.14em] text-[#F2EBDC] uppercase">
                {eyebrowText}
            </span>
            <ArrowRightIcon className="size-3.5 shrink-0 text-[#A88B54] transition-transform duration-200 group-hover:translate-x-0.5" />
        </>
    );

    return (
        <section className="relative flex min-h-[92vh] flex-col justify-between overflow-hidden bg-[#16233B] text-[#F2EBDC]">
            {/* ── 0. Intro Splash Screen (Logo & Galuh & Co. di Tengah) ── */}
            <AnimatePresence>
                {showSplash && !shouldReduceMotion && (
                    <motion.div
                        key="hero-intro-splash"
                        initial={{ y: '0%' }}
                        exit={{
                            y: '-100%',
                            transition: {
                                duration: 1.0,
                                delay: 0.12,
                                ease: [0.22, 1, 0.36, 1] as const,
                            },
                        }}
                        onClick={() => {
                            setShowSplash(false);
                            setHeroRevealed(true);
                        }}
                        className="fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center overflow-hidden border-b border-[#A88B54]/30 bg-[#16233B] px-6 text-[#F2EBDC] shadow-[0_24px_60px_rgba(10,16,28,0.55)] will-change-transform"
                        aria-label="Pembukaan Galuh & Co."
                    >
                        {/* Atmospheric radial glow */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0"
                            style={{
                                background:
                                    'radial-gradient(circle at 50% 48%, rgba(168,139,84,0.16) 0%, rgba(30,47,77,0.55) 35%, rgba(22,35,59,0) 70%)',
                            }}
                        />

                        {/* Partikel halus mengambang */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0"
                        >
                            {SPLASH_PARTICLES.map((particle, idx) => (
                                <motion.span
                                    key={idx}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{
                                        opacity: [0.15, 0.75, 0.25],
                                        y: [-6, 6, -6],
                                    }}
                                    transition={{
                                        duration: particle.duration,
                                        delay: particle.delay,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    style={{
                                        left: particle.left,
                                        top: particle.top,
                                        width: particle.size,
                                        height: particle.size,
                                    }}
                                    className="absolute rounded-full bg-[#A88B54]"
                                />
                            ))}
                        </div>

                        {/* Logo & Teks Galuh & Co. di Tengah */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{
                                opacity: 0,
                                y: -28,
                                transition: {
                                    duration: 0.45,
                                    ease: [0.16, 1, 0.3, 1] as const,
                                },
                            }}
                            transition={{
                                duration: 0.75,
                                ease: [0.16, 1, 0.3, 1] as const,
                            }}
                            className="relative z-10 flex flex-col items-center text-center"
                        >
                            <img
                                src="/asset/logo/Logo_galu&co.png"
                                alt="Galuh & Co."
                                loading="eager"
                                decoding="async"
                                className="h-20 w-auto object-contain drop-shadow-[0_10px_28px_rgba(168,139,84,0.28)] sm:h-24"
                            />
                            <h2 className="mt-4 font-serif text-3xl font-normal tracking-[0.08em] text-[#F2EBDC] sm:text-4xl">
                                Galuh &amp; Co.
                            </h2>
                            <div className="mt-3 h-px w-16 bg-gradient-to-r from-transparent via-[#A88B54] to-transparent" />
                            <p className="mt-2.5 font-sans text-[11px] font-semibold tracking-[0.28em] text-[#A88B54] uppercase">
                                Curated Luxury Hampers
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── 1. Atmospheric Dark Navy & Brass Radial Glows ── */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    background:
                        'radial-gradient(ellipse 68% 58% at 72% 42%, rgba(30,47,77,0.88) 0%, rgba(22,35,59,0) 72%), radial-gradient(circle at 22% 24%, rgba(168,139,84,0.12) 0%, transparent 48%), radial-gradient(circle at 82% 76%, rgba(168,139,84,0.10) 0%, transparent 50%)',
                }}
            />

            {/* ── 2. Subtle Atmospheric Grain Texture ── */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[1] opacity-[0.045]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '200px 200px',
                }}
            />

            {/* ── 3. Split Hero Main Area (2 Kolom) ── */}
            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-6 pt-28 pb-10 sm:pt-32 md:pb-14">
                <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
                    {/* Kolom Kiri: Editorial Copy & CTA */}
                    <motion.div
                        variants={
                            shouldReduceMotion ? undefined : staggerContainer
                        }
                        initial={shouldReduceMotion ? undefined : 'hidden'}
                        animate={
                            shouldReduceMotion
                                ? undefined
                                : heroRevealed
                                  ? 'visible'
                                  : 'hidden'
                        }
                        className="flex flex-col items-start text-left lg:col-span-6"
                    >
                        {/* Single Dynamic Seasonal Eyebrow Pill */}
                        <motion.div
                            variants={
                                shouldReduceMotion ? undefined : fadeUpChild
                            }
                            className="mb-5 max-w-full"
                        >
                            {isClickableEyebrow ? (
                                seasonalLink.startsWith('#') ? (
                                    <a
                                        href={seasonalLink}
                                        onClick={(e) =>
                                            handleSmoothScroll(e, seasonalLink)
                                        }
                                        className={`${eyebrowPillClasses} hover:border-[#A88B54]/70 hover:bg-[#1E2F4D]`}
                                    >
                                        {clickableEyebrowInner}
                                    </a>
                                ) : seasonalLink.startsWith('/') ? (
                                    <Link
                                        href={seasonalLink}
                                        className={`${eyebrowPillClasses} hover:border-[#A88B54]/70 hover:bg-[#1E2F4D]`}
                                    >
                                        {clickableEyebrowInner}
                                    </Link>
                                ) : (
                                    <a
                                        href={seasonalLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${eyebrowPillClasses} hover:border-[#A88B54]/70 hover:bg-[#1E2F4D]`}
                                    >
                                        {clickableEyebrowInner}
                                    </a>
                                )
                            ) : (
                                <div className={eyebrowPillClasses}>
                                    <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-[#A88B54]" />
                                    <span className="font-sans text-[11px] font-semibold tracking-[0.18em] text-[#F2EBDC] uppercase">
                                        {eyebrowText}
                                    </span>
                                </div>
                            )}
                        </motion.div>

                        {/* Headline Warm Ivory + RotatingTypewriter */}
                        <motion.h1
                            ref={headlineRef}
                            variants={
                                shouldReduceMotion ? undefined : fadeUpChild
                            }
                            aria-label={`${headlineLine1} ${headlineLine2} ${activeWords[0]}`}
                            className="font-serif text-4xl leading-[1.12] font-normal tracking-normal text-[#F2EBDC] sm:text-5xl xl:text-[3.75rem]"
                        >
                            <span className="block" aria-hidden="true">
                                {headlineLine1}
                            </span>

                            <span
                                className="mt-1 flex flex-wrap items-baseline gap-x-[0.28em] italic"
                                aria-hidden="true"
                            >
                                <span className="whitespace-nowrap">
                                    {headlineLine2}
                                </span>

                                <span className="relative inline-block">
                                    <span
                                        className="invisible whitespace-nowrap select-none"
                                        aria-hidden="true"
                                    >
                                        {longestWord(activeWords)}
                                    </span>

                                    <span className="absolute inset-0 flex items-baseline justify-start">
                                        <span className="whitespace-nowrap text-[#A88B54]">
                                            {displayText}
                                        </span>

                                        <span
                                            aria-hidden="true"
                                            className={[
                                                'ml-[3px] inline-block w-[2px] self-stretch rounded-full bg-[#A88B54]',
                                                'animate-cursor-blink',
                                                !isTyping && !shouldReduceMotion
                                                    ? 'opacity-0'
                                                    : '',
                                            ].join(' ')}
                                        />
                                    </span>
                                </span>
                            </span>
                        </motion.h1>

                        {/* Subtitle Manrope */}
                        <motion.p
                            variants={
                                shouldReduceMotion ? undefined : fadeUpChild
                            }
                            className="mt-6 max-w-xl font-sans text-sm leading-relaxed font-normal text-[#F2EBDC]/80 sm:text-base md:text-[17px]"
                        >
                            {subtitleText}
                        </motion.p>

                        {/* Dual CTAs */}
                        <motion.div
                            variants={
                                shouldReduceMotion ? undefined : fadeUpChild
                            }
                            className="mt-8 flex w-full flex-col items-stretch gap-3.5 sm:w-auto sm:flex-row sm:items-center"
                        >
                            {primaryCtaLink.startsWith('#') ? (
                                <a
                                    href={primaryCtaLink}
                                    onClick={(e) =>
                                        handleSmoothScroll(e, primaryCtaLink)
                                    }
                                    className={primaryCtaClasses}
                                >
                                    <span>{primaryCtaText}</span>
                                    <ArrowRightIcon className="size-4 text-[#16233B] transition-transform duration-300 group-hover:translate-x-0.5" />
                                </a>
                            ) : primaryCtaLink.startsWith('/') ? (
                                <Link
                                    href={primaryCtaLink}
                                    className={primaryCtaClasses}
                                >
                                    <span>{primaryCtaText}</span>
                                    <ArrowRightIcon className="size-4 text-[#16233B] transition-transform duration-300 group-hover:translate-x-0.5" />
                                </Link>
                            ) : (
                                <a
                                    href={primaryCtaLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={primaryCtaClasses}
                                >
                                    <span>{primaryCtaText}</span>
                                    <ArrowRightIcon className="size-4 text-[#16233B] transition-transform duration-300 group-hover:translate-x-0.5" />
                                </a>
                            )}

                            <Link
                                href={B2BCustomizerController.index()}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#F2EBDC]/30 bg-transparent px-7 py-3.5 font-sans text-sm font-semibold tracking-wide text-[#F2EBDC] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#A88B54]/70 hover:bg-white/5 active:scale-[0.98] sm:w-auto sm:text-base"
                            >
                                <SparklesIcon className="size-4 text-[#A88B54]" />
                                <span>Rancang Box 3D</span>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Kolom Kanan: Transparent Cutout Parcel Showcase Tanpa Bingkai Kartu */}
                    <motion.div
                        initial={
                            shouldReduceMotion
                                ? undefined
                                : { opacity: 0, y: 64 }
                        }
                        animate={
                            shouldReduceMotion
                                ? undefined
                                : heroRevealed
                                  ? { opacity: 1, y: 0 }
                                  : { opacity: 0, y: 64 }
                        }
                        transition={
                            shouldReduceMotion
                                ? undefined
                                : {
                                      duration: 0.95,
                                      delay: 0.38,
                                      ease: [0.16, 1, 0.3, 1] as const,
                                  }
                        }
                        className="relative flex items-center justify-center lg:col-span-6"
                    >
                        {/* Radial Ambient Glow di Belakang Parsel */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute m-auto size-72 rounded-full bg-[#A88B54]/15 blur-3xl sm:size-96"
                        />

                        {/* Ornamen Vektor Garis Tipis Emas Minimal Sesuai Musim */}
                        <SeasonalOrnament theme={seasonThemeKey} />

                        {/* Cutout Parsel Melayang — Klik Menuju 3D Studio */}
                        <Link
                            href={B2BCustomizerController.index()}
                            aria-label="Rancang Box 3D di Studio Customizer Galuh & Co."
                            className="group relative z-10 block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A88B54]"
                        >
                            <motion.div
                                initial={
                                    shouldReduceMotion
                                        ? undefined
                                        : { opacity: 0, scale: 0.94, y: 12 }
                                }
                                animate={
                                    shouldReduceMotion
                                        ? undefined
                                        : heroRevealed
                                          ? {
                                                opacity: 1,
                                                scale: 1,
                                                y: [0, -10, 0],
                                            }
                                          : { opacity: 0, scale: 0.94, y: 12 }
                                }
                                transition={
                                    shouldReduceMotion
                                        ? undefined
                                        : {
                                              opacity: { duration: 0.6 },
                                              scale: {
                                                  duration: 0.7,
                                                  ease: [
                                                      0.16, 1, 0.3, 1,
                                                  ] as const,
                                              },
                                              y: {
                                                  duration: 5.5,
                                                  repeat: Infinity,
                                                  ease: 'easeInOut',
                                              },
                                          }
                                }
                            >
                                <img
                                    src={activeCutoutImage}
                                    alt={theme.cutoutAlt}
                                    loading="eager"
                                    decoding="async"
                                    fetchPriority="high"
                                    className="mx-auto w-full max-w-[330px] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:scale-[1.03] sm:max-w-[430px] lg:max-w-[460px]"
                                />
                            </motion.div>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* ── 4. Luxury Promo Marquee di Bawah Hero ── */}
            <motion.div
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 40 }}
                animate={
                    shouldReduceMotion
                        ? undefined
                        : heroRevealed
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 40 }
                }
                transition={
                    shouldReduceMotion
                        ? undefined
                        : {
                              duration: 0.85,
                              delay: 0.4,
                              ease: [0.16, 1, 0.3, 1] as const,
                          }
                }
            >
                <PromoMarquee itemsRaw={content?.promo_marquee_items} />
            </motion.div>
        </section>
    );
}
