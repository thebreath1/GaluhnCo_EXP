import { Link } from '@inertiajs/react';
import { ChevronLeftIcon } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthLayout({
    title = '',
    description = '',
    maxWidth = 'md',
    children,
}: AuthLayoutProps) {
    const cardWidthClass = maxWidth === 'xl' ? 'max-w-xl' : 'max-w-md';

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#16233B] px-4 py-8 font-sans text-[#16233B] antialiased selection:bg-[#A88B54]/25 selection:text-[#F2EBDC] sm:px-6 sm:py-10">
            {/* ── Atmospheric Gradient & Radial Glows ────────────────────────── */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse 75% 55% at 50% 0%, rgba(30,47,77,0.9) 0%, rgba(22,35,59,0) 70%), radial-gradient(circle at 82% 18%, rgba(168,139,84,0.15) 0%, transparent 45%), radial-gradient(circle at 16% 85%, rgba(168,139,84,0.12) 0%, transparent 48%)',
                }}
            />

            {/* ── Subtle Grain Texture ───────────────────────────────────────── */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '200px 200px',
                }}
            />

            {/* ── Top-Left Back Navigation ───────────────────────────────────── */}
            <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center">
                <Link
                    href={home()}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-sans text-xs font-semibold tracking-wider text-[#F2EBDC]/80 uppercase transition-colors hover:text-[#A88B54]"
                >
                    <ChevronLeftIcon className="size-4" />
                    <span>Beranda</span>
                </Link>
            </header>

            {/* ── Centered Logo + Floating Ivory Paper Card ──────────────────── */}
            <main className="relative z-10 mx-auto flex w-full flex-1 flex-col items-center justify-center py-6 sm:py-8">
                <Link
                    href={home()}
                    aria-label="Galuh & Co. Beranda"
                    className="mb-6 inline-flex items-center justify-center transition-opacity hover:opacity-90"
                >
                    <img
                        src="/asset/logo/Logo_galu&co.png"
                        alt="Galuh & Co."
                        loading="eager"
                        decoding="async"
                        className="h-11 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)] sm:h-12"
                    />
                </Link>

                <div
                    className={`w-full ${cardWidthClass} rounded-3xl border border-[#A88B54]/25 bg-[#FAF7F0] p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] sm:p-9`}
                >
                    {(title || description) && (
                        <div className="mb-6 text-center">
                            {title && (
                                <h1 className="font-serif text-3xl font-normal tracking-normal text-[#16233B] sm:text-[2rem]">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="mt-1.5 font-sans text-xs leading-relaxed text-[#6E675D] sm:text-sm">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}

                    {children}
                </div>
            </main>
        </div>
    );
}
