import { Link, router, usePage } from '@inertiajs/react';
import {
    BellIcon,
    BuildingIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClipboardListIcon,
    ExternalLinkIcon,
    LayoutGridIcon,
    LayoutTemplateIcon,
    LogOutIcon,
    MenuIcon,
    MessageSquareTextIcon,
    PackageIcon,
    SettingsIcon,
    TagIcon,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import * as AdminInquiryController from '@/actions/App/Http/Controllers/Admin/InquiryController';
import * as AdminLandingContentController from '@/actions/App/Http/Controllers/Admin/LandingContentController';
import * as AdminOrderController from '@/actions/App/Http/Controllers/Admin/OrderController';
import * as AdminPartnerController from '@/actions/App/Http/Controllers/Admin/PartnerController';
import * as AdminProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
import * as AdminPromotionController from '@/actions/App/Http/Controllers/Admin/PromotionController';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { dashboard, home, logout } from '@/routes';
import type { Auth } from '@/types';
import { cn } from '@/utils';

type Props = {
    children: ReactNode;
};

const navItems = [
    { href: dashboard().url, icon: LayoutGridIcon, label: 'Dashboard' },
    {
        href: AdminProductController.index().url,
        icon: PackageIcon,
        label: 'Produk',
    },
    {
        href: AdminPromotionController.index().url,
        icon: TagIcon,
        label: 'Diskon & Promo',
    },
    {
        href: AdminOrderController.index().url,
        icon: ClipboardListIcon,
        label: 'Pesanan',
    },
    {
        href: AdminInquiryController.index().url,
        icon: MessageSquareTextIcon,
        label: 'Inquiry',
    },
    {
        href: AdminPartnerController.index().url,
        icon: BuildingIcon,
        label: 'Partner',
    },
    {
        href: AdminLandingContentController.index().url,
        icon: LayoutTemplateIcon,
        label: 'Konten Landing',
    },
    { href: '/settings/profile', icon: SettingsIcon, label: 'Pengaturan' },
];

export default function AdminLayout({ children }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const getInitials = useInitials();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        router.visit(logout().url, { method: 'post' });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#F2EBDC] font-sans text-[#16233B] antialiased selection:bg-[#A88B54]/25 selection:text-[#16233B]">
            {/* ── Sidebar Deep Navy ──────────────────────────────────────────── */}
            <aside
                className={cn(
                    'relative flex flex-shrink-0 flex-col border-r border-[#A88B54]/25 bg-[#16233B] py-5 text-[#F2EBDC] transition-all duration-300 ease-in-out',
                    collapsed ? 'w-16 items-center' : 'w-60',
                )}
            >
                {/* Logo row */}
                <div
                    className={cn(
                        'mb-6 flex items-center gap-3 px-4',
                        collapsed && 'justify-center px-0',
                    )}
                >
                    {collapsed ? (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#A88B54]/50 bg-[#1E2F4D] font-serif text-lg font-semibold text-[#F2EBDC] shadow-xs">
                            G
                        </div>
                    ) : (
                        <Link
                            href={dashboard()}
                            className="flex flex-col gap-1 transition-opacity hover:opacity-90"
                        >
                            <img
                                src="/asset/logo/Logo_galu&co.png"
                                alt="Galuh & Co."
                                className="h-8 w-auto object-contain"
                            />
                            <span className="font-sans text-[10px] font-semibold tracking-[0.22em] text-[#A88B54] uppercase">
                                Admin Studio
                            </span>
                        </Link>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-1 px-2.5">
                    {navItems.map((item) => {
                        const isActive = isCurrentOrParentUrl(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={collapsed ? item.label : undefined}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-sm font-medium transition-all',
                                    collapsed && 'justify-center px-0',
                                    isActive
                                        ? 'border border-[#A88B54]/45 bg-[#1E2F4D] text-[#F2EBDC] shadow-sm'
                                        : 'border border-transparent text-[#F2EBDC]/70 hover:bg-[#1E2F4D]/60 hover:text-[#F2EBDC]',
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'size-4.5 shrink-0',
                                        isActive
                                            ? 'text-[#A88B54]'
                                            : 'text-[#F2EBDC]/65',
                                    )}
                                />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User + logout */}
                <div className="mt-auto space-y-1.5 px-2.5">
                    {!collapsed && auth.user && (
                        <div className="flex items-center gap-2.5 rounded-xl border border-[#A88B54]/20 bg-[#1E2F4D]/75 px-3 py-2.5">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#A88B54] font-sans text-xs font-bold text-[#16233B]">
                                {getInitials(auth.user.name)}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-sans text-xs font-semibold text-[#F2EBDC]">
                                    {auth.user.name}
                                </p>
                                <p className="truncate font-sans text-[10px] text-[#A88B54]">
                                    Administrator
                                </p>
                            </div>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleLogout}
                        title="Logout"
                        className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-sm font-medium text-[#F2EBDC]/70 transition-all hover:bg-[#1E2F4D]/70 hover:text-[#F2EBDC]',
                            collapsed && 'justify-center px-0',
                        )}
                    >
                        <LogOutIcon className="size-4.5 shrink-0 text-[#A88B54]" />
                        {!collapsed && <span>Keluar</span>}
                    </button>
                </div>

                {/* Collapse toggle — floating on the right edge */}
                <button
                    type="button"
                    onClick={() => setCollapsed((v) => !v)}
                    className="absolute top-20 -right-3 flex size-6 items-center justify-center rounded-full border border-[#A88B54]/50 bg-[#1E2F4D] text-[#A88B54] shadow-md transition-colors hover:bg-[#16233B] hover:text-[#F2EBDC]"
                    aria-label={
                        collapsed ? 'Expand sidebar' : 'Collapse sidebar'
                    }
                >
                    {collapsed ? (
                        <ChevronRightIcon className="size-3.5" />
                    ) : (
                        <ChevronLeftIcon className="size-3.5" />
                    )}
                </button>
            </aside>

            {/* ── Main area ─────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-[#A88B54]/25 bg-[#F2EBDC]/95 px-5 backdrop-blur-md">
                    {/* Mobile / extra toggle */}
                    <button
                        type="button"
                        onClick={() => setCollapsed((v) => !v)}
                        aria-label="Toggle sidebar"
                        className="flex size-9 items-center justify-center rounded-xl text-[#16233B] transition-colors hover:bg-[#16233B]/5 md:hidden"
                    >
                        <MenuIcon className="size-5" />
                    </button>

                    {/* Left shortcut */}
                    <div className="flex flex-1 items-center">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#A88B54]/35 bg-[#FAF7F0] px-3.5 py-1.5 font-sans text-xs font-semibold text-[#16233B] transition-colors hover:border-[#A88B54] hover:bg-white"
                        >
                            <span>Lihat Website</span>
                            <ExternalLinkIcon className="size-3 text-[#A88B54]" />
                        </Link>
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-2">
                        {/* Date */}
                        <span className="hidden font-sans text-xs font-medium text-[#6E675D] md:block">
                            {new Date().toLocaleDateString('id-ID', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </span>

                        {/* Bell */}
                        <button
                            type="button"
                            aria-label="Notifikasi"
                            className="flex size-9 items-center justify-center rounded-xl text-[#6E675D] transition-colors hover:bg-[#16233B]/5 hover:text-[#16233B]"
                        >
                            <BellIcon className="size-4.5" />
                        </button>

                        {/* Settings */}
                        <Link
                            href="/settings/profile"
                            aria-label="Pengaturan Akun"
                            className="flex size-9 items-center justify-center rounded-xl text-[#6E675D] transition-colors hover:bg-[#16233B]/5 hover:text-[#16233B]"
                        >
                            <SettingsIcon className="size-4.5" />
                        </Link>

                        {/* Avatar */}
                        <div className="flex size-9 items-center justify-center rounded-xl border border-[#A88B54]/45 bg-[#16233B] font-sans text-xs font-bold text-[#F2EBDC] shadow-xs">
                            {auth.user ? getInitials(auth.user.name) : '?'}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-5">
                    <div className="min-h-full overflow-hidden rounded-3xl border border-[#A88B54]/25 bg-[#FAF7F0] shadow-[0_14px_38px_-14px_rgba(22,35,59,0.10)]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
