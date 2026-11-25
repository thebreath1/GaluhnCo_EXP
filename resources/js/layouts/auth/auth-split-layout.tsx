import { Link } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    GiftIcon,
    ShieldCheckIcon,
    SparklesIcon,
} from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const BRAND_HIGHLIGHTS = [
    {
        icon: GiftIcon,
        title: 'Kurasi Hampers Eksklusif',
        desc: 'Setiap kotak dirancang dengan material pilihan, pita satin berkelas, dan kartu ucapan personal.',
    },
    {
        icon: SparklesIcon,
        title: '3D Gift Box Studio Interaktif',
        desc: 'Kombinasikan warna kotak, pita, hingga 6 pilihan isi parsel secara langsung sebelum memesan.',
    },
    {
        icon: ShieldCheckIcon,
        title: 'Tracking Parcel 4 Tahap & Layanan B2B',
        desc: 'Pantau proses dari verifikasi hingga pengantaran selesai beserta fitur video QR khusus korporat.',
    },
] as const;

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="grid min-h-screen bg-[#F2EBDC] font-sans text-[#16233B] antialiased selection:bg-[#A88B54]/25 selection:text-[#16233B] lg:grid-cols-12">
            {/* ── Panel Kiri: Editorial Showcase Deep Navy ──────────────────── */}
            <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#16233B] px-10 py-12 text-[#F2EBDC] lg:col-span-5 lg:flex xl:col-span-6 xl:px-14">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-4 rounded-2xl border border-[#A88B54]/25"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[#A88B54]/12 blur-[110px]"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-[#A88B54]/10 blur-[110px]"
                />

                <div className="relative z-10">
                    <Link
                        href={home()}
                        aria-label="Kembali ke Beranda Galuh & Co."
                        className="inline-flex items-center transition-opacity hover:opacity-90"
                    >
                        <img
                            src="/asset/logo/Logo_galu&co.png"
                            alt="Galuh & Co."
                            className="h-11 w-auto object-contain"
                        />
                    </Link>

                    <div className="mt-14 max-w-lg">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#A88B54]/45 bg-[#1E2F4D] px-3.5 py-1 font-sans text-[10px] font-semibold tracking-[0.22em] text-[#A88B54] uppercase">
                            House of Luxury Gifting
                        </span>
                        <h2 className="mt-5 font-serif text-4xl leading-[1.18] font-normal text-[#F2EBDC] xl:text-5xl">
                            Merangkai Kehangatan dalam Setiap Bingkisan Istimewa
                        </h2>
                        <p className="mt-4 font-sans text-sm leading-relaxed text-[#F2EBDC]/80">
                            Masuk atau daftarkan akun Anda untuk menyimpan buku
                            alamat, melacak status pengiriman secara real-time,
                            serta merancang bingkisan kustom di 3D Studio kami.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 mt-10 space-y-4">
                    {BRAND_HIGHLIGHTS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className="flex items-start gap-3.5 rounded-2xl border border-[#A88B54]/20 bg-[#1E2F4D]/65 p-4 backdrop-blur-sm"
                            >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#A88B54]/15 text-[#A88B54]">
                                    <Icon className="size-4" />
                                </div>
                                <div>
                                    <h3 className="font-sans text-xs font-semibold text-[#F2EBDC]">
                                        {item.title}
                                    </h3>
                                    <p className="mt-0.5 font-sans text-xs leading-relaxed text-[#F2EBDC]/75">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* ── Panel Kanan: Form Editorial Warm Ivory ────────────────────── */}
            <main className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:col-span-7 lg:px-12 xl:col-span-6">
                <div className="mx-auto w-full max-w-lg">
                    <div className="mb-6 flex items-center justify-between">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-wider text-[#16233B] uppercase transition-colors hover:text-[#1F304F]"
                        >
                            <ArrowLeftIcon className="size-4" />
                            <span>Kembali ke Beranda</span>
                        </Link>

                        <Link
                            href={home()}
                            aria-label="Galuh & Co. Beranda"
                            className="inline-flex items-center rounded-full bg-[#16233B] px-3.5 py-1.5 transition-opacity hover:opacity-90 lg:hidden"
                        >
                            <img
                                src="/asset/logo/Logo_galu&co.png"
                                alt="Galuh & Co."
                                className="h-6 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    <div className="rounded-3xl border border-[#A88B54]/30 bg-[#FAF7F0] p-6 shadow-[0_20px_50px_-15px_rgba(22,35,59,0.14)] sm:p-9">
                        {(title || description) && (
                            <div className="mb-6 border-b border-[#A88B54]/20 pb-5">
                                {title && (
                                    <h1 className="font-serif text-3xl font-normal tracking-normal text-[#16233B]">
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
                </div>
            </main>
        </div>
    );
}
