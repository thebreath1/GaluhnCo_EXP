import { Head, router } from '@inertiajs/react';
import {
    ArrowRightIcon,
    Building2Icon,
    CheckCircle2Icon,
    ExternalLinkIcon,
    EyeIcon,
    PackageCheckIcon,
    PackageIcon,
    QrCodeIcon,
    SearchIcon,
    ShieldCheckIcon,
    TruckIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AdminOrderController from '@/actions/App/Http/Controllers/Admin/OrderController';
import type { StoredParcelItem } from '@/components/b2b/parcel-catalog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils';

interface AdminOrderItem {
    id: number;
    product_name: string;
    is_custom_b2b: boolean;
    custom_config: {
        box_color?: string;
        ribbon_color?: string;
        package_tier?: string;
        logo_path?: string | null;
        items?: StoredParcelItem[];
    } | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface AdminOrder {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    customer_role: string;
    company_name: string | null;
    total_amount: number;
    status: string;
    tracking_number: string | null;
    greeting_note: string | null;
    address_snapshot: {
        recipient_name?: string;
        recipient_phone?: string;
        address_line?: string;
        city?: string;
        postal_code?: string;
    } | null;
    payment_proof_url: string | null;
    b2b_video_url: string | null;
    b2b_video_token: string | null;
    greeting_url: string | null;
    verified_at: string | null;
    packed_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    items_count: number;
    items: AdminOrderItem[];
    created_at: string | null;
}

const ORDER_STAGES = [
    {
        key: 'verification',
        label: 'Verifikasi',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: ShieldCheckIcon,
    },
    {
        key: 'packing',
        label: 'Packing',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: PackageIcon,
    },
    {
        key: 'shipping',
        label: 'Pengiriman',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        icon: TruckIcon,
    },
    {
        key: 'delivered',
        label: 'Sampai',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: PackageCheckIcon,
    },
] as const;

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDateTime(iso: string | null): string {
    if (!iso) {
        return '—';
    }
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getStageMeta(status: string) {
    return ORDER_STAGES.find((s) => s.key === status) ?? ORDER_STAGES[0];
}

export default function AdminOrders({
    orders = [],
}: {
    orders?: AdminOrder[];
}) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
    const [editStatus, setEditStatus] = useState('verification');
    const [editTracking, setEditTracking] = useState('');
    const [saving, setSaving] = useState(false);

    const openManageModal = (order: AdminOrder) => {
        setSelectedOrder(order);
        setEditStatus(order.status);
        setEditTracking(order.tracking_number ?? '');
    };

    const filteredOrders = orders.filter((order) => {
        const matchesStatus =
            statusFilter === 'all' || order.status === statusFilter;
        const q = search.trim().toLowerCase();
        const matchesSearch =
            q === '' ||
            order.order_number.toLowerCase().includes(q) ||
            order.customer_name.toLowerCase().includes(q) ||
            (order.company_name ?? '').toLowerCase().includes(q) ||
            (order.tracking_number ?? '').toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    const handleSubmitStatus = (
        orderId: number,
        nextStatus: string,
        nextTracking: string,
    ) => {
        setSaving(true);
        router.patch(
            AdminOrderController.updateStatus(orderId).url,
            {
                status: nextStatus,
                tracking_number: nextTracking.trim() || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Status pesanan berhasil diperbarui.');
                    setSelectedOrder(null);
                },
                onError: () => {
                    toast.error('Gagal memperbarui status pesanan.');
                },
                onFinish: () => setSaving(false),
            },
        );
    };

    const currentStageIndex = selectedOrder
        ? ORDER_STAGES.findIndex((s) => s.key === selectedOrder.status)
        : 0;
    const nextStage =
        selectedOrder &&
        currentStageIndex >= 0 &&
        currentStageIndex < ORDER_STAGES.length - 1
            ? ORDER_STAGES[currentStageIndex + 1]
            : null;

    return (
        <>
            <Head title="Manajemen Pesanan" />

            <div className="space-y-6 p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-2 border-b border-[#A88B54]/20 pb-5 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="font-serif text-2xl font-normal text-[#16233B] sm:text-3xl">
                            Manajemen Pesanan &amp; Tracking
                        </h1>
                        <p className="mt-0.5 font-sans text-xs text-[#6E675D] sm:text-sm">
                            Kelola verifikasi pembayaran, pengemasan, nomor
                            resi, hingga pesanan tiba.
                        </p>
                    </div>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div className="rounded-2xl border border-[#A88B54]/40 bg-[#16233B] px-4 py-3.5 text-[#F2EBDC] shadow-xs">
                        <p className="font-sans text-xs font-semibold tracking-wide text-[#F2EBDC]/80 uppercase">
                            Total Pesanan
                        </p>
                        <p className="mt-1 font-serif text-2xl font-semibold">
                            {orders.length}
                        </p>
                    </div>
                    {ORDER_STAGES.map((stage) => (
                        <div
                            key={stage.key}
                            className="rounded-2xl border border-[#A88B54]/25 bg-white px-4 py-3.5 shadow-xs"
                        >
                            <p className="font-sans text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                {stage.label}
                            </p>
                            <p className="mt-1 font-serif text-2xl font-semibold text-[#16233B]">
                                {
                                    orders.filter((o) => o.status === stage.key)
                                        .length
                                }
                            </p>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex max-w-sm flex-1 items-center gap-2 rounded-xl border border-[#A88B54]/30 bg-white px-3.5 py-2 shadow-xs">
                        <SearchIcon className="size-4 shrink-0 text-[#A88B54]" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari no. invoice, nama, perusahaan, resi..."
                            className="flex-1 bg-transparent font-sans text-sm text-[#16233B] outline-none placeholder:text-[#6E675D]/70"
                        />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={cn(
                                'rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold transition-colors',
                                statusFilter === 'all'
                                    ? 'bg-[#16233B] text-[#F2EBDC]'
                                    : 'border border-[#A88B54]/30 bg-white text-[#16233B] hover:bg-[#F2EBDC]',
                            )}
                        >
                            Semua
                        </button>
                        {ORDER_STAGES.map((stage) => (
                            <button
                                key={stage.key}
                                type="button"
                                onClick={() => setStatusFilter(stage.key)}
                                className={cn(
                                    'rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold transition-colors',
                                    statusFilter === stage.key
                                        ? 'bg-[#16233B] text-[#F2EBDC]'
                                        : 'border border-[#A88B54]/30 bg-white text-[#16233B] hover:bg-[#F2EBDC]',
                                )}
                            >
                                {stage.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                <div className="overflow-hidden rounded-2xl border border-[#A88B54]/25 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#A88B54]/20 bg-[#F2EBDC]/60">
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Invoice
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Pelanggan
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Item
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Tahap
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Resi
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#A88B54]/15">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-12 text-center font-sans text-sm text-[#6E675D]"
                                        >
                                            Belum ada pesanan yang sesuai.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const stage = getStageMeta(
                                            order.status,
                                        );
                                        return (
                                            <tr
                                                key={order.id}
                                                className="transition-colors hover:bg-[#FAF7F0]"
                                            >
                                                <td className="px-4 py-3.5">
                                                    <p className="font-mono text-xs font-semibold text-gray-900">
                                                        {order.order_number}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] text-gray-400">
                                                        {formatDateTime(
                                                            order.created_at,
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-medium text-gray-900">
                                                            {
                                                                order.customer_name
                                                            }
                                                        </span>
                                                        {order.customer_role ===
                                                            'b2b' && (
                                                            <span className="inline-flex items-center gap-0.5 rounded bg-[#16233B] px-1.5 py-0.5 text-[10px] font-semibold text-[#F2EBDC]">
                                                                <Building2Icon className="size-2.5 text-[#A88B54]" />
                                                                B2B
                                                            </span>
                                                        )}
                                                    </div>
                                                    {order.company_name && (
                                                        <p className="text-xs text-gray-500">
                                                            {order.company_name}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-center text-gray-600">
                                                    {order.items_count}
                                                </td>
                                                <td className="px-4 py-3.5 text-right font-semibold text-gray-900">
                                                    {formatRupiah(
                                                        order.total_amount,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                                                            stage.badgeClass,
                                                        )}
                                                    >
                                                        {stage.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 font-mono text-xs text-gray-600">
                                                    {order.tracking_number ??
                                                        '—'}
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openManageModal(
                                                                order,
                                                            )
                                                        }
                                                        className="gap-1.5 rounded-lg"
                                                    >
                                                        <EyeIcon className="size-3.5" />
                                                        Kelola
                                                    </Button>
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

            {/* Order Detail & 4-Stage Update Modal */}
            <Dialog
                open={selectedOrder !== null}
                onOpenChange={(open) => !open && setSelectedOrder(null)}
            >
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    {selectedOrder && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex flex-wrap items-center gap-2 text-lg">
                                    <span>
                                        Detail Pesanan{' '}
                                        {selectedOrder.order_number}
                                    </span>
                                    {selectedOrder.customer_role === 'b2b' && (
                                        <span className="rounded-full bg-[#16233B] px-2.5 py-0.5 text-[10px] font-semibold text-[#F2EBDC]">
                                            Corporate B2B
                                        </span>
                                    )}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-5 text-sm">
                                {/* Visual 4-Stage Stepper */}
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                    <div className="grid grid-cols-4 gap-2">
                                        {ORDER_STAGES.map((stage, idx) => {
                                            const activeIdx =
                                                ORDER_STAGES.findIndex(
                                                    (s) =>
                                                        s.key ===
                                                        selectedOrder.status,
                                                );
                                            const done = idx <= activeIdx;
                                            const StageIcon = stage.icon;
                                            return (
                                                <div
                                                    key={stage.key}
                                                    className={cn(
                                                        'flex flex-col items-center rounded-xl border p-2.5 text-center',
                                                        done
                                                            ? 'border-[#16233B] bg-[#16233B] text-[#F2EBDC]'
                                                            : 'border-gray-200 bg-white text-gray-400',
                                                    )}
                                                >
                                                    <StageIcon
                                                        className={cn(
                                                            'size-4',
                                                            done
                                                                ? 'text-[#A88B54]'
                                                                : 'text-gray-400',
                                                        )}
                                                    />
                                                    <span className="mt-1 text-[11px] font-semibold">
                                                        {stage.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {nextStage && (
                                        <div className="mt-3 flex justify-end">
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled={saving}
                                                onClick={() =>
                                                    handleSubmitStatus(
                                                        selectedOrder.id,
                                                        nextStage.key,
                                                        editTracking,
                                                    )
                                                }
                                                className="gap-1.5 rounded-xl bg-[#16233B] text-[#F2EBDC] hover:bg-[#1F304F]"
                                            >
                                                <CheckCircle2Icon className="size-3.5 text-[#A88B54]" />
                                                Majukan ke {nextStage.label}
                                                <ArrowRightIcon className="size-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Manual Status & Tracking Control */}
                                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-2">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="order_status">
                                            Status Pengiriman
                                        </Label>
                                        <select
                                            id="order_status"
                                            value={editStatus}
                                            onChange={(e) =>
                                                setEditStatus(e.target.value)
                                            }
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                                        >
                                            {ORDER_STAGES.map((stage) => (
                                                <option
                                                    key={stage.key}
                                                    value={stage.key}
                                                >
                                                    {stage.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="tracking_number">
                                            Nomor Resi (Opsional)
                                        </Label>
                                        <Input
                                            id="tracking_number"
                                            value={editTracking}
                                            onChange={(e) =>
                                                setEditTracking(e.target.value)
                                            }
                                            placeholder="cth. JNE-88991234"
                                        />
                                    </div>
                                </div>

                                {/* Alamat & Catatan Ucapan */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-xs">
                                        <p className="font-semibold text-gray-900">
                                            Alamat Pengiriman
                                        </p>
                                        <p className="mt-1 font-medium text-gray-800">
                                            {selectedOrder.address_snapshot
                                                ?.recipient_name ??
                                                selectedOrder.customer_name}{' '}
                                            ·{' '}
                                            {selectedOrder.address_snapshot
                                                ?.recipient_phone ??
                                                selectedOrder.customer_phone ??
                                                '-'}
                                        </p>
                                        <p className="mt-1 text-gray-600">
                                            {selectedOrder.address_snapshot
                                                ?.address_line ?? '-'}
                                            ,{' '}
                                            {selectedOrder.address_snapshot
                                                ?.city ?? ''}{' '}
                                            {selectedOrder.address_snapshot
                                                ?.postal_code ?? ''}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-xs">
                                        <p className="font-semibold text-gray-900">
                                            Catatan Kartu Ucapan
                                        </p>
                                        <p className="mt-1 text-gray-600 italic">
                                            {selectedOrder.greeting_note ??
                                                'Tidak ada catatan ucapan.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Bukti Pembayaran & Video B2B */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {selectedOrder.payment_proof_url && (
                                        <a
                                            href={
                                                selectedOrder.payment_proof_url
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                                        >
                                            <ExternalLinkIcon className="size-3.5" />
                                            Lihat Bukti Pembayaran
                                        </a>
                                    )}
                                    {selectedOrder.greeting_url && (
                                        <a
                                            href={selectedOrder.greeting_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#16233B] px-3.5 py-2 text-xs font-semibold text-[#F2EBDC] hover:bg-[#1F304F]"
                                        >
                                            <QrCodeIcon className="size-3.5 text-[#A88B54]" />
                                            Buka Video / QR Greeting
                                        </a>
                                    )}
                                </div>

                                {/* Items */}
                                <div className="rounded-xl border border-gray-100 bg-white p-4">
                                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                        Daftar Item (
                                        {selectedOrder.items.length})
                                    </p>
                                    <ul className="mt-2 divide-y divide-gray-100 text-xs">
                                        {selectedOrder.items.map((item) => (
                                            <li
                                                key={item.id}
                                                className="flex items-center justify-between py-2"
                                            >
                                                <div>
                                                    <span className="font-semibold text-gray-900">
                                                        {item.product_name}
                                                    </span>
                                                    {item.is_custom_b2b && (
                                                        <span className="ml-2 rounded bg-[#16233B] px-1.5 py-0.5 text-[10px] text-[#F2EBDC]">
                                                            Custom 3D
                                                        </span>
                                                    )}
                                                    <p className="text-gray-500">
                                                        {item.quantity} ×{' '}
                                                        {formatRupiah(
                                                            item.unit_price,
                                                        )}
                                                    </p>
                                                    {item.is_custom_b2b &&
                                                        Array.isArray(
                                                            item.custom_config
                                                                ?.items,
                                                        ) &&
                                                        item.custom_config.items
                                                            .length > 0 && (
                                                            <p className="mt-1 text-[11px] text-gray-600">
                                                                Isi:{' '}
                                                                {item.custom_config.items
                                                                    .map(
                                                                        (p) =>
                                                                            p.name,
                                                                    )
                                                                    .join(', ')}
                                                            </p>
                                                        )}
                                                </div>
                                                <span className="font-semibold text-gray-900">
                                                    {formatRupiah(
                                                        item.subtotal,
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSelectedOrder(null)}
                                >
                                    Tutup
                                </Button>
                                <Button
                                    type="button"
                                    disabled={saving}
                                    onClick={() =>
                                        handleSubmitStatus(
                                            selectedOrder.id,
                                            editStatus,
                                            editTracking,
                                        )
                                    }
                                >
                                    {saving
                                        ? 'Menyimpan...'
                                        : 'Simpan Status & Resi'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminOrders.layout = undefined;
