import { Head, router } from '@inertiajs/react';
import { SearchIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import InquiryController from '@/actions/App/Http/Controllers/Admin/InquiryController';
import { cn } from '@/utils';

type InquiryStatus = 'new' | 'contacted' | 'closed';

type Inquiry = {
    id: number;
    name: string;
    company: string;
    email: string;
    whatsapp_number: string;
    estimated_quantity: number;
    budget_per_package: number;
    needed_date: string;
    needed_date_formatted: string;
    notes: string | null;
    status: InquiryStatus;
    created_at: string;
};

type PageProps = {
    inquiries: Inquiry[];
};

const statusConfig: Record<
    InquiryStatus,
    { label: string; bg: string; text: string; dot: string }
> = {
    new: {
        label: 'Baru',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        dot: 'bg-blue-500',
    },
    contacted: {
        label: 'Dihubungi',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
    },
    closed: {
        label: 'Selesai',
        bg: 'bg-green-50',
        text: 'text-green-700',
        dot: 'bg-green-500',
    },
};

const allStatuses: InquiryStatus[] = ['new', 'contacted', 'closed'];

export default function InquiryIndex({ inquiries }: PageProps) {
    const [search, setSearch] = useState('');
    const [detailTarget, setDetailTarget] = useState<Inquiry | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);

    const filtered = inquiries.filter(
        (i) =>
            i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.company.toLowerCase().includes(search.toLowerCase()) ||
            i.email.toLowerCase().includes(search.toLowerCase()),
    );

    const countByStatus = (s: InquiryStatus) =>
        inquiries.filter((i) => i.status === s).length;

    const handleStatusChange = (inquiry: Inquiry, newStatus: InquiryStatus) => {
        if (inquiry.status === newStatus) return;
        router.put(
            InquiryController.update(inquiry.id),
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Status berhasil diperbarui.'),
            },
        );
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(InquiryController.destroy(deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                toast.success('Inquiry berhasil dihapus.');
            },
        });
    };

    return (
        <>
            <Head title="Manajemen Inquiry" />

            <div className="space-y-6 p-6 sm:p-8">
                {/* Page title */}
                <div className="border-b border-[#A88B54]/20 pb-5">
                    <h1 className="font-serif text-2xl font-normal text-[#16233B] sm:text-3xl">
                        Daftar Inquiry Corporate
                    </h1>
                    <p className="mt-0.5 font-sans text-xs text-[#6E675D] sm:text-sm">
                        Kelola permintaan penawaran korporat dan status tindak
                        lanjutnya.
                    </p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <SummaryCard
                        label="Inquiry Baru"
                        count={countByStatus('new')}
                        variant="navy"
                    />
                    <SummaryCard
                        label="Dihubungi"
                        count={countByStatus('contacted')}
                        variant="softNavy"
                    />
                    <SummaryCard
                        label="Selesai"
                        count={countByStatus('closed')}
                        variant="ivory"
                    />
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3">
                    <div className="flex max-w-xs flex-1 items-center gap-2 rounded-xl border border-[#A88B54]/30 bg-white px-3.5 py-2 text-sm shadow-xs">
                        <SearchIcon className="size-4 shrink-0 text-[#A88B54]" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama, perusahaan..."
                            className="flex-1 bg-transparent font-sans text-sm text-[#16233B] outline-none placeholder:text-[#6E675D]/70"
                        />
                    </div>
                    <span className="ml-1 font-sans text-xs font-medium text-[#6E675D]">
                        {filtered.length} inquiry
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-[#A88B54]/25 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#A88B54]/20 bg-[#F2EBDC]/60">
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Nama / Perusahaan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Kontak
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Jml Paket
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Budget
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Tgl Butuh
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Status
                                    </th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#A88B54]/15">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-12 text-center font-sans text-sm text-[#6E675D]"
                                        >
                                            {search
                                                ? 'Tidak ada hasil yang cocok.'
                                                : 'Belum ada inquiry masuk.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((inquiry) => (
                                        <tr
                                            key={inquiry.id}
                                            className="transition-colors hover:bg-[#FAF7F0]"
                                        >
                                            <td className="px-4 py-3.5">
                                                <button
                                                    type="button"
                                                    className="text-left"
                                                    onClick={() =>
                                                        setDetailTarget(inquiry)
                                                    }
                                                >
                                                    <p className="font-medium text-gray-900 transition-colors hover:text-blue-600">
                                                        {inquiry.name}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-gray-500">
                                                        {inquiry.company}
                                                    </p>
                                                </button>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="text-gray-700">
                                                    {inquiry.email}
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    {inquiry.whatsapp_number}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-medium text-gray-900">
                                                {inquiry.estimated_quantity.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-gray-700">
                                                {formatRupiah(
                                                    inquiry.budget_per_package,
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-600">
                                                {inquiry.needed_date_formatted}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <StatusPill
                                                    status={inquiry.status}
                                                    onSelect={(s) =>
                                                        handleStatusChange(
                                                            inquiry,
                                                            s,
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteTarget(inquiry)
                                                    }
                                                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <Trash2Icon className="size-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail dialog */}
            <Dialog
                open={detailTarget !== null}
                onOpenChange={(open) => !open && setDetailTarget(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detail Inquiry</DialogTitle>
                    </DialogHeader>
                    {detailTarget && (
                        <div className="space-y-3 text-sm">
                            <DetailRow
                                label="Nama PIC"
                                value={detailTarget.name}
                            />
                            <DetailRow
                                label="Perusahaan"
                                value={detailTarget.company}
                            />
                            <DetailRow
                                label="Email"
                                value={detailTarget.email}
                            />
                            <DetailRow
                                label="WhatsApp"
                                value={detailTarget.whatsapp_number}
                            />
                            <DetailRow
                                label="Jumlah Paket"
                                value={detailTarget.estimated_quantity.toLocaleString(
                                    'id-ID',
                                )}
                            />
                            <DetailRow
                                label="Budget/Paket"
                                value={formatRupiah(
                                    detailTarget.budget_per_package,
                                )}
                            />
                            <DetailRow
                                label="Tanggal Butuh"
                                value={detailTarget.needed_date_formatted}
                            />
                            <DetailRow
                                label="Diterima"
                                value={detailTarget.created_at}
                            />
                            {detailTarget.notes && (
                                <div>
                                    <p className="font-medium text-gray-500">
                                        Catatan
                                    </p>
                                    <p className="mt-1 rounded-lg bg-gray-50 p-3 whitespace-pre-wrap">
                                        {detailTarget.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDetailTarget(null)}
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Inquiry?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500">
                        Inquiry dari{' '}
                        <span className="font-medium text-gray-900">
                            {deleteTarget?.name}
                        </span>{' '}
                        ({deleteTarget?.company}) akan dihapus permanen.
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

function SummaryCard({
    label,
    count,
    variant,
}: {
    label: string;
    count: number;
    variant: 'navy' | 'softNavy' | 'ivory';
}) {
    const countClass =
        variant === 'softNavy' ? 'text-[#A88B54]' : 'text-[#16233B]';

    return (
        <div className="rounded-2xl border border-[#A88B54]/25 bg-white px-5 py-4 text-[#16233B] shadow-xs">
            <p className="font-sans text-xs font-semibold tracking-wider text-[#6E675D] uppercase">
                {label}
            </p>
            <p
                className={cn(
                    'mt-1 font-serif text-3xl font-semibold',
                    countClass,
                )}
            >
                {count}
            </p>
        </div>
    );
}

function StatusPill({
    status,
    onSelect,
}: {
    status: InquiryStatus;
    onSelect: (s: InquiryStatus) => void;
}) {
    const cfg = statusConfig[status];
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors">
                <span
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                        cfg.bg,
                        cfg.text,
                    )}
                >
                    <span className={cn('size-1.5 rounded-full', cfg.dot)} />
                    {cfg.label}
                    <span className="ml-0.5 text-current opacity-50">▾</span>
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" sideOffset={4}>
                {allStatuses.map((s) => (
                    <DropdownMenuItem
                        key={s}
                        onClick={() => onSelect(s)}
                        className={cn(s === status && 'font-semibold')}
                    >
                        <span
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs',
                                statusConfig[s].bg,
                                statusConfig[s].text,
                            )}
                        >
                            <span
                                className={cn(
                                    'size-1.5 rounded-full',
                                    statusConfig[s].dot,
                                )}
                            />
                            {statusConfig[s].label}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2">
            <span className="w-32 shrink-0 font-medium text-gray-500">
                {label}
            </span>
            <span className="text-gray-900">{value}</span>
        </div>
    );
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

InquiryIndex.layout = undefined;
