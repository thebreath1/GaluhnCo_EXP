import { Head, router, useForm } from '@inertiajs/react';
import {
    CalendarClockIcon,
    PencilIcon,
    PercentIcon,
    PlusIcon,
    SearchIcon,
    SparklesIcon,
    TagIcon,
    Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AdminPromotionController from '@/actions/App/Http/Controllers/Admin/PromotionController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils';

type ComputedStatus = 'active' | 'scheduled' | 'expired' | 'inactive';

interface PromotionEntry {
    id: number;
    name: string;
    description: string | null;
    badge_text: string | null;
    apply_mode: 'auto' | 'code';
    code: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    discount_label: string;
    max_discount_amount: number | null;
    min_order_amount: number | null;
    scope: 'all' | 'category' | 'products';
    target_category: string | null;
    product_ids: number[];
    product_names: string[];
    starts_at: string | null;
    ends_at: string | null;
    starts_at_label: string | null;
    ends_at_label: string | null;
    usage_limit: number | null;
    used_count: number;
    is_active: boolean;
    computed_status: ComputedStatus;
}

interface ProductOption {
    id: number;
    name: string;
    category: string;
    price_from: number;
    is_active: boolean;
}

interface PageProps {
    promotions: PromotionEntry[];
    products: ProductOption[];
    categories: string[];
}

interface PromotionFormData {
    name: string;
    description: string;
    badge_text: string;
    apply_mode: 'auto' | 'code';
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: string;
    max_discount_amount: string;
    min_order_amount: string;
    scope: 'all' | 'category' | 'products';
    target_category: string;
    product_ids: number[];
    starts_at: string;
    ends_at: string;
    usage_limit: string;
    is_active: boolean;
}

const STATUS_META: Record<
    ComputedStatus,
    { label: string; badgeClass: string; dotClass: string }
> = {
    active: {
        label: 'Berlangsung',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotClass: 'bg-emerald-500',
    },
    scheduled: {
        label: 'Terjadwal',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-500',
    },
    expired: {
        label: 'Berakhir',
        badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
        dotClass: 'bg-gray-400',
    },
    inactive: {
        label: 'Nonaktif',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-400',
    },
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function toLocalDateTimeInput(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toUtcIsoString(localDateTime: string): string {
    if (localDateTime.trim() === '') return '';
    const d = new Date(localDateTime);
    if (Number.isNaN(d.getTime())) return localDateTime;
    return d.toISOString();
}

function formatLocalDateTime(
    iso: string | null,
    fallback: string | null,
): string | null {
    if (!iso) return fallback;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function PromotionsIndex({
    promotions,
    products,
    categories,
}: PageProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | ComputedStatus>(
        'all',
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromotionEntry | null>(
        null,
    );
    const [deleteTarget, setDeleteTarget] = useState<PromotionEntry | null>(
        null,
    );
    const [productSearch, setProductSearch] = useState('');

    const {
        data,
        setData,
        transform,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<PromotionFormData>({
        name: '',
        description: '',
        badge_text: '',
        apply_mode: 'auto',
        code: '',
        discount_type: 'percentage',
        discount_value: '15',
        max_discount_amount: '',
        min_order_amount: '',
        scope: 'all',
        target_category: categories[0] ?? '',
        product_ids: [],
        starts_at: '',
        ends_at: '',
        usage_limit: '',
        is_active: true,
    });

    const filtered = promotions.filter((promo) => {
        const matchesStatus =
            statusFilter === 'all' || promo.computed_status === statusFilter;
        const q = search.trim().toLowerCase();
        const matchesSearch =
            q === '' ||
            promo.name.toLowerCase().includes(q) ||
            (promo.code ?? '').toLowerCase().includes(q) ||
            (promo.description ?? '').toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.category.toLowerCase().includes(productSearch.toLowerCase()),
    );

    const openCreate = () => {
        clearErrors();
        reset();
        setEditingPromo(null);
        setProductSearch('');
        setModalOpen(true);
    };

    const openEdit = (promo: PromotionEntry) => {
        clearErrors();
        setEditingPromo(promo);
        setProductSearch('');
        setData({
            name: promo.name,
            description: promo.description ?? '',
            badge_text: promo.badge_text ?? '',
            apply_mode: promo.apply_mode,
            code: promo.code ?? '',
            discount_type: promo.discount_type,
            discount_value: promo.discount_value.toString(),
            max_discount_amount: promo.max_discount_amount?.toString() ?? '',
            min_order_amount: promo.min_order_amount?.toString() ?? '',
            scope: promo.scope,
            target_category: promo.target_category ?? categories[0] ?? '',
            product_ids: promo.product_ids,
            starts_at: toLocalDateTimeInput(promo.starts_at),
            ends_at: toLocalDateTimeInput(promo.ends_at),
            usage_limit: promo.usage_limit?.toString() ?? '',
            is_active: promo.is_active,
        });
        setModalOpen(true);
    };

    const generateRandomCode = () => {
        const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        setData('code', `GALUH${data.discount_value || '15'}${suffix}`);
    };

    const toggleProductId = (id: number) => {
        setData(
            'product_ids',
            data.product_ids.includes(id)
                ? data.product_ids.filter((item) => item !== id)
                : [...data.product_ids, id],
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((formData) => ({
            ...formData,
            starts_at: toUtcIsoString(formData.starts_at),
            ends_at: toUtcIsoString(formData.ends_at),
        }));

        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                setModalOpen(false);
                reset();
                toast.success(
                    editingPromo
                        ? 'Promo / diskon diperbarui.'
                        : 'Promo / diskon ditambahkan.',
                );
            },
        };

        if (editingPromo) {
            put(AdminPromotionController.update(editingPromo.id).url, opts);
        } else {
            post(AdminPromotionController.store().url, opts);
        }
    };

    const handleToggle = (promo: PromotionEntry) => {
        router.patch(
            AdminPromotionController.toggle(promo.id).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        promo.is_active
                            ? 'Promo dinonaktifkan.'
                            : 'Promo diaktifkan.',
                    );
                },
            },
        );
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(AdminPromotionController.destroy(deleteTarget.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                toast.success('Promo dihapus.');
            },
        });
    };

    const activeCount = promotions.filter(
        (p) => p.computed_status === 'active',
    ).length;
    const scheduledCount = promotions.filter(
        (p) => p.computed_status === 'scheduled',
    ).length;
    const endedOrInactiveCount = promotions.filter(
        (p) =>
            p.computed_status === 'expired' || p.computed_status === 'inactive',
    ).length;

    return (
        <>
            <Head title="Manajemen Diskon & Promo" />

            <div className="space-y-6 p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#A88B54]/20 pb-5">
                    <div>
                        <h1 className="font-serif text-2xl font-normal text-[#16233B] sm:text-3xl">
                            Diskon &amp; Promo
                        </h1>
                        <p className="mt-0.5 font-sans text-xs text-[#6E675D] sm:text-sm">
                            Atur persentase potongan, kode voucher, target
                            produk, serta jadwal mulai dan berakhirnya promo.
                        </p>
                    </div>
                    <Button
                        onClick={openCreate}
                        className="gap-2 rounded-full bg-[#16233B] px-5 text-[#F2EBDC] hover:bg-[#1F304F]"
                    >
                        <PlusIcon className="size-4 text-[#A88B54]" />
                        Buat Promo Baru
                    </Button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <div className="rounded-2xl border border-[#A88B54]/40 bg-[#16233B] px-5 py-4 text-[#F2EBDC] shadow-xs">
                        <p className="font-sans text-xs font-semibold tracking-wider text-[#F2EBDC]/80 uppercase">
                            Total Promo
                        </p>
                        <p className="mt-1 font-serif text-3xl font-semibold">
                            {promotions.length}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[#A88B54]/35 bg-[#1E2F4D] px-5 py-4 text-[#F2EBDC] shadow-xs">
                        <p className="font-sans text-xs font-semibold tracking-wider text-[#F2EBDC]/80 uppercase">
                            Berlangsung
                        </p>
                        <p className="mt-1 font-serif text-3xl font-semibold text-[#A88B54]">
                            {activeCount}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[#A88B54]/25 bg-white px-5 py-4 shadow-xs">
                        <p className="font-sans text-xs font-semibold tracking-wider text-[#6E675D] uppercase">
                            Terjadwal
                        </p>
                        <p className="mt-1 font-serif text-3xl font-semibold text-[#16233B]">
                            {scheduledCount}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[#A88B54]/25 bg-white px-5 py-4 shadow-xs">
                        <p className="font-sans text-xs font-semibold tracking-wider text-[#6E675D] uppercase">
                            Berakhir / Nonaktif
                        </p>
                        <p className="mt-1 font-serif text-3xl font-semibold text-[#16233B]">
                            {endedOrInactiveCount}
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex max-w-xs flex-1 items-center gap-2 rounded-xl border border-[#A88B54]/30 bg-white px-3.5 py-2 shadow-xs">
                        <SearchIcon className="size-4 shrink-0 text-[#A88B54]" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama promo atau kode..."
                            className="flex-1 bg-transparent font-sans text-sm text-[#16233B] outline-none placeholder:text-[#6E675D]/70"
                        />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {(
                            [
                                ['all', 'Semua'],
                                ['active', 'Berlangsung'],
                                ['scheduled', 'Terjadwal'],
                                ['expired', 'Berakhir'],
                                ['inactive', 'Nonaktif'],
                            ] as const
                        ).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setStatusFilter(key)}
                                className={cn(
                                    'rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold transition-colors',
                                    statusFilter === key
                                        ? 'bg-[#16233B] text-[#F2EBDC]'
                                        : 'border border-[#A88B54]/30 bg-white text-[#16233B] hover:bg-[#F2EBDC]',
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-[#A88B54]/25 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#A88B54]/20 bg-[#F2EBDC]/60">
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Nama Promo
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Mode &amp; Diskon
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Cakupan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Rentang Waktu
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Kuota
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#A88B54]/15">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-12 text-center font-sans text-sm text-[#6E675D]"
                                        >
                                            {search || statusFilter !== 'all'
                                                ? 'Tidak ada promo yang cocok dengan filter.'
                                                : 'Belum ada promo atau diskon. Klik "Buat Promo Baru" untuk memulai.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((promo) => {
                                        const meta =
                                            STATUS_META[promo.computed_status];
                                        return (
                                            <tr
                                                key={promo.id}
                                                className="transition-colors hover:bg-[#FAF7F0]"
                                            >
                                                <td className="px-4 py-3.5">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-semibold text-[#16233B]">
                                                            {promo.name}
                                                        </p>
                                                        {promo.badge_text && (
                                                            <span className="rounded bg-[#F2EBDC] px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#16233B] uppercase">
                                                                {
                                                                    promo.badge_text
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    {promo.description && (
                                                        <p className="mt-0.5 line-clamp-1 text-xs text-[#6E675D]">
                                                            {promo.description}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3.5">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#16233B] px-2.5 py-0.5 text-xs font-bold text-[#A88B54]">
                                                            <PercentIcon className="size-3" />
                                                            {
                                                                promo.discount_label
                                                            }
                                                        </span>
                                                        {promo.apply_mode ===
                                                        'code' ? (
                                                            <span className="rounded border border-[#A88B54]/40 bg-[#FAF7F0] px-2 py-0.5 font-mono text-xs font-semibold text-[#16233B]">
                                                                {promo.code}
                                                            </span>
                                                        ) : (
                                                            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                                                                Otomatis
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 space-x-2 text-[11px] text-[#6E675D]">
                                                        {promo.max_discount_amount && (
                                                            <span>
                                                                Maks.{' '}
                                                                {formatRupiah(
                                                                    promo.max_discount_amount,
                                                                )}
                                                            </span>
                                                        )}
                                                        {promo.min_order_amount &&
                                                            promo.min_order_amount >
                                                                0 && (
                                                                <span>
                                                                    Min.{' '}
                                                                    {formatRupiah(
                                                                        promo.min_order_amount,
                                                                    )}
                                                                </span>
                                                            )}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3.5 text-xs text-[#16233B]">
                                                    {promo.scope === 'all' && (
                                                        <span>
                                                            Semua Produk
                                                        </span>
                                                    )}
                                                    {promo.scope ===
                                                        'category' && (
                                                        <span>
                                                            Kategori:{' '}
                                                            <strong>
                                                                {
                                                                    promo.target_category
                                                                }
                                                            </strong>
                                                        </span>
                                                    )}
                                                    {promo.scope ===
                                                        'products' && (
                                                        <span>
                                                            <strong>
                                                                {
                                                                    promo
                                                                        .product_ids
                                                                        .length
                                                                }
                                                            </strong>{' '}
                                                            Produk Pilihan
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3.5 text-xs text-[#6E675D]">
                                                    <div className="flex items-start gap-1.5">
                                                        <CalendarClockIcon className="mt-0.5 size-3.5 shrink-0 text-[#A88B54]" />
                                                        <div>
                                                            <p>
                                                                Mulai:{' '}
                                                                <span className="font-medium text-[#16233B]">
                                                                    {formatLocalDateTime(
                                                                        promo.starts_at,
                                                                        promo.starts_at_label,
                                                                    ) ??
                                                                        'Langsung'}
                                                                </span>
                                                            </p>
                                                            <p>
                                                                Akhir:{' '}
                                                                <span className="font-medium text-[#16233B]">
                                                                    {formatLocalDateTime(
                                                                        promo.ends_at,
                                                                        promo.ends_at_label,
                                                                    ) ??
                                                                        'Tanpa batas'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3.5 text-center font-mono text-xs text-[#16233B]">
                                                    {promo.used_count} /{' '}
                                                    {promo.usage_limit ?? '∞'}
                                                </td>

                                                <td className="px-4 py-3.5 text-center">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span
                                                            className={cn(
                                                                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                                                                meta.badgeClass,
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    'size-1.5 rounded-full',
                                                                    meta.dotClass,
                                                                )}
                                                            />
                                                            {meta.label}
                                                        </span>
                                                        <Switch
                                                            size="sm"
                                                            checked={
                                                                promo.is_active
                                                            }
                                                            onCheckedChange={() =>
                                                                handleToggle(
                                                                    promo,
                                                                )
                                                            }
                                                            aria-label={`Aktifkan/nonaktifkan ${promo.name}`}
                                                        />
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEdit(promo)
                                                            }
                                                            className="rounded-lg p-1.5 text-[#6E675D] transition-colors hover:bg-[#F2EBDC] hover:text-[#16233B]"
                                                        >
                                                            <PencilIcon className="size-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeleteTarget(
                                                                    promo,
                                                                )
                                                            }
                                                            className="rounded-lg p-1.5 text-[#6E675D] transition-colors hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <Trash2Icon className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Buat / Edit Promo */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[#A88B54]/40 bg-[#FAF7F0] text-[#16233B]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 font-serif text-2xl font-normal text-[#16233B]">
                            <TagIcon className="size-5 text-[#A88B54]" />
                            {editingPromo
                                ? 'Edit Diskon & Promo'
                                : 'Buat Diskon & Promo Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        id="promo-form"
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="grid gap-1.5 sm:col-span-2">
                                <Label htmlFor="promo_name">Nama Promo</Label>
                                <Input
                                    id="promo_name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="cth. Promo Ramadan Early Bird"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="badge_text">
                                    Label Badge (Opsional)
                                </Label>
                                <Input
                                    id="badge_text"
                                    value={data.badge_text}
                                    onChange={(e) =>
                                        setData('badge_text', e.target.value)
                                    }
                                    placeholder="FLASH SALE"
                                />
                                {errors.badge_text && (
                                    <p className="text-xs text-red-500">
                                        {errors.badge_text}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="promo_description">
                                Deskripsi / Ketentuan (Opsional)
                            </Label>
                            <Textarea
                                id="promo_description"
                                rows={2}
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Diskon spesial untuk pemesanan hampers sebelum periode puncak..."
                            />
                            {errors.description && (
                                <p className="text-xs text-red-500">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Mode Penerapan */}
                        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#A88B54]/30 bg-white p-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="apply_mode">
                                    Cara Penerapan
                                </Label>
                                <select
                                    id="apply_mode"
                                    value={data.apply_mode}
                                    onChange={(e) =>
                                        setData(
                                            'apply_mode',
                                            e.target.value as 'auto' | 'code',
                                        )
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                                >
                                    <option value="auto">
                                        Otomatis (Harga Coret di Katalog)
                                    </option>
                                    <option value="code">
                                        Kode Voucher (Input di Keranjang /
                                        Checkout)
                                    </option>
                                </select>
                            </div>

                            {data.apply_mode === 'code' && (
                                <div className="grid gap-1.5">
                                    <Label htmlFor="promo_code">
                                        Kode Voucher
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="promo_code"
                                            value={data.code}
                                            onChange={(e) =>
                                                setData(
                                                    'code',
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                            placeholder="LEBARAN20"
                                            className="font-mono uppercase"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={generateRandomCode}
                                            className="shrink-0 gap-1"
                                        >
                                            <SparklesIcon className="size-3.5 text-[#A88B54]" />
                                            Acak
                                        </Button>
                                    </div>
                                    {errors.code && (
                                        <p className="text-xs text-red-500">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Nilai Diskon & Batasan */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="discount_type">
                                    Tipe Diskon
                                </Label>
                                <select
                                    id="discount_type"
                                    value={data.discount_type}
                                    onChange={(e) =>
                                        setData(
                                            'discount_type',
                                            e.target.value as
                                                | 'percentage'
                                                | 'fixed',
                                        )
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                                >
                                    <option value="percentage">
                                        Persentase (%)
                                    </option>
                                    <option value="fixed">
                                        Nominal Tetap (Rp)
                                    </option>
                                </select>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="discount_value">
                                    {data.discount_type === 'percentage'
                                        ? 'Besar Diskon (%)'
                                        : 'Potongan Nominal (Rp)'}
                                </Label>
                                <Input
                                    id="discount_value"
                                    type="number"
                                    min={1}
                                    max={
                                        data.discount_type === 'percentage'
                                            ? 99
                                            : undefined
                                    }
                                    value={data.discount_value}
                                    onChange={(e) =>
                                        setData(
                                            'discount_value',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={
                                        data.discount_type === 'percentage'
                                            ? '15'
                                            : '50000'
                                    }
                                />
                                {errors.discount_value && (
                                    <p className="text-xs text-red-500">
                                        {errors.discount_value}
                                    </p>
                                )}
                            </div>

                            {data.discount_type === 'percentage' && (
                                <div className="grid gap-1.5">
                                    <Label htmlFor="max_discount_amount">
                                        Maksimal Potongan Rp (Opsional)
                                    </Label>
                                    <Input
                                        id="max_discount_amount"
                                        type="number"
                                        min={1000}
                                        value={data.max_discount_amount}
                                        onChange={(e) =>
                                            setData(
                                                'max_discount_amount',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="cth. 200000"
                                    />
                                    {errors.max_discount_amount && (
                                        <p className="text-xs text-red-500">
                                            {errors.max_discount_amount}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-1.5">
                                <Label htmlFor="min_order_amount">
                                    Minimal Belanja Rp (Opsional)
                                </Label>
                                <Input
                                    id="min_order_amount"
                                    type="number"
                                    min={0}
                                    value={data.min_order_amount}
                                    onChange={(e) =>
                                        setData(
                                            'min_order_amount',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Kosongkan jika tanpa minimal"
                                />
                                {errors.min_order_amount && (
                                    <p className="text-xs text-red-500">
                                        {errors.min_order_amount}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Rentang Waktu & Kuota */}
                        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#A88B54]/30 bg-white p-4 sm:grid-cols-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="starts_at">
                                    Waktu Mulai (Opsional)
                                </Label>
                                <Input
                                    id="starts_at"
                                    type="datetime-local"
                                    value={data.starts_at}
                                    onChange={(e) =>
                                        setData('starts_at', e.target.value)
                                    }
                                />
                                {errors.starts_at && (
                                    <p className="text-xs text-red-500">
                                        {errors.starts_at}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="ends_at">
                                    Waktu Berakhir (Opsional)
                                </Label>
                                <Input
                                    id="ends_at"
                                    type="datetime-local"
                                    value={data.ends_at}
                                    onChange={(e) =>
                                        setData('ends_at', e.target.value)
                                    }
                                />
                                {errors.ends_at && (
                                    <p className="text-xs text-red-500">
                                        {errors.ends_at}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="usage_limit">
                                    Kuota Pemakaian (Opsional)
                                </Label>
                                <Input
                                    id="usage_limit"
                                    type="number"
                                    min={1}
                                    value={data.usage_limit}
                                    onChange={(e) =>
                                        setData('usage_limit', e.target.value)
                                    }
                                    placeholder="Tanpa batas"
                                />
                                {errors.usage_limit && (
                                    <p className="text-xs text-red-500">
                                        {errors.usage_limit}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Cakupan Produk */}
                        <div className="space-y-3 rounded-2xl border border-[#A88B54]/30 bg-white p-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="promo_scope">
                                        Target Produk
                                    </Label>
                                    <select
                                        id="promo_scope"
                                        value={data.scope}
                                        onChange={(e) =>
                                            setData(
                                                'scope',
                                                e.target.value as
                                                    | 'all'
                                                    | 'category'
                                                    | 'products',
                                            )
                                        }
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                                    >
                                        <option value="all">
                                            Semua Produk
                                        </option>
                                        <option value="category">
                                            Kategori / Event Tertentu
                                        </option>
                                        <option value="products">
                                            Produk Pilihan
                                        </option>
                                    </select>
                                </div>

                                {data.scope === 'category' && (
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="target_category">
                                            Pilih / Isi Kategori
                                        </Label>
                                        <Input
                                            id="target_category"
                                            list="promo-categories"
                                            value={data.target_category}
                                            onChange={(e) =>
                                                setData(
                                                    'target_category',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="cth. Lebaran atau Corporate"
                                        />
                                        <datalist id="promo-categories">
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat} />
                                            ))}
                                        </datalist>
                                        {errors.target_category && (
                                            <p className="text-xs text-red-500">
                                                {errors.target_category}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {data.scope === 'products' && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <Label>
                                            Pilih Produk (
                                            {data.product_ids.length} dipilih)
                                        </Label>
                                        <Input
                                            value={productSearch}
                                            onChange={(e) =>
                                                setProductSearch(e.target.value)
                                            }
                                            placeholder="Filter produk..."
                                            className="h-8 max-w-48 text-xs"
                                        />
                                    </div>
                                    <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-xl border border-[#A88B54]/20 bg-[#FAF7F0] p-2.5">
                                        {filteredProducts.map((product) => (
                                            <label
                                                key={product.id}
                                                className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-white"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={data.product_ids.includes(
                                                            product.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleProductId(
                                                                product.id,
                                                            )
                                                        }
                                                    />
                                                    <span className="font-medium text-[#16233B]">
                                                        {product.name}
                                                    </span>
                                                    <span className="text-[11px] text-[#6E675D]">
                                                        ({product.category})
                                                    </span>
                                                </span>
                                                <span className="font-serif font-semibold text-[#16233B]">
                                                    {formatRupiah(
                                                        product.price_from,
                                                    )}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.product_ids && (
                                        <p className="text-xs text-red-500">
                                            {errors.product_ids}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="promo_is_active"
                                checked={data.is_active}
                                onCheckedChange={(c) =>
                                    setData('is_active', Boolean(c))
                                }
                            />
                            <Label htmlFor="promo_is_active">
                                Aktifkan promo ini
                            </Label>
                        </div>
                    </form>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="promo-form"
                            disabled={processing}
                            className="rounded-full bg-[#16233B] text-[#F2EBDC] hover:bg-[#1F304F]"
                        >
                            {processing
                                ? 'Menyimpan...'
                                : editingPromo
                                  ? 'Simpan Perubahan'
                                  : 'Simpan Promo'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Promo?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500">
                        Promo{' '}
                        <span className="font-medium text-gray-900">
                            {deleteTarget?.name}
                        </span>{' '}
                        akan dihapus permanen.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

PromotionsIndex.layout = undefined;
