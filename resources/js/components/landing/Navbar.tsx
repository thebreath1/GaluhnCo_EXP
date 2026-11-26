import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import {
    MenuIcon,
    ShoppingBagIcon,
    SparklesIcon,
    UserIcon,
    XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AccountController from '@/actions/App/Http/Controllers/AccountController';
import B2BCustomizerController from '@/actions/App/Http/Controllers/B2BCustomizerController';
import CartController from '@/actions/App/Http/Controllers/CartController';
import { home, login } from '@/routes';
import type { SharedPageProps } from '@/types';

const NAV_LINKS = [
    { href: '#tentang', label: 'Tentang' },
    { href: '#koleksi', label: 'Katalog' },
    { href: '#cara-pesan', label: 'Cara Pesan' },
    { href: '#corporate', label: 'Corporate' },
    { href: '#faq', label: 'FAQ' },
];

export default function Navbar() {
    const { url, props } = usePage<SharedPageProps>();
    const { auth, cartCount } = props;
    const user = auth?.user ?? null;
    const isHomePage =
        url === '/' || url.startsWith('/?') || url.startsWith('/#');

    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY >= 40);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const resolveNavHref = (href: string): string => {
        if (!isHomePage && href.startsWith('#')) {
            return `/${href}`;
        }
        return href;
    };

    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        if (isHomePage && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
        setMobileOpen(false);
    };

    const cartHref = user ? CartController.index().url : login().url;
    const accountHref = user ? AccountController.index().url : login().url;

    const logoImage = (
        <img
            src="/Asset/Logo/gnc-hitam.png"
            alt="Galuh & Co."
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="pointer-events-none max-h-10 max-w-full object-contain sm:max-h-11"
        />
    );

    return (
        <header className="pointer-events-none fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
            {/* ── Main Floating Pill Glass Container ────────────────────────────── */}
            <nav
                aria-label="Navigasi Utama"
                className={`pointer-events-auto mx-auto flex h-[64px] max-w-6xl items-center justify-between rounded-full px-5 ring-1 ring-white/45 transition-all duration-300 ring-inset sm:px-7 ${
                    isScrolled
                        ? 'border border-[#A88B54]/35 bg-[#FAF7F0]/75 shadow-[0_10px_34px_rgba(22,35,59,0.14)] backdrop-blur-xl backdrop-saturate-150'
                        : 'border border-white/45 bg-white/55 shadow-[0_8px_32px_rgba(15,23,42,0.14)] backdrop-blur-xl backdrop-saturate-150'
                }`}
            >
                {/* 1. Kiri: Logo GALUH & CO. */}
                {isHomePage ? (
                    <a
                        href="#"
                        aria-label="Galuh & Co. Beranda"
                        className="relative flex h-11 w-20 shrink-0 items-center justify-center sm:h-12 sm:w-24"
                    >
                        {logoImage}
                    </a>
                ) : (
                    <Link
                        href={home()}
                        aria-label="Galuh & Co. Beranda"
                        className="relative flex h-11 w-20 shrink-0 items-center justify-center sm:h-12 sm:w-24"
                    >
                        {logoImage}
                    </Link>
                )}

                {/* 2. Tengah (Desktop): Link Smooth-scroll + 3D Customizer */}
                <div className="hidden items-center gap-5 lg:flex lg:gap-7">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={resolveNavHref(link.href)}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className="group relative py-1 font-sans text-xs font-semibold tracking-wider text-[#16233B]/85 uppercase transition-colors duration-200 hover:text-[#16233B]"
                        >
                            <span>{link.label}</span>
                            <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#A88B54] transition-all duration-300 group-hover:w-full" />
                        </a>
                    ))}

                    <Link
                        href={B2BCustomizerController.index()}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#A88B54]/55 bg-[#A88B54]/15 px-3 py-1 font-sans text-[11px] font-semibold tracking-wider text-[#16233B] uppercase transition-colors hover:bg-[#A88B54]/30"
                    >
                        <SparklesIcon className="size-3 text-[#A88B54]" />
                        <span>3D Customizer</span>
                    </Link>
                </div>

                {/* 3. Kanan: Keranjang + Akun / Masuk */}
                <div className="flex items-center gap-2">
                    <Link
                        href={cartHref}
                        aria-label="Keranjang Belanja"
                        className="relative inline-flex size-9 items-center justify-center rounded-full border border-[#16233B]/20 bg-white/50 text-[#16233B] transition-colors hover:border-[#A88B54] hover:bg-white/80"
                    >
                        <ShoppingBagIcon className="size-4 text-[#16233B]" />
                        {cartCount > 0 && (
                            <span className="py-0.2 absolute -top-1 -right-1 flex min-w-[18px] items-center justify-center rounded-full bg-[#A88B54] px-1 font-sans text-[10px] font-bold text-[#16233B] shadow-xs">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>

                    <Link
                        href={accountHref}
                        className="hidden items-center gap-1.5 rounded-full bg-[#16233B] px-4 py-2 font-sans text-xs font-semibold tracking-wide text-[#F2EBDC] transition-all duration-300 hover:scale-[1.02] hover:bg-[#1F304F] active:scale-[0.98] sm:inline-flex"
                    >
                        <UserIcon className="size-3.5 text-[#A88B54]" />
                        <span>{user ? 'Akun Saya' : 'Masuk'}</span>
                    </Link>

                    {/* Tombol Hamburger di Layar Mobile / Tablet (< 1024px) */}
                    <button
                        type="button"
                        aria-label="Buka menu navigasi"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="flex size-9 items-center justify-center rounded-full text-[#16233B] transition-colors hover:bg-[#16233B]/10 lg:hidden"
                    >
                        {mobileOpen ? (
                            <XIcon className="size-5" />
                        ) : (
                            <MenuIcon className="size-5" />
                        )}
                    </button>
                </div>
            </nav>

            {/* ── Mobile Floating Glass Card / Drawer ───────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="pointer-events-auto mx-auto mt-2 max-w-6xl rounded-3xl border border-white/50 bg-[#FAF7F0]/85 p-6 shadow-2xl ring-1 ring-white/40 backdrop-blur-2xl backdrop-saturate-150 ring-inset lg:hidden"
                    >
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center justify-between border-b border-[#A88B54]/25 pb-3">
                                <img
                                    src="/Asset/Logo/gnc-hitam.png"
                                    alt="Galuh & Co."
                                    loading="lazy"
                                    decoding="async"
                                    className="h-7 w-auto object-contain"
                                />
                                <span className="font-sans text-[10px] font-semibold tracking-[0.25em] text-[#A88B54] uppercase">
                                    Menu Navigasi
                                </span>
                            </div>

                            <div className="flex flex-col divide-y divide-[#A88B54]/20">
                                {NAV_LINKS.map((link) => (
                                    <a
                                        key={link.href}
                                        href={resolveNavHref(link.href)}
                                        onClick={(e) =>
                                            handleNavClick(e, link.href)
                                        }
                                        className="py-3 font-serif text-lg font-normal tracking-normal text-[#16233B] transition-colors hover:text-[#A88B54]"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <Link
                                    href={B2BCustomizerController.index()}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-between py-3 font-serif text-lg font-normal text-[#16233B] hover:text-[#A88B54]"
                                >
                                    <span>3D Gift Box Customizer</span>
                                    <SparklesIcon className="size-4 text-[#A88B54]" />
                                </Link>
                            </div>

                            <div className="flex flex-col gap-2.5 border-t border-[#A88B54]/25 pt-2">
                                <Link
                                    href={cartHref}
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#A88B54]/45 bg-white/70 py-3 font-sans text-xs font-semibold tracking-wide text-[#16233B] transition-colors hover:bg-white"
                                >
                                    <ShoppingBagIcon className="size-4" />
                                    Keranjang Belanja
                                    {cartCount > 0 ? ` (${cartCount})` : ''}
                                </Link>

                                <Link
                                    href={accountHref}
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#16233B] py-3 font-sans text-xs font-semibold tracking-wide text-[#F2EBDC] transition-colors hover:bg-[#1F304F]"
                                >
                                    <UserIcon className="size-4 text-[#A88B54]" />
                                    {user ? 'Akun Saya' : 'Masuk / Daftar'}
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
