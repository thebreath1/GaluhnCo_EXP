import { Head, router, useForm } from '@inertiajs/react';
import {
    BuildingIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import PartnerController from '@/actions/App/Http/Controllers/Admin/PartnerController';
import { cn } from '@/utils';

type Partner = {
    id: number;
    name: string;
    sector: string | null;
    logo_url: string | null;
    sort_order: number;
    is_active: boolean;
};

type PageProps = { partners: Partner[] };

type PartnerFormData = {
    name: string;
    sector: string;
    sort_order: string;
    is_active: boolean;
    logo: File | null;
};

export default function PartnersIndex({ partners }: PageProps) {
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);

    const { data, setData, processing, errors, reset } =
        useForm<PartnerFormData>({
            name: '',
            sector: '',
            sort_order: '0',
            is_active: true,
            logo: null,
        });

    const filtered = partners.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.sector ?? '').toLowerCase().includes(search.toLowerCase()),
    );

    const openCreate = () => {
        reset();
        setEditingPartner(null);
        setModalOpen(true);
    };

    const openEdit = (partner: Partner) => {
        setEditingPartner(partner);
        setData({
            name: partner.name,
            sector: partner.sector ?? '',
            sort_order: partner.sort_order.toString(),
            is_active: partner.is_active,
            logo: null,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = new FormData();
        payload.append('name', data.name);
        payload.append('sector', data.sector);
        payload.append('sort_order', data.sort_order);
        payload.append('is_active', data.is_active ? '1' : '0');
        if (data.logo) payload.append('logo', data.logo);

        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                setModalOpen(false);
                reset();
                toast.success(
                    editingPartner
                        ? 'Partner berhasil diperbarui.'
                        : 'Partner berhasil ditambahkan.',
                );
            },
        };

        if (editingPartner) {
            payload.append('_method', 'PUT');
            router.post(
                PartnerController.update(editingPartner.id).url,
                payload,
                opts,
            );
        } else {
            router.post(PartnerController.store().url, payload, opts);
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(PartnerController.destroy(deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                toast.success('Partner berhasil dihapus.');
            },
        });
    };

    return (
        <>
            <Head title="Manajemen Partner" />

            <div className="space-y-6 p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#A88B54]/20 pb-5">
                    <div>
                        <h1 className="font-serif text-2xl font-normal text-[#16233B] sm:text-3xl">
                            Partner Korporat
                        </h1>
                        <p className="mt-0.5 font-sans text-xs text-[#6E675D] sm:text-sm">
                            Kelola logo dan daftar perusahaan mitra yang tampil
                            di halaman depan.
                        </p>
                    </div>
                    <Button
                        onClick={openCreate}
                        className="gap-2 rounded-full bg-[#16233B] px-5 text-[#F2EBDC] hover:bg-[#1F304F]"
                    >
                        <PlusIcon className="size-4 text-[#A88B54]" />
                        Tambah Partner
                    </Button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#A88B54]/25 bg-white px-5 py-4 text-[#16233B] shadow-xs">
                        <p className="font-sans text-xs font-semibold tracking-wider text-[#6E675D] uppercase">
                            Total Partner
                        </p>
                        <p className="mt-1 font-serif text-3xl font-semibold">
                            {partners.length}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[#A88B54]/25 bg-white px-5 py-4 text-[#16233B] shadow-xs">
                        <p className="font-sans text-xs font-semibold tracking-wider text-[#6E675D] uppercase">
                            Aktif
                        </p>
                        <p className="mt-1 font-serif text-3xl font-semibold text-[#A88B54]">
                            {partners.filter((p) => p.is_active).length}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[#A88B54]/25 bg-white px-5 py-4 shadow-xs">
                        <p className="font-sans text-xs font-semibold tracking-wider text-[#6E675D] uppercase">
                            Nonaktif
                        </p>
                        <p className="mt-1 font-serif text-3xl font-semibold text-[#16233B]">
                            {partners.filter((p) => !p.is_active).length}
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3">
                    <div className="flex max-w-xs flex-1 items-center gap-2 rounded-xl border border-[#A88B54]/30 bg-white px-3.5 py-2 shadow-xs">
                        <SearchIcon className="size-4 shrink-0 text-[#A88B54]" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau sektor..."
                            className="flex-1 bg-transparent font-sans text-sm text-[#16233B] outline-none placeholder:text-[#6E675D]/70"
                        />
                    </div>
                    <span className="font-sans text-xs font-medium text-[#6E675D]">
                        {filtered.length} partner
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-[#A88B54]/25 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#A88B54]/20 bg-[#F2EBDC]/60">
                                    <th className="w-16 px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Logo
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Nama Perusahaan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Sektor
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide text-[#6E675D] uppercase">
                                        Urutan
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
                                            colSpan={6}
                                            className="py-12 text-center font-sans text-sm text-[#6E675D]"
                                        >
                                            {search
                                                ? 'Tidak ada hasil yang cocok.'
                                                : 'Belum ada partner. Tambahkan partner pertama.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((partner) => (
                                        <tr
                                            key={partner.id}
                                            className="transition-colors hover:bg-[#FAF7F0]"
                                        >
                                            <td className="px-4 py-3">
                                                {partner.logo_url ? (
                                                    <img
                                                        src={partner.logo_url}
                                                        alt={partner.name}
                                                        className="h-11 w-16 rounded-lg border border-[#A88B54]/20 bg-[#FAF7F0] object-contain p-1"
                                                    />
                                                ) : (
                                                    <div className="flex h-11 w-16 items-center justify-center rounded-lg bg-[#F2EBDC]">
                                                        <BuildingIcon className="size-5 text-[#6E675D]" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-[#16233B]">
                                                    {partner.name}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-[#6E675D]">
                                                {partner.sector ?? (
                                                    <span className="text-[#6E675D]/50 italic">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center text-[#6E675D]">
                                                {partner.sort_order}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
                                                        partner.is_active
                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                                            : 'border-gray-200 bg-gray-100 text-gray-500',
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            'size-1.5 rounded-full',
                                                            partner.is_active
                                                                ? 'bg-emerald-500'
                                                                : 'bg-gray-400',
                                                        )}
                                                    />
                                                    {partner.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEdit(partner)
                                                        }
                                                        className="rounded-lg p-1.5 text-[#6E675D] transition-colors hover:bg-[#F2EBDC] hover:text-[#16233B]"
                                                    >
                                                        <PencilIcon className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteTarget(
                                                                partner,
                                                            )
                                                        }
                                                        className="rounded-lg p-1.5 text-[#6E675D] transition-colors hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2Icon className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal tambah / edit */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-md border-[#A88B54]/40 bg-[#FAF7F0] text-[#16233B]">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-normal text-[#16233B]">
                            {editingPartner ? 'Edit Partner' : 'Tambah Partner'}
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        id="partner-form"
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div className="grid gap-1.5">
                            <Label htmlFor="name">Nama Perusahaan</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="PT. Contoh Nusantara"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="sector">
                                Sektor / Keterangan{' '}
                                <span className="font-normal text-gray-400">
                                    (opsional)
                                </span>
                            </Label>
                            <Input
                                id="sector"
                                value={data.sector}
                                onChange={(e) =>
                                    setData('sector', e.target.value)
                                }
                                placeholder="FMCG, Perbankan, Teknologi..."
                            />
                            {errors.sector && (
                                <p className="text-sm text-red-500">
                                    {errors.sector}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="logo">
                                Logo Perusahaan{' '}
                                {editingPartner && (
                                    <span className="font-normal text-gray-400">
                                        (kosongkan jika tidak diganti)
                                    </span>
                                )}
                            </Label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/png,image/jpg,image/jpeg,image/svg+xml,image/webp"
                                onChange={(e) =>
                                    setData('logo', e.target.files?.[0] ?? null)
                                }
                            />
                            {errors.logo && (
                                <p className="text-sm text-red-500">
                                    {errors.logo}
                                </p>
                            )}
                            {/* Preview logo existing */}
                            {editingPartner?.logo_url && !data.logo && (
                                <div className="mt-1 flex items-center gap-3">
                                    <img
                                        src={editingPartner.logo_url}
                                        alt="Logo saat ini"
                                        className="h-12 w-auto rounded-lg object-contain"
                                        style={{
                                            background: '#f8f8f8',
                                            padding: '4px',
                                        }}
                                    />
                                    <span className="text-xs text-gray-400">
                                        Logo saat ini
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="sort_order">
                                    Urutan Tampil
                                </Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min={0}
                                    value={data.sort_order}
                                    onChange={(e) =>
                                        setData('sort_order', e.target.value)
                                    }
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(c) =>
                                    setData('is_active', Boolean(c))
                                }
                            />
                            <Label htmlFor="is_active">
                                Tampilkan di halaman publik
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
                            form="partner-form"
                            disabled={processing}
                            className="rounded-full bg-[#16233B] text-[#F2EBDC] hover:bg-[#1F304F]"
                        >
                            {processing
                                ? 'Menyimpan...'
                                : editingPartner
                                  ? 'Simpan Perubahan'
                                  : 'Tambah Partner'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog konfirmasi hapus */}
            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Partner?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500">
                        Partner{' '}
                        <span className="font-medium text-gray-900">
                            {deleteTarget?.name}
                        </span>{' '}
                        akan dihapus permanen beserta logonya.
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

PartnersIndex.layout = undefined;
