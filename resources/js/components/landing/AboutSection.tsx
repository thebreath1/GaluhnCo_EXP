import type { Variants } from 'motion/react';
import { motion, useReducedMotion } from 'motion/react';
import {
    HeartHandshakeIcon,
    LayersIcon,
    PackageCheckIcon,
    SparklesIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCmsText, type SectionContent } from '@/components/landing/cms';
import SectionDivider from '@/components/landing/SectionDivider';
import type { Product } from '@/types/product';

interface AboutSectionProps {
    products?: Product[];
    content?: SectionContent;
}

interface EditorialCard {
    src: string;
    alt: string;
    title: string;
}

const FALLBACK_EDITORIAL_CARDS: EditorialCard[] = [
    {
        src: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=75&auto=format&fit=crop',
        alt: 'Detail hampers mewah Galuh & Co. dengan pita satin dan ornamen artisanal',
        title: 'The Nusantara Executive Box',
    },
    {
        src: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=75&auto=format&fit=crop',
        alt: 'Kurasi hampers teh dan bingkisan eksklusif Galuh & Co.',
        title: 'Heritage Tea & Brass Set',
    },
    {
        src: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=75&auto=format&fit=crop',
        alt: 'Koleksi bingkisan perayaan bernuansa hangat Galuh & Co.',
        title: 'Festive Glow Signature',
    },
    {
        src: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&q=75&auto=format&fit=crop',
        alt: 'Hampers koper mini dan perlengkapan kurasi mewah Galuh & Co.',
        title: 'Grand Appreciation Trunk',
    },
];

const FADE_UP_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1] as const,
        },
    },
};

const STAGGER_CONTAINER: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const PILLARS = [
    {
        icon: SparklesIcon,
        title: 'Kurasi Pilihan',
        desc: 'Produk artisan dan bahan berkualitas tinggi.',
    },
    {
        icon: PackageCheckIcon,
        title: 'Packaging Premium',
        desc: 'Kotak kokoh dengan estetika warm luxury.',
    },
    {
        icon: HeartHandshakeIcon,
        title: 'Sentuhan Personal',
        desc: 'Bebas kustomisasi kartu ucapan dan branding.',
    },
];

export default function AboutSection({
    products = [],
    content,
}: AboutSectionProps) {
    const shouldReduceMotion = useReducedMotion() ?? false;

    const cards = useMemo<EditorialCard[]>(() => {
        const seen = new Set<string>();
        const fromProducts: EditorialCard[] = [];

        for (const product of products) {
            const url = product.image_url?.trim();
            if (!url || seen.has(url)) continue;
            seen.add(url);
            fromProducts.push({
                src: url,
                alt: product.name,
                title: product.name,
            });
        }

        for (const fallback of FALLBACK_EDITORIAL_CARDS) {
            if (fromProducts.length >= 4) break;
            if (!seen.has(fallback.src)) {
                seen.add(fallback.src);
                fromProducts.push(fallback);
            }
        }

        return fromProducts.slice(0, 6);
    }, [products]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [leavingIndex, setLeavingIndex] = useState<number | null>(null);
    const [isHoveringDesktop, setIsHoveringDesktop] = useState(false);
    const [tiltedPillars, setTiltedPillars] = useState<Record<number, boolean>>(
        {},
    );

    const togglePillarTilt = (idx: number) => {
        setTiltedPillars((prev) => ({
            ...prev,
            [idx]: !prev[idx],
        }));
    };

    const safeActiveIndex = cards.length > 0 ? activeIndex % cards.length : 0;

    const activeIndexRef = useRef(0);
    const shuffleTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        activeIndexRef.current = safeActiveIndex;
    }, [safeActiveIndex]);

    const triggerShuffle = useCallback(() => {
        if (cards.length <= 1) return;

        const current = activeIndexRef.current;
        const next = (current + 1) % cards.length;

        setLeavingIndex(current);
        setActiveIndex(next);
        activeIndexRef.current = next;

        if (shuffleTimeoutRef.current !== null) {
            window.clearTimeout(shuffleTimeoutRef.current);
        }

        shuffleTimeoutRef.current = window.setTimeout(
            () => {
                setLeavingIndex(null);
                shuffleTimeoutRef.current = null;
            },
            shouldReduceMotion ? 80 : 250,
        );
    }, [cards.length, shouldReduceMotion]);

    useEffect(() => {
        return () => {
            if (shuffleTimeoutRef.current !== null) {
                window.clearTimeout(shuffleTimeoutRef.current);
            }
        };
    }, []);

    const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'mouse') {
            setIsHoveringDesktop(true);
            triggerShuffle();
        }
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'mouse') {
            setIsHoveringDesktop(false);
        }
    };

    const handleCardTap = (e: React.MouseEvent<HTMLDivElement>) => {
        // Di perangkat sentuh / mobile (tidak sedang hover mouse), wajib ditekan untuk mengocok kartu
        if (!isHoveringDesktop) {
            e.preventDefault();
            triggerShuffle();
        }
    };

    const eyebrow = getCmsText(content, 'eyebrow', 'Tentang Galuh & Co.');
    const title = getCmsText(content, 'title', 'Lebih dari Sekadar Hadiah,');
    const titleItalic = getCmsText(
        content,
        'title_italic',
        'Sebuah Pengalaman Membuka Kebahagiaan',
    );
    const description = getCmsText(
        content,
        'description',
        'Kami percaya setiap bingkisan membawa cerita dan ketulusan pengirimnya. Di Galuh & Co., setiap elemen dipilih dengan saksama—mulai dari kualitas isi, keharuman kemasan, hingga kartu ucapan tulisan tangan—untuk menciptakan kesan yang tak terlupakan.',
    );
    const badgeTitle = getCmsText(
        content,
        'badge_title',
        '100% Curated Quality',
    );
    const badgeSubtitle = getCmsText(
        content,
        'badge_subtitle',
        'Artisanal, Elegant & Personal',
    );

    return (
        <section
            id="tentang"
            className="relative scroll-mt-20 overflow-hidden bg-[#F2EBDC] py-20 md:py-28"
        >
            <SectionDivider />
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Kolom Kiri: Tumpukan Kartu Foto Editorial (Hover Kocok Desktop / Tap Mobile) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                            duration: 0.7,
                            ease: [0.16, 1, 0.3, 1] as const,
                        }}
                        className="relative mx-auto w-full max-w-lg lg:max-w-none"
                    >
                        {/* Sorotan Gradasi Radial Muted Brass 8% */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-10 z-0 rounded-full blur-2xl"
                            style={{
                                background:
                                    'radial-gradient(circle, rgba(168,139,84,0.08) 0%, transparent 70%)',
                            }}
                        />

                        {/* Bingkai Garis Tipis Ganda Bergaya Kartu Undangan / Kotak Hadiah */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-2.5 z-0 rounded-[22px] border border-[#A88B54]/35 sm:-inset-3"
                        />

                        {/* Area Interaktif Tumpukan Kartu */}
                        <div
                            role="button"
                            tabIndex={0}
                            aria-label="Galeri kartu hampers Galuh & Co. Arahkan kursor di desktop atau ketuk di mobile untuk mengocok foto"
                            onPointerEnter={handlePointerEnter}
                            onPointerLeave={handlePointerLeave}
                            onClick={handleCardTap}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    triggerShuffle();
                                }
                            }}
                            className="group relative z-10 cursor-pointer rounded-2xl border border-[#A88B54]/45 bg-[#FAF7F0] p-2 shadow-[0_18px_42px_-14px_rgba(22,35,59,0.16)] select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A88B54]"
                        >
                            <div className="relative aspect-[4/5] w-full overflow-visible rounded-xl">
                                {cards.map((card, idx) => {
                                    const total = cards.length;
                                    const relPos =
                                        (idx - safeActiveIndex + total) % total;
                                    const isLeaving = idx === leavingIndex;

                                    let targetAnimate: {
                                        x: number;
                                        y: number;
                                        rotate: number;
                                        scale: number;
                                        opacity: number;
                                    };
                                    let zIndex = 5;

                                    if (isLeaving && !shouldReduceMotion) {
                                        // Kartu teratas meluncur keluar ke kanan sambil miring seperti dikocok
                                        targetAnimate = {
                                            x: 110,
                                            y: -22,
                                            rotate: 11,
                                            scale: 0.96,
                                            opacity: 0.96,
                                        };
                                        zIndex = 40;
                                    } else if (relPos === 0) {
                                        targetAnimate = {
                                            x: 0,
                                            y: 0,
                                            rotate: 0,
                                            scale: 1,
                                            opacity: 1,
                                        };
                                        zIndex = 30;
                                    } else if (relPos === 1) {
                                        targetAnimate = {
                                            x: 10,
                                            y: 6,
                                            rotate: 2.8,
                                            scale: 0.965,
                                            opacity: 0.95,
                                        };
                                        zIndex = 20;
                                    } else if (relPos === 2) {
                                        targetAnimate = {
                                            x: -8,
                                            y: 12,
                                            rotate: -2.6,
                                            scale: 0.93,
                                            opacity: 0.88,
                                        };
                                        zIndex = 10;
                                    } else {
                                        targetAnimate = {
                                            x: 0,
                                            y: 14,
                                            rotate: 0,
                                            scale: 0.9,
                                            opacity: 0,
                                        };
                                        zIndex = 5;
                                    }

                                    return (
                                        <motion.div
                                            key={card.src}
                                            initial={false}
                                            animate={targetAnimate}
                                            transition={
                                                shouldReduceMotion
                                                    ? { duration: 0.15 }
                                                    : isLeaving
                                                      ? {
                                                            duration: 0.24,
                                                            ease: [
                                                                0.32, 0.72, 0,
                                                                1,
                                                            ] as const,
                                                        }
                                                      : {
                                                            type: 'spring',
                                                            stiffness: 260,
                                                            damping: 24,
                                                        }
                                            }
                                            style={{ zIndex }}
                                            className="absolute inset-0 overflow-hidden rounded-xl border border-[#A88B54]/45 bg-[#FAF7F0] shadow-[0_14px_34px_-12px_rgba(22,35,59,0.28)] will-change-transform"
                                        >
                                            <img
                                                src={card.src}
                                                alt={card.alt}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                                decoding="async"
                                                draggable={false}
                                            />
                                            {/* Hairline inner frame di atas foto */}
                                            <div
                                                aria-hidden="true"
                                                className="pointer-events-none absolute inset-2 rounded-lg ring-1 ring-[#A88B54]/35 ring-inset"
                                            />
                                            {/* Gradient Overlay Lembut di Bagian Bawah */}
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#16233B]/55 via-transparent to-transparent" />

                                            {/* Label kecil nama hampers + indikator kartu */}
                                            {relPos === 0 && !isLeaving && (
                                                <div className="pointer-events-none absolute top-3.5 right-3.5 left-3.5 flex items-center justify-between gap-2">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A88B54]/45 bg-[#16233B]/80 px-2.5 py-1 font-sans text-[10px] font-semibold tracking-wider text-[#F2EBDC] backdrop-blur-xs">
                                                        <LayersIcon className="size-3 text-[#A88B54]" />
                                                        <span className="md:hidden">
                                                            Ketuk untuk kocok
                                                        </span>
                                                        <span className="hidden md:inline">
                                                            Hover untuk kocok
                                                        </span>
                                                    </span>
                                                    <span className="rounded-full bg-[#FAF7F0]/90 px-2.5 py-1 font-mono text-[10px] font-bold text-[#16233B] shadow-xs">
                                                        {safeActiveIndex + 1}/
                                                        {cards.length}
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Floating Badge Editorial (Light Paper Glass Card) */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{
                                duration: 0.6,
                                delay: 0.25,
                                ease: [0.16, 1, 0.3, 1] as const,
                            }}
                            className="pointer-events-none absolute -right-2 -bottom-6 z-50 rounded-2xl border border-[#A88B54]/35 bg-[#FAF7F0]/95 p-4 shadow-[0_14px_34px_-10px_rgba(22,35,59,0.16)] backdrop-blur-md sm:right-6 sm:p-5"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-[#16233B] text-[#A88B54]">
                                    <SparklesIcon className="size-5" />
                                </div>
                                <div>
                                    <p className="font-serif text-sm font-semibold text-[#16233B]">
                                        {badgeTitle}
                                    </p>
                                    <p className="font-sans text-xs text-[#6E675D]">
                                        {badgeSubtitle}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Kolom Kanan: Narasi Brand & 3 Pilar Nilai */}
                    <motion.div
                        variants={STAGGER_CONTAINER}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="relative flex flex-col"
                    >
                        {/* Ambient radial glow halus di belakang judul section */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-12 -left-12 z-0 h-64 w-64 rounded-full blur-2xl"
                            style={{
                                background:
                                    'radial-gradient(circle, rgba(168,139,84,0.08) 0%, transparent 70%)',
                            }}
                        />

                        {/* Eyebrow */}
                        <motion.div
                            variants={FADE_UP_VARIANTS}
                            className="relative z-10"
                        >
                            <span className="font-sans text-xs font-semibold tracking-[0.24em] text-[#6E675D] uppercase">
                                {eyebrow}
                            </span>
                        </motion.div>

                        {/* Judul Serif Utama */}
                        <motion.h2
                            variants={FADE_UP_VARIANTS}
                            className="relative z-10 mt-3 font-serif text-3xl leading-[1.22] font-normal tracking-normal text-[#16233B] sm:text-4xl lg:text-[2.65rem]"
                        >
                            {title}{' '}
                            <span className="italic">{titleItalic}</span>
                        </motion.h2>

                        {/* Paragraf Cerita */}
                        <motion.p
                            variants={FADE_UP_VARIANTS}
                            className="relative z-10 mt-6 font-sans text-base leading-relaxed font-normal text-[#6E675D] sm:text-lg"
                        >
                            {description}
                        </motion.p>

                        {/* Sub-Grid 3 Pilar Nilai Brand */}
                        <motion.div
                            variants={FADE_UP_VARIANTS}
                            className="relative z-10 mt-8 grid grid-cols-1 gap-4 border-t border-[#A88B54]/30 pt-8 sm:grid-cols-3"
                        >
                            {PILLARS.map((pillar, idx) => {
                                const IconComponent = pillar.icon;
                                const isTilted = Boolean(tiltedPillars[idx]);
                                const tiltTransition = shouldReduceMotion
                                    ? { duration: 0.15 }
                                    : {
                                          duration: 0.62,
                                          ease: [0.22, 1, 0.36, 1] as const,
                                      };

                                return (
                                    <div
                                        key={idx}
                                        className="relative [perspective:1100px]"
                                    >
                                        {/* Bayangan lembut di atas background #F2EBDC */}
                                        <motion.div
                                            aria-hidden="true"
                                            initial={false}
                                            animate={
                                                isTilted && !shouldReduceMotion
                                                    ? {
                                                          opacity: 1,
                                                          rotateX: 54,
                                                          rotateY: 6,
                                                          rotateZ: -32,
                                                          x: 16,
                                                          y: 16,
                                                          scale: 0.9,
                                                      }
                                                    : {
                                                          opacity: 0,
                                                          rotateX: 0,
                                                          rotateY: 0,
                                                          rotateZ: 0,
                                                          x: 0,
                                                          y: 0,
                                                          scale: 0.95,
                                                      }
                                            }
                                            transition={tiltTransition}
                                            className="pointer-events-none absolute inset-0 rounded-xl bg-[#16233B]/[0.07] blur-[1px]"
                                        />

                                        {/* Ketebalan sisi 3D kartu agar menyatu natural */}
                                        <motion.div
                                            aria-hidden="true"
                                            initial={false}
                                            animate={
                                                isTilted && !shouldReduceMotion
                                                    ? {
                                                          opacity: 1,
                                                          rotateX: 54,
                                                          rotateY: 6,
                                                          rotateZ: -32,
                                                          x: 4,
                                                          y: 7,
                                                          scale: 0.92,
                                                      }
                                                    : {
                                                          opacity: 0,
                                                          rotateX: 0,
                                                          rotateY: 0,
                                                          rotateZ: 0,
                                                          x: 0,
                                                          y: 0,
                                                          scale: 1,
                                                      }
                                            }
                                            transition={tiltTransition}
                                            className="pointer-events-none absolute inset-0 rounded-xl bg-[#E2D8C4]"
                                        />

                                        {/* Permukaan utama kartu */}
                                        <motion.button
                                            type="button"
                                            aria-pressed={isTilted}
                                            onClick={() =>
                                                togglePillarTilt(idx)
                                            }
                                            initial={false}
                                            animate={
                                                isTilted && !shouldReduceMotion
                                                    ? {
                                                          rotateX: 54,
                                                          rotateY: 6,
                                                          rotateZ: -32,
                                                          x: -2,
                                                          y: -4,
                                                          scale: 0.92,
                                                      }
                                                    : {
                                                          rotateX: 0,
                                                          rotateY: 0,
                                                          rotateZ: 0,
                                                          x: 0,
                                                          y: 0,
                                                          scale: 1,
                                                      }
                                            }
                                            whileHover={
                                                !isTilted && !shouldReduceMotion
                                                    ? { y: -4 }
                                                    : undefined
                                            }
                                            transition={tiltTransition}
                                            className={`relative z-10 flex h-full w-full cursor-pointer flex-col space-y-2 rounded-xl border p-4 text-left transition-colors duration-500 will-change-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A88B54] ${
                                                isTilted
                                                    ? 'border-[#A88B54]/15 bg-[#F7F1E4] shadow-none'
                                                    : 'border-[#A88B54]/25 bg-[#FAF7F0] shadow-[0_12px_30px_-12px_rgba(22,35,59,0.10)] hover:border-[#A88B54]/60 hover:shadow-[0_18px_38px_-12px_rgba(22,35,59,0.16)]'
                                            }`}
                                        >
                                            <div className="flex size-9 items-center justify-center rounded-lg bg-[#A88B54]/15 text-[#A88B54]">
                                                <IconComponent className="size-5" />
                                            </div>
                                            <h3 className="font-serif text-base font-semibold text-[#16233B]">
                                                {pillar.title}
                                            </h3>
                                            <p className="font-sans text-xs leading-relaxed font-normal text-[#6E675D]">
                                                {pillar.desc}
                                            </p>
                                        </motion.button>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
