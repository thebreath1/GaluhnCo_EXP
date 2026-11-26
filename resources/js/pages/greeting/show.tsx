import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    Building2Icon,
    PlayCircleIcon,
    QuoteIcon,
    SparklesIcon,
} from 'lucide-react';
import { home } from '@/routes';

interface GreetingShowProps {
    orderNumber: string;
    companyName: string;
    greetingNote: string | null;
    videoUrl: string | null;
}

export default function GreetingShow({
    orderNumber,
    companyName,
    greetingNote,
    videoUrl,
}: GreetingShowProps) {
    return (
        <>
            <Head title={`Ucapan Spesial dari ${companyName} — Galuh & Co.`} />

            <div className="relative min-h-screen overflow-hidden bg-[#16233B] font-sans text-[#F2EBDC] antialiased selection:bg-[#A88B54]/30 selection:text-[#F2EBDC]">
                {/* Ambient Radial Glows */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
                >
                    <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#A88B54]/12 blur-[130px]" />
                    <div className="absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full bg-[#1E2F4D]/80 blur-[120px]" />
                </div>

                {/* Hairline Luxury Frame */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none fixed inset-3 z-0 rounded-2xl border border-[#A88B54]/20 sm:inset-5"
                />

                {/* Top Brand Bar */}
                <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-wider text-[#F2EBDC]/85 uppercase transition-colors hover:text-[#A88B54]"
                    >
                        <ArrowLeftIcon className="size-4" />
                        <span>Galuh &amp; Co.</span>
                    </Link>

                    <Link href={home()} className="flex items-center">
                        <img
                            src="/Asset/Logo/Logo_galu&co.png"
                            alt="Galuh & Co."
                            className="h-8 w-auto object-contain sm:h-9"
                        />
                    </Link>

                    <span className="rounded-full border border-[#A88B54]/40 bg-[#1E2F4D] px-3 py-1 font-mono text-[11px] text-[#F2EBDC]">
                        {orderNumber}
                    </span>
                </header>

                {/* Main Unveiling Content */}
                <main className="relative z-10 mx-auto max-w-4xl px-6 pt-4 pb-20">
                    {/* Hero Intro */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#A88B54]/45 bg-[#A88B54]/15 px-4 py-1.5">
                            <Building2Icon className="size-3.5 text-[#A88B54]" />
                            <span className="font-sans text-[11px] font-semibold tracking-[0.22em] text-[#F2EBDC] uppercase">
                                Pesan Eksklusif Corporate
                            </span>
                        </div>

                        <h1 className="mt-5 font-serif text-3xl leading-tight font-normal text-[#F2EBDC] sm:text-5xl">
                            Bingkisan &amp; Ucapan Spesial{' '}
                            <span className="block text-[#A88B54] italic">
                                dari {companyName}
                            </span>
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl font-sans text-xs leading-relaxed text-[#F2EBDC]/80 sm:text-sm">
                            Sebuah persembahan hangat yang dikurasi bersama
                            Galuh &amp; Co. untuk menyampaikan apresiasi tulus
                            kepada Anda.
                        </p>
                    </div>

                    {/* Video Player Showcase */}
                    <div className="mt-10 rounded-3xl border border-[#A88B54]/40 bg-[#1E2F4D] p-3 shadow-[0_24px_60px_-15px_rgba(6,12,24,0.75)] sm:p-5">
                        {videoUrl ? (
                            <video
                                src={videoUrl}
                                controls
                                playsInline
                                preload="metadata"
                                className="aspect-video w-full overflow-hidden rounded-2xl bg-black"
                            />
                        ) : (
                            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-[#A88B54]/25 bg-[#16233B] p-8 text-center">
                                <div className="flex size-16 items-center justify-center rounded-full border border-[#A88B54]/40 bg-[#1E2F4D] text-[#A88B54]">
                                    <PlayCircleIcon className="size-8" />
                                </div>
                                <p className="mt-4 font-serif text-xl text-[#F2EBDC]">
                                    Bingkisan Spesial dari {companyName}
                                </p>
                                <p className="mt-2 max-w-md font-sans text-xs text-[#F2EBDC]/75">
                                    Video sambutan belum dilampirkan pada
                                    pesanan ini. Silakan baca pesan tertulis
                                    eksklusif di bawah ini.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Greeting Card Note (Warm Ivory) */}
                    {greetingNote && (
                        <div className="mt-8 rounded-3xl border border-[#A88B54]/40 bg-[#FAF7F0] p-6 text-[#16233B] shadow-[0_18px_42px_-12px_rgba(6,12,24,0.45)] sm:p-10">
                            <div className="flex items-center justify-between border-b border-[#A88B54]/25 pb-4">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="size-4 text-[#A88B54]" />
                                    <span className="font-sans text-xs font-semibold tracking-[0.22em] text-[#6E675D] uppercase">
                                        Kartu Ucapan
                                    </span>
                                </div>
                                <QuoteIcon className="size-6 text-[#A88B54]" />
                            </div>
                            <p className="mt-5 font-serif text-xl leading-relaxed whitespace-pre-line text-[#16233B] italic sm:text-2xl">
                                &ldquo;{greetingNote}&rdquo;
                            </p>
                            <p className="mt-5 font-sans text-xs font-semibold tracking-wider text-[#6E675D] uppercase">
                                — {companyName}
                            </p>
                        </div>
                    )}

                    {/* CTA Footer */}
                    <div className="mt-12 text-center">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-2 rounded-full border border-[#A88B54] bg-transparent px-7 py-3 font-sans text-xs font-semibold tracking-wider text-[#F2EBDC] uppercase transition-colors hover:bg-[#A88B54] hover:text-[#16233B]"
                        >
                            Jelajahi Koleksi Galuh &amp; Co.
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
}
