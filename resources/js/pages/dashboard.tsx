import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, SparklesIcon } from 'lucide-react';
import * as AdminInquiryController from '@/actions/App/Http/Controllers/Admin/InquiryController';
import * as AdminProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
import { Badge } from '@/components/ui/badge';
import type { Auth } from '@/types';
import { cn } from '@/utils';

type Stats = {
    total_products: number;
    active_products: number;
    total_inquiries: number;
    new_inquiries: number;
};

type RecentInquiry = {
    id: number;
    name: string;
    company: string;
    estimated_quantity: number;
    needed_date: string;
    status: 'new' | 'contacted' | 'closed';
};

type PageProps = {
    stats: Stats;
    recent_inquiries: RecentInquiry[];
};

const statusConfig: Record<
    RecentInquiry['status'],
    { label: string; color: 'primary' | 'warning' | 'gray' }
> = {
    new: { label: 'Baru', color: 'primary' },
    contacted: { label: 'Dihubungi', color: 'warning' },
    closed: { label: 'Selesai', color: 'gray' },
};

export default function Dashboard({ stats, recent_inquiries }: PageProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const firstName = auth.user?.name.split(' ')[0] ?? 'Admin';

    return (
        <>
            <Head title="Dashboard — Admin Studio" />

            <div className="space-y-6 p-6 sm:p-8">
                {/* Greeting */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#A88B54]/20 pb-5 sm:flex-row sm:items-end">
                    <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16233B] px-3 py-1 font-sans text-[11px] font-semibold tracking-wider text-[#F2EBDC] uppercase">
                            <SparklesIcon className="size-3 text-[#A88B54]" />
                            Portal Manajemen
                        </span>
                        <h1 className="mt-2.5 font-serif text-3xl font-normal tracking-normal text-[#16233B]">
                            Halo, {firstName}
                        </h1>
                        <p className="mt-0.5 font-sans text-sm text-[#6E675D]">
                            Ringkasan performa katalog dan inquiry korporat
                            Galuh &amp; Co.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full border border-[#A88B54]/30 bg-white px-4 py-1.5 font-sans text-xs font-semibold text-[#16233B] shadow-xs">
                            Bulan Ini
                        </span>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard
                        label="Total Produk"
                        value={stats.total_products}
                        variant="navy"
                        href={AdminProductController.index().url}
                    />
                    <StatCard
                        label="Produk Aktif"
                        value={stats.active_products}
                        variant="ivory"
                        href={AdminProductController.index().url}
                    />
                    <StatCard
                        label="Total Inquiry"
                        value={stats.total_inquiries}
                        variant="ivory"
                        href={AdminInquiryController.index().url}
                    />
                    <StatCard
                        label="Inquiry Baru"
                        value={stats.new_inquiries}
                        variant={stats.new_inquiries > 0 ? 'softNavy' : 'ivory'}
                        href={AdminInquiryController.index().url}
                    />
                </div>

                {/* Bottom section: quick actions + recent table */}
                <div className="grid gap-5 lg:grid-cols-3">
                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <QuickActionCard
                            value={stats.total_products}
                            label="produk terdaftar"
                            note="Kelola katalog hampers"
                            href={AdminProductController.index().url}
                        />
                        <QuickActionCard
                            value={stats.new_inquiries}
                            label="inquiry menunggu"
                            note={`${stats.new_inquiries} belum ditindaklanjuti`}
                            href={AdminInquiryController.index().url}
                            highlight={stats.new_inquiries > 0}
                        />
                    </div>

                    {/* Recent inquiries */}
                    <div className="overflow-hidden rounded-2xl border border-[#A88B54]/25 bg-white shadow-[0_12px_28px_-14px_rgba(22,35,59,0.10)] lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-[#A88B54]/20 px-5 py-4">
                            <p className="font-serif text-lg font-semibold text-[#16233B]">
                                Inquiry Terbaru
                            </p>
                            <Link
                                href={AdminInquiryController.index().url}
                                className="font-sans text-xs font-semibold text-[#16233B] underline decoration-[#A88B54] underline-offset-4 transition-colors hover:text-[#1F304F]"
                            >
                                Lihat semua →
                            </Link>
                        </div>
                        <div className="divide-y divide-[#A88B54]/15">
                            {recent_inquiries.length === 0 ? (
                                <p className="py-10 text-center font-sans text-sm text-[#6E675D]">
                                    Belum ada inquiry masuk.
                                </p>
                            ) : (
                                recent_inquiries.map((inq) => (
                                    <div
                                        key={inq.id}
                                        className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#FAF7F0]"
                                    >
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#16233B] font-serif text-sm font-semibold text-[#A88B54]">
                                            {inq.company
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-sans text-sm font-semibold text-[#16233B]">
                                                {inq.name}
                                            </p>
                                            <p className="truncate font-sans text-xs text-[#6E675D]">
                                                {inq.company}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="mb-1 font-sans text-xs text-[#6E675D]">
                                                {inq.needed_date}
                                            </p>
                                            <Badge
                                                variant="light"
                                                color={
                                                    statusConfig[inq.status]
                                                        .color
                                                }
                                                size="sm"
                                            >
                                                {statusConfig[inq.status].label}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    label,
    value,
    variant,
    href,
}: {
    label: string;
    value: number;
    variant: 'navy' | 'softNavy' | 'ivory';
    href: string;
}) {
    const styleClass =
        variant === 'navy'
            ? 'border-[#A88B54]/45 bg-[#16233B] text-[#F2EBDC]'
            : variant === 'softNavy'
              ? 'border-[#A88B54]/55 bg-[#1E2F4D] text-[#F2EBDC]'
              : 'border-[#A88B54]/25 bg-white text-[#16233B] hover:border-[#A88B54]/60';

    const labelClass =
        variant === 'ivory' ? 'text-[#6E675D]' : 'text-[#F2EBDC]/80';
    const iconClass = variant === 'ivory' ? 'text-[#A88B54]' : 'text-[#A88B54]';

    return (
        <Link
            href={href}
            className={cn(
                'relative flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md',
                styleClass,
            )}
        >
            <div className="flex items-start justify-between">
                <p
                    className={cn(
                        'font-sans text-xs font-semibold tracking-wide uppercase',
                        labelClass,
                    )}
                >
                    {label}
                </p>
                <ArrowUpRight className={cn('size-4', iconClass)} />
            </div>
            <p className="mt-3 font-serif text-3xl font-semibold">
                {value.toLocaleString('id-ID')}
            </p>
        </Link>
    );
}

function QuickActionCard({
    value,
    label,
    note,
    href,
    highlight = false,
}: {
    value: number;
    label: string;
    note: string;
    href: string;
    highlight?: boolean;
}) {
    return (
        <Link
            href={href}
            className={cn(
                'flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md',
                highlight
                    ? 'border-[#A88B54]/55 bg-[#16233B] text-[#F2EBDC]'
                    : 'border-[#A88B54]/25 bg-white text-[#16233B] hover:border-[#A88B54]/60',
            )}
        >
            <div
                className={cn(
                    'font-serif text-3xl font-semibold',
                    highlight ? 'text-[#A88B54]' : 'text-[#16233B]',
                )}
            >
                {value}
            </div>
            <div>
                <p
                    className={cn(
                        'font-sans text-sm font-semibold',
                        highlight ? 'text-[#F2EBDC]' : 'text-[#16233B]',
                    )}
                >
                    {label}
                </p>
                <p
                    className={cn(
                        'mt-0.5 font-sans text-xs',
                        highlight ? 'text-[#F2EBDC]/75' : 'text-[#6E675D]',
                    )}
                >
                    {note}
                </p>
            </div>
        </Link>
    );
}

Dashboard.layout = undefined;
