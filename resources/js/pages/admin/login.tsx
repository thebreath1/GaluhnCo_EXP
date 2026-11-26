import { Head, Link, useForm } from '@inertiajs/react';
import { motion, MotionConfig } from 'motion/react';
import {
    ArrowLeftIcon,
    EyeIcon,
    EyeOffIcon,
    LayoutTemplateIcon,
    LockKeyholeIcon,
    PackageCheckIcon,
    ShieldCheckIcon,
    UsersIcon,
} from 'lucide-react';
import { useState } from 'react';
import AdminAuthController from '@/actions/App/Http/Controllers/Admin/AuthController';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { home, login } from '@/routes';

const ADMIN_HIGHLIGHTS = [
    {
        icon: LayoutTemplateIcon,
        title: 'Kurasi Koleksi & CMS Landing Page',
        desc: 'Perbarui katalog hampers eksklusif, tag musim perayaan, serta teks halaman depan secara langsung.',
    },
    {
        icon: PackageCheckIcon,
        title: 'Kontrol Tracking Parcel 4 Tahap',
        desc: 'Pantau verifikasi pembayaran, pengemasan, nomor resi, hingga pengantaran selesai.',
    },
    {
        icon: UsersIcon,
        title: 'Manajemen Partner & Inquiry B2B',
        desc: 'Kelola pengajuan penawaran korporat dan daftar mitra perusahaan ternama.',
    },
] as const;

export default function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        email: string;
        password: string;
        remember: boolean;
    }>({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(AdminAuthController.store().url, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <MotionConfig reducedMotion="user">
            <Head title="Portal Administrator — Galuh & Co." />

            <div className="grid min-h-screen bg-[#F2EBDC] font-sans text-[#16233B] antialiased selection:bg-[#A88B54]/25 selection:text-[#16233B] lg:grid-cols-12">
                {/* ── Sisi Kiri: Editorial Showcase Deep Navy (Selaras HeroSection) ── */}
                <aside className="relative flex flex-col justify-between overflow-hidden bg-[#16233B] px-6 py-10 text-[#F2EBDC] sm:px-10 lg:col-span-6 lg:px-14 lg:py-14">
                    {/* Grain Texture */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.045]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'repeat',
                            backgroundSize: '200px 200px',
                        }}
                    />

                    {/* Hairline Inner Frame */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-3 z-[2] rounded-2xl sm:inset-5"
                        style={{
                            boxShadow: 'inset 0 0 0 1px rgba(168,139,84,0.25)',
                        }}
                    />

                    {/* Pita Brass Tipis Menyilang */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 right-0 left-0 z-[2] h-px -translate-y-1/2"
                        style={{
                            background:
                                'linear-gradient(to right, transparent 0%, rgba(168,139,84,0.22) 50%, transparent 100%)',
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute top-0 bottom-0 left-1/2 z-[2] w-px -translate-x-1/2"
                        style={{
                            background:
                                'linear-gradient(to bottom, transparent 0%, rgba(168,139,84,0.18) 50%, transparent 100%)',
                        }}
                    />

                    {/* Ambient Glow */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-20 left-1/3 z-0 h-[420px] w-[420px] rounded-full bg-[#A88B54]/12 blur-[120px]"
                    />

                    {/* Top Brand */}
                    <div className="relative z-10 flex items-center justify-between">
                        <Link
                            href={home()}
                            className="inline-flex items-center transition-opacity hover:opacity-90"
                        >
                            <img
                                src="/Asset/Logo/Logo_galu&co.png"
                                alt="Galuh & Co."
                                className="h-9 w-auto object-contain sm:h-11"
                            />
                        </Link>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A88B54]/45 bg-[#A88B54]/15 px-3.5 py-1 font-sans text-[10px] font-semibold tracking-[0.22em] text-[#F2EBDC] uppercase">
                            <span className="size-1.5 rounded-full bg-[#A88B54]" />
                            Portal Administrator
                        </span>
                    </div>

                    {/* Editorial Display Headline & Capabilities */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.55,
                            ease: [0.16, 1, 0.3, 1] as const,
                        }}
                        className="relative z-10 my-10 lg:my-0"
                    >
                        <p className="font-sans text-xs font-semibold tracking-[0.24em] text-[#A88B54] uppercase">
                            Galuh &amp; Co. Backoffice
                        </p>
                        <h1 className="mt-3 font-serif text-3xl leading-[1.15] font-normal text-[#F2EBDC] sm:text-4xl lg:text-[2.85rem]">
                            Ruang Kendali Kurasi &amp;{' '}
                            <span className="text-[#A88B54] italic">
                                Kemewahan Setiap Bingkisan
                            </span>
                        </h1>
                        <p className="mt-4 max-w-md font-sans text-xs leading-relaxed text-[#F2EBDC]/80 sm:text-sm">
                            Kelola katalog musiman, konten landing page,
                            verifikasi pesanan, hingga layanan korporat dari
                            satu dashboard terpadu.
                        </p>

                        <div className="mt-8 hidden space-y-3 lg:block">
                            {ADMIN_HIGHLIGHTS.map((item) => {
                                const IconComp = item.icon;
                                return (
                                    <div
                                        key={item.title}
                                        className="flex items-start gap-3.5 rounded-2xl border border-[#A88B54]/25 bg-[#1E2F4D]/90 p-4 shadow-[0_12px_28px_-12px_rgba(6,12,24,0.45)]"
                                    >
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#A88B54]/35 bg-[#16233B] text-[#A88B54]">
                                            <IconComp className="size-4.5" />
                                        </div>
                                        <div>
                                            <h2 className="font-serif text-base font-semibold text-[#F2EBDC]">
                                                {item.title}
                                            </h2>
                                            <p className="mt-0.5 font-sans text-xs leading-relaxed text-[#F2EBDC]/75">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Bottom Copyright */}
                    <div className="relative z-10 hidden border-t border-[#A88B54]/25 pt-5 text-xs text-[#F2EBDC]/65 lg:block">
                        &copy; {new Date().getFullYear()} GALUH &amp; CO.
                        Administrator Access Only.
                    </div>
                </aside>

                {/* ── Sisi Kanan: Formulir Login Elevated Ivory Card ────────────── */}
                <main className="relative flex flex-col justify-between px-6 py-8 sm:px-10 lg:col-span-6 lg:px-16 lg:py-12">
                    <div className="flex items-center justify-between">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-wider text-[#16233B] uppercase transition-colors hover:text-[#1F304F]"
                        >
                            <ArrowLeftIcon className="size-4" />
                            <span>Kembali ke Beranda</span>
                        </Link>
                        <span className="font-sans text-[11px] font-semibold tracking-wider text-[#6E675D] uppercase">
                            Akses Terbatas
                        </span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            delay: 0.08,
                            ease: [0.16, 1, 0.3, 1] as const,
                        }}
                        className="mx-auto my-10 w-full max-w-md"
                    >
                        <div className="overflow-hidden rounded-3xl border border-[#A88B54]/30 bg-[#FAF7F0] p-7 shadow-[0_20px_50px_-15px_rgba(22,35,59,0.14)] sm:p-10">
                            {/* Emblem */}
                            <div className="flex items-center gap-3.5 border-b border-[#A88B54]/25 pb-6">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#16233B] text-[#A88B54] shadow-sm">
                                    <ShieldCheckIcon className="size-6" />
                                </div>
                                <div>
                                    <h2 className="font-serif text-3xl leading-tight font-normal text-[#16233B]">
                                        Masuk Administrator
                                    </h2>
                                    <p className="mt-0.5 font-sans text-xs text-[#6E675D]">
                                        Gunakan kredensial resmi pengelola Galuh
                                        &amp; Co.
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="mt-6 space-y-5"
                            >
                                <div>
                                    <label
                                        htmlFor="admin_email"
                                        className="block font-sans text-xs font-semibold text-[#16233B]"
                                    >
                                        Email Administrator *
                                    </label>
                                    <input
                                        id="admin_email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="admin@galuhco.com"
                                        className="mt-1.5 w-full rounded-xl border border-[#A88B54]/35 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] transition-all outline-none placeholder:text-[#6E675D]/70 focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-1.5"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="admin_password"
                                        className="block font-sans text-xs font-semibold text-[#16233B]"
                                    >
                                        Kata Sandi *
                                    </label>
                                    <div className="relative mt-1.5">
                                        <input
                                            id="admin_password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            name="password"
                                            required
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Masukkan kata sandi"
                                            className="w-full rounded-xl border border-[#A88B54]/35 bg-white py-2.5 pr-10 pl-4 font-sans text-sm text-[#16233B] transition-all outline-none placeholder:text-[#6E675D]/70 focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                        />
                                        <button
                                            type="button"
                                            aria-label="Tampilkan kata sandi"
                                            onClick={() =>
                                                setShowPassword((v) => !v)
                                            }
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6E675D] hover:text-[#16233B]"
                                        >
                                            {showPassword ? (
                                                <EyeOffIcon className="size-4" />
                                            ) : (
                                                <EyeIcon className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError
                                        message={errors.password}
                                        className="mt-1.5"
                                    />
                                </div>

                                <label className="flex cursor-pointer items-center gap-2.5 font-sans text-xs font-medium text-[#16233B]">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                'remember',
                                                e.target.checked,
                                            )
                                        }
                                        className="size-4 rounded border-[#A88B54] accent-[#16233B]"
                                    />
                                    <span>Ingat sesi administrator ini</span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    data-test="admin-login-button"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#16233B] px-6 py-3.5 font-sans text-sm font-semibold tracking-wide text-[#F2EBDC] shadow-md transition-all duration-300 hover:bg-[#1F304F] disabled:opacity-60"
                                >
                                    {processing ? (
                                        <Spinner className="size-4" />
                                    ) : (
                                        <LockKeyholeIcon className="size-4 text-[#A88B54]" />
                                    )}
                                    {processing
                                        ? 'Memverifikasi Akses...'
                                        : 'Masuk ke Dashboard Admin'}
                                </button>
                            </form>
                        </div>

                        <p className="mt-6 text-center font-sans text-xs text-[#6E675D]">
                            Bukan administrator?{' '}
                            <Link
                                href={login()}
                                className="font-semibold text-[#16233B] underline decoration-[#A88B54] underline-offset-4 hover:text-[#1F304F]"
                            >
                                Masuk sebagai pelanggan
                            </Link>
                        </p>
                    </motion.div>

                    <div className="text-center font-sans text-[11px] text-[#6E675D] lg:text-right">
                        Dilindungi verifikasi peran administrator Galuh &amp;
                        Co.
                    </div>
                </main>
            </div>
        </MotionConfig>
    );
}
