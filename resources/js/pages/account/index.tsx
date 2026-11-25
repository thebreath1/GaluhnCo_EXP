import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Building2Icon,
    CheckCircle2Icon,
    CheckIcon,
    CopyIcon,
    ExternalLinkIcon,
    KeyRoundIcon,
    LogOutIcon,
    MapPinIcon,
    PackageCheckIcon,
    PackageIcon,
    PencilIcon,
    PlusIcon,
    QrCodeIcon,
    ShieldCheckIcon,
    Trash2Icon,
    TruckIcon,
    UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AccountController from '@/actions/App/Http/Controllers/AccountController';
import type { StoredParcelItem } from '@/components/b2b/parcel-catalog';
import QrCodeSvg from '@/components/QrCodeSvg';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { catalog, dashboard, logout } from '@/routes';

type AccountTab = 'profile' | 'addresses' | 'orders';

interface AccountUser {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    company_name: string | null;
    is_admin: boolean;
}

interface AddressItem {
    id: number;
    label: string;
    recipient_name: string;
    recipient_phone: string;
    address_line: string;
    city: string;
    postal_code: string;
    is_default: boolean;
}

interface OrderItemEntry {
    id: number;
    product_name: string;
    is_custom_b2b: boolean;
    custom_config: {
        box_color?: string;
        ribbon_color?: string;
        package_tier?: string;
        items?: StoredParcelItem[];
    } | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface OrderEntry {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    tracking_number: string | null;
    greeting_note: string | null;
    address_snapshot: Record<string, unknown> | null;
    b2b_video_path: string | null;
    b2b_video_token: string | null;
    greeting_url: string | null;
    verified_at: string | null;
    packed_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    created_at: string | null;
    items: OrderItemEntry[];
}

interface AccountPageProps {
    user: AccountUser;
    addresses: AddressItem[];
    orders: OrderEntry[];
}

const ORDER_STEPS = [
    {
        key: 'verification',
        label: 'Verifikasi',
        desc: 'Pembayaran dikonfirmasi',
        icon: ShieldCheckIcon,
    },
    {
        key: 'packing',
        label: 'Pengemasan',
        desc: 'Hampers sedang dirangkai',
        icon: PackageIcon,
    },
    {
        key: 'shipping',
        label: 'Pengiriman',
        desc: 'Dalam perjalanan ke tujuan',
        icon: TruckIcon,
    },
    {
        key: 'delivered',
        label: 'Terkirim',
        desc: 'Diterima oleh penerima',
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

function formatDateId(iso: string | null): string {
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

function getStepIndex(status: string): number {
    const idx = ORDER_STEPS.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
}

function getStepTimestamp(order: OrderEntry, key: string): string | null {
    switch (key) {
        case 'verification':
            return order.verified_at ?? order.created_at;
        case 'packing':
            return order.packed_at;
        case 'shipping':
            return order.shipped_at;
        case 'delivered':
            return order.delivered_at;
        default:
            return null;
    }
}

export default function AccountIndex({
    user,
    addresses,
    orders,
}: AccountPageProps) {
    const [activeTab, setActiveTab] = useState<AccountTab>('profile');

    // ── Profile Form ──────────────────────────────────────────────────────────
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        company_name: user.company_name ?? '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch(AccountController.updateProfile().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Informasi profil berhasil diperbarui.');
            },
            onError: () => {
                toast.error('Periksa kembali isian profil Anda.');
            },
        });
    };

    // ── Password Form ─────────────────────────────────────────────────────────
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put(AccountController.updatePassword().url, {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                toast.success('Password Anda berhasil diubah.');
            },
            onError: () => {
                toast.error('Gagal mengubah password. Periksa input Anda.');
            },
        });
    };

    // ── Address Modal & Actions ───────────────────────────────────────────────
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<AddressItem | null>(
        null,
    );
    const [deleteTarget, setDeleteTarget] = useState<AddressItem | null>(null);

    const addressForm = useForm({
        label: '',
        recipient_name: '',
        recipient_phone: '',
        address_line: '',
        city: '',
        postal_code: '',
        is_default: false,
    });

    const openCreateAddress = () => {
        setEditingAddress(null);
        addressForm.reset();
        addressForm.clearErrors();
        addressForm.setData({
            label: '',
            recipient_name: user.name,
            recipient_phone: user.phone ?? '',
            address_line: '',
            city: '',
            postal_code: '',
            is_default: addresses.length === 0,
        });
        setAddressModalOpen(true);
    };

    const openEditAddress = (addr: AddressItem) => {
        setEditingAddress(addr);
        addressForm.clearErrors();
        addressForm.setData({
            label: addr.label,
            recipient_name: addr.recipient_name,
            recipient_phone: addr.recipient_phone,
            address_line: addr.address_line,
            city: addr.city,
            postal_code: addr.postal_code,
            is_default: addr.is_default,
        });
        setAddressModalOpen(true);
    };

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAddress) {
            addressForm.patch(
                AccountController.updateAddress(editingAddress.id).url,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setAddressModalOpen(false);
                        setEditingAddress(null);
                        toast.success('Alamat berhasil diperbarui.');
                    },
                },
            );
        } else {
            addressForm.post(AccountController.storeAddress().url, {
                preserveScroll: true,
                onSuccess: () => {
                    setAddressModalOpen(false);
                    addressForm.reset();
                    toast.success('Alamat baru berhasil ditambahkan.');
                },
            });
        }
    };

    const handleSetDefaultAddress = (addr: AddressItem) => {
        router.patch(
            AccountController.updateAddress(addr.id).url,
            { is_default: true },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`"${addr.label}" dijadikan alamat utama.`);
                },
            },
        );
    };

    const handleDeleteAddress = () => {
        if (!deleteTarget) {
            return;
        }
        router.delete(AccountController.destroyAddress(deleteTarget.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                toast.success('Alamat berhasil dihapus.');
            },
        });
    };

    const handleCopyTracking = (tracking: string) => {
        void navigator.clipboard?.writeText(tracking);
        toast.success(`Nomor resi ${tracking} disalin.`);
    };

    const handleLogout = () => {
        router.post(logout().url);
    };

    return (
        <>
            <Head title="Akun Saya — Galuh & Co." />

            <StorefrontLayout>
                {/* ── Account Summary Banner (Deep Navy) ──────────────────────── */}
                <section className="border-b border-[#A88B54]/30 bg-[#16233B] pt-28 pb-10 text-[#F2EBDC] md:pt-32 md:pb-12">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#A88B54]/45 bg-[#1E2F4D] px-3.5 py-1">
                                    {user.role === 'b2b' ? (
                                        <Building2Icon className="size-3.5 text-[#A88B54]" />
                                    ) : (
                                        <UserIcon className="size-3.5 text-[#A88B54]" />
                                    )}
                                    <span className="font-sans text-[11px] font-semibold tracking-wider text-[#F2EBDC] uppercase">
                                        {user.role === 'b2b'
                                            ? 'Akun Corporate (B2B)'
                                            : user.is_admin
                                              ? 'Administrator'
                                              : 'Akun Personal'}
                                    </span>
                                </div>
                                <h1 className="mt-3 font-serif text-3xl font-normal tracking-normal text-[#F2EBDC] sm:text-4xl">
                                    Selamat Datang, {user.name}
                                </h1>
                                <p className="mt-1.5 font-sans text-xs text-[#F2EBDC]/80 sm:text-sm">
                                    {user.email}
                                    {user.phone ? ` · ${user.phone}` : ''}
                                    {user.company_name
                                        ? ` · ${user.company_name}`
                                        : ''}
                                </p>
                            </div>

                            {/* Stat pills & Account actions */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="rounded-2xl border border-[#A88B54]/30 bg-[#1E2F4D] px-4 py-2.5">
                                    <p className="font-sans text-[10px] font-semibold tracking-wider text-[#F2EBDC]/75 uppercase">
                                        Alamat Tersimpan
                                    </p>
                                    <p className="mt-0.5 font-serif text-xl font-semibold text-[#F2EBDC]">
                                        {addresses.length}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#A88B54]/30 bg-[#1E2F4D] px-4 py-2.5">
                                    <p className="font-sans text-[10px] font-semibold tracking-wider text-[#F2EBDC]/75 uppercase">
                                        Total Pesanan
                                    </p>
                                    <p className="mt-0.5 font-serif text-xl font-semibold text-[#F2EBDC]">
                                        {orders.length}
                                    </p>
                                </div>
                                {user.is_admin && (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-[#F2EBDC]/30 px-4 py-2.5 font-sans text-xs font-medium text-[#F2EBDC] transition-colors hover:bg-[#F2EBDC]/10"
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#A88B54]/45 bg-[#1E2F4D] px-4 py-2.5 font-sans text-xs font-semibold text-[#F2EBDC] transition-colors hover:bg-[#F2EBDC]/10"
                                >
                                    <LogOutIcon className="size-3.5 text-[#A88B54]" />
                                    <span>Keluar</span>
                                </button>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="mt-8 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('profile')}
                                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-xs font-semibold tracking-wide transition-all ${
                                    activeTab === 'profile'
                                        ? 'bg-[#F2EBDC] text-[#16233B] shadow-md'
                                        : 'border border-[#A88B54]/35 bg-[#1E2F4D]/80 text-[#F2EBDC]/85 hover:bg-[#1E2F4D] hover:text-[#F2EBDC]'
                                }`}
                            >
                                <UserIcon className="size-3.5" />
                                Profil &amp; Keamanan
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('addresses')}
                                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-xs font-semibold tracking-wide transition-all ${
                                    activeTab === 'addresses'
                                        ? 'bg-[#F2EBDC] text-[#16233B] shadow-md'
                                        : 'border border-[#A88B54]/35 bg-[#1E2F4D]/80 text-[#F2EBDC]/85 hover:bg-[#1E2F4D] hover:text-[#F2EBDC]'
                                }`}
                            >
                                <MapPinIcon className="size-3.5" />
                                Buku Alamat ({addresses.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('orders')}
                                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-xs font-semibold tracking-wide transition-all ${
                                    activeTab === 'orders'
                                        ? 'bg-[#F2EBDC] text-[#16233B] shadow-md'
                                        : 'border border-[#A88B54]/35 bg-[#1E2F4D]/80 text-[#F2EBDC]/85 hover:bg-[#1E2F4D] hover:text-[#F2EBDC]'
                                }`}
                            >
                                <PackageIcon className="size-3.5" />
                                Riwayat &amp; Tracking Pesanan ({orders.length})
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Tab Content Area (Warm Ivory) ───────────────────────────── */}
                <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">
                    {/* TAB 1: Profil & Keamanan */}
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                            {/* Informasi Profil */}
                            <div className="rounded-3xl border border-[#A88B54]/25 bg-[#FAF7F0] p-6 shadow-[0_12px_32px_-12px_rgba(22,35,59,0.10)] sm:p-8 lg:col-span-7">
                                <div className="flex items-center gap-3 border-b border-[#A88B54]/25 pb-5">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#16233B] text-[#A88B54]">
                                        <UserIcon className="size-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-serif text-2xl font-normal text-[#16233B]">
                                            Informasi Profil
                                        </h2>
                                        <p className="font-sans text-xs text-[#6E675D]">
                                            Perbarui data diri, kontak WhatsApp,
                                            dan informasi perusahaan Anda.
                                        </p>
                                    </div>
                                </div>

                                <form
                                    onSubmit={handleProfileSubmit}
                                    className="mt-6 space-y-4"
                                >
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="prof_name"
                                                className="block font-sans text-xs font-semibold text-[#16233B]"
                                            >
                                                Nama Lengkap *
                                            </label>
                                            <input
                                                id="prof_name"
                                                type="text"
                                                required
                                                value={profileForm.data.name}
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                className="mt-1.5 w-full rounded-xl border border-[#A88B54]/30 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                            />
                                            {profileForm.errors.name && (
                                                <p className="mt-1 font-sans text-xs text-red-600">
                                                    {profileForm.errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="prof_email"
                                                className="block font-sans text-xs font-semibold text-[#16233B]"
                                            >
                                                Alamat Email *
                                            </label>
                                            <input
                                                id="prof_email"
                                                type="email"
                                                required
                                                value={profileForm.data.email}
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                className="mt-1.5 w-full rounded-xl border border-[#A88B54]/30 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                            />
                                            {profileForm.errors.email && (
                                                <p className="mt-1 font-sans text-xs text-red-600">
                                                    {profileForm.errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="prof_phone"
                                                className="block font-sans text-xs font-semibold text-[#16233B]"
                                            >
                                                Nomor Telepon / WhatsApp
                                            </label>
                                            <input
                                                id="prof_phone"
                                                type="tel"
                                                value={profileForm.data.phone}
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="081234567890"
                                                className="mt-1.5 w-full rounded-xl border border-[#A88B54]/30 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                            />
                                            {profileForm.errors.phone && (
                                                <p className="mt-1 font-sans text-xs text-red-600">
                                                    {profileForm.errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="prof_company"
                                                className="block font-sans text-xs font-semibold text-[#16233B]"
                                            >
                                                Nama Perusahaan{' '}
                                                {user.role === 'b2b'
                                                    ? '*'
                                                    : '(Opsional)'}
                                            </label>
                                            <input
                                                id="prof_company"
                                                type="text"
                                                required={user.role === 'b2b'}
                                                value={
                                                    profileForm.data
                                                        .company_name
                                                }
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        'company_name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="cth. PT Mahakarya Nusantara"
                                                className="mt-1.5 w-full rounded-xl border border-[#A88B54]/30 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                            />
                                            {profileForm.errors
                                                .company_name && (
                                                <p className="mt-1 font-sans text-xs text-red-600">
                                                    {
                                                        profileForm.errors
                                                            .company_name
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={profileForm.processing}
                                            className="inline-flex items-center gap-2 rounded-full bg-[#16233B] px-7 py-3 font-sans text-xs font-semibold tracking-wide text-[#F2EBDC] transition-colors hover:bg-[#1F304F] disabled:opacity-60"
                                        >
                                            {profileForm.processing && (
                                                <Spinner className="size-3.5" />
                                            )}
                                            Simpan Perubahan Profil
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Keamanan / Ubah Password */}
                            <div className="rounded-3xl border border-[#A88B54]/25 bg-[#FAF7F0] p-6 shadow-[0_12px_32px_-12px_rgba(22,35,59,0.10)] sm:p-8 lg:col-span-5">
                                <div className="flex items-center gap-3 border-b border-[#A88B54]/25 pb-5">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#16233B] text-[#A88B54]">
                                        <KeyRoundIcon className="size-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-serif text-2xl font-normal text-[#16233B]">
                                            Keamanan Akun
                                        </h2>
                                        <p className="font-sans text-xs text-[#6E675D]">
                                            Perbarui password Anda secara
                                            berkala.
                                        </p>
                                    </div>
                                </div>

                                <form
                                    onSubmit={handlePasswordSubmit}
                                    className="mt-6 space-y-4"
                                >
                                    <div>
                                        <label
                                            htmlFor="curr_pass"
                                            className="block font-sans text-xs font-semibold text-[#16233B]"
                                        >
                                            Password Saat Ini *
                                        </label>
                                        <input
                                            id="curr_pass"
                                            type="password"
                                            required
                                            autoComplete="current-password"
                                            value={
                                                passwordForm.data
                                                    .current_password
                                            }
                                            onChange={(e) =>
                                                passwordForm.setData(
                                                    'current_password',
                                                    e.target.value,
                                                )
                                            }
                                            className="mt-1.5 w-full rounded-xl border border-[#A88B54]/30 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                        />
                                        {passwordForm.errors
                                            .current_password && (
                                            <p className="mt-1 font-sans text-xs text-red-600">
                                                {
                                                    passwordForm.errors
                                                        .current_password
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="new_pass"
                                            className="block font-sans text-xs font-semibold text-[#16233B]"
                                        >
                                            Password Baru *
                                        </label>
                                        <input
                                            id="new_pass"
                                            type="password"
                                            required
                                            autoComplete="new-password"
                                            value={passwordForm.data.password}
                                            onChange={(e) =>
                                                passwordForm.setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            className="mt-1.5 w-full rounded-xl border border-[#A88B54]/30 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                        />
                                        {passwordForm.errors.password && (
                                            <p className="mt-1 font-sans text-xs text-red-600">
                                                {passwordForm.errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="conf_pass"
                                            className="block font-sans text-xs font-semibold text-[#16233B]"
                                        >
                                            Konfirmasi Password Baru *
                                        </label>
                                        <input
                                            id="conf_pass"
                                            type="password"
                                            required
                                            autoComplete="new-password"
                                            value={
                                                passwordForm.data
                                                    .password_confirmation
                                            }
                                            onChange={(e) =>
                                                passwordForm.setData(
                                                    'password_confirmation',
                                                    e.target.value,
                                                )
                                            }
                                            className="mt-1.5 w-full rounded-xl border border-[#A88B54]/30 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={passwordForm.processing}
                                            className="inline-flex items-center gap-2 rounded-full border border-[#A88B54] bg-[#FAF7F0] px-7 py-3 font-sans text-xs font-semibold tracking-wide text-[#16233B] transition-colors hover:bg-[#16233B] hover:text-[#F2EBDC] disabled:opacity-60"
                                        >
                                            {passwordForm.processing && (
                                                <Spinner className="size-3.5" />
                                            )}
                                            Perbarui Password
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Buku Alamat */}
                    {activeTab === 'addresses' && (
                        <div>
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="font-serif text-2xl font-normal text-[#16233B] sm:text-3xl">
                                        Buku Alamat Pengiriman
                                    </h2>
                                    <p className="mt-1 font-sans text-xs text-[#6E675D] sm:text-sm">
                                        Kelola alamat pribadi maupun daftar
                                        penerima bingkisan Anda.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={openCreateAddress}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#16233B] px-6 py-3 font-sans text-xs font-semibold tracking-wide text-[#F2EBDC] shadow-sm transition-colors hover:bg-[#1F304F]"
                                >
                                    <PlusIcon className="size-4 text-[#A88B54]" />
                                    Tambah Alamat Baru
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="mt-8 rounded-3xl border border-[#A88B54]/25 bg-[#FAF7F0] p-10 text-center shadow-[0_12px_32px_-12px_rgba(22,35,59,0.10)]">
                                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#16233B] text-[#A88B54]">
                                        <MapPinIcon className="size-6" />
                                    </div>
                                    <h3 className="mt-4 font-serif text-xl font-semibold text-[#16233B]">
                                        Belum Ada Alamat Tersimpan
                                    </h3>
                                    <p className="mt-2 font-sans text-xs text-[#6E675D] sm:text-sm">
                                        Tambahkan alamat pengiriman agar proses
                                        checkout Anda menjadi jauh lebih cepat.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={openCreateAddress}
                                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#16233B] px-6 py-2.5 font-sans text-xs font-semibold text-[#F2EBDC] hover:bg-[#1F304F]"
                                    >
                                        <PlusIcon className="size-4 text-[#A88B54]" />
                                        Tambah Alamat Pertama
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`flex flex-col justify-between rounded-2xl border bg-[#FAF7F0] p-6 shadow-[0_12px_30px_-12px_rgba(22,35,59,0.10)] transition-all ${
                                                addr.is_default
                                                    ? 'border-[#16233B] ring-1 ring-[#A88B54]/40'
                                                    : 'border-[#A88B54]/25'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <MapPinIcon className="size-4 shrink-0 text-[#A88B54]" />
                                                        <span className="font-serif text-lg font-semibold text-[#16233B]">
                                                            {addr.label}
                                                        </span>
                                                    </div>
                                                    {addr.is_default && (
                                                        <span className="rounded-full bg-[#16233B] px-3 py-0.5 font-sans text-[10px] font-semibold tracking-wider text-[#F2EBDC] uppercase">
                                                            Utama
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-4 space-y-1 font-sans text-xs text-[#6E675D] sm:text-sm">
                                                    <p className="font-semibold text-[#16233B]">
                                                        {addr.recipient_name}
                                                    </p>
                                                    <p>
                                                        {addr.recipient_phone}
                                                    </p>
                                                    <p className="pt-1 leading-relaxed">
                                                        {addr.address_line}
                                                    </p>
                                                    <p>
                                                        {addr.city},{' '}
                                                        {addr.postal_code}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#A88B54]/25 pt-4">
                                                {!addr.is_default && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleSetDefaultAddress(
                                                                addr,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-full border border-[#A88B54] px-3 py-1.5 font-sans text-[11px] font-semibold text-[#16233B] transition-colors hover:bg-[#16233B] hover:text-[#F2EBDC]"
                                                    >
                                                        <CheckIcon className="size-3" />
                                                        Jadikan Utama
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditAddress(addr)
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-full border border-[#A88B54]/35 bg-white px-3 py-1.5 font-sans text-[11px] font-medium text-[#16233B] transition-colors hover:border-[#16233B]"
                                                >
                                                    <PencilIcon className="size-3 text-[#A88B54]" />
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteTarget(addr)
                                                    }
                                                    className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 font-sans text-[11px] font-medium text-red-700 transition-colors hover:bg-red-50"
                                                >
                                                    <Trash2Icon className="size-3.5" />
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: Riwayat & Tracking Pesanan */}
                    {activeTab === 'orders' && (
                        <div>
                            <div>
                                <h2 className="font-serif text-2xl font-normal text-[#16233B] sm:text-3xl">
                                    Riwayat &amp; Pelacakan Pesanan
                                </h2>
                                <p className="mt-1 font-sans text-xs text-[#6E675D] sm:text-sm">
                                    Pantau proses kurasi hingga pengantaran
                                    bingkisan Anda secara langsung.
                                </p>
                            </div>

                            {orders.length === 0 ? (
                                <div className="mt-8 rounded-3xl border border-[#A88B54]/25 bg-[#FAF7F0] p-10 text-center shadow-[0_12px_32px_-12px_rgba(22,35,59,0.10)]">
                                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#16233B] text-[#A88B54]">
                                        <PackageIcon className="size-6" />
                                    </div>
                                    <h3 className="mt-4 font-serif text-xl font-semibold text-[#16233B]">
                                        Belum Ada Riwayat Pesanan
                                    </h3>
                                    <p className="mt-2 font-sans text-xs text-[#6E675D] sm:text-sm">
                                        Jelajahi koleksi hampers eksklusif kami
                                        untuk memulai pesanan pertama Anda.
                                    </p>
                                    <Link
                                        href={catalog()}
                                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#16233B] px-6 py-2.5 font-sans text-xs font-semibold text-[#F2EBDC] hover:bg-[#1F304F]"
                                    >
                                        Jelajahi Katalog Hampers
                                    </Link>
                                </div>
                            ) : (
                                <div className="mt-8 space-y-6">
                                    {orders.map((order) => {
                                        const activeStepIndex = getStepIndex(
                                            order.status,
                                        );
                                        const recipientName =
                                            typeof order.address_snapshot
                                                ?.recipient_name === 'string'
                                                ? order.address_snapshot
                                                      .recipient_name
                                                : null;
                                        const city =
                                            typeof order.address_snapshot
                                                ?.city === 'string'
                                                ? order.address_snapshot.city
                                                : null;

                                        return (
                                            <div
                                                key={order.id}
                                                className="overflow-hidden rounded-3xl border border-[#A88B54]/25 bg-[#FAF7F0] shadow-[0_12px_32px_-12px_rgba(22,35,59,0.10)]"
                                            >
                                                {/* Order Header */}
                                                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#A88B54]/25 bg-[#16233B] px-6 py-4 text-[#F2EBDC]">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <span className="font-serif text-lg font-semibold tracking-wide">
                                                            {order.order_number}
                                                        </span>
                                                        <span className="rounded-full border border-[#A88B54]/45 bg-[#1E2F4D] px-3 py-0.5 font-sans text-[11px] font-semibold text-[#F2EBDC]">
                                                            {ORDER_STEPS[
                                                                activeStepIndex
                                                            ]?.label ??
                                                                order.status}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#F2EBDC]/80">
                                                        <span>
                                                            {formatDateId(
                                                                order.created_at,
                                                            )}
                                                        </span>
                                                        <span className="font-serif text-base font-semibold text-[#F2EBDC]">
                                                            {formatRupiah(
                                                                order.total_amount,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-6 sm:p-8">
                                                    {/* Visual Stepper 4 Tahap */}
                                                    <div>
                                                        <p className="font-sans text-[11px] font-semibold tracking-wider text-[#6E675D] uppercase">
                                                            Status Pemrosesan
                                                            Parcel
                                                        </p>
                                                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
                                                            {ORDER_STEPS.map(
                                                                (step, idx) => {
                                                                    const StepIcon =
                                                                        step.icon;
                                                                    const isCompleted =
                                                                        idx <=
                                                                        activeStepIndex;
                                                                    const isCurrent =
                                                                        idx ===
                                                                        activeStepIndex;
                                                                    const stepTime =
                                                                        getStepTimestamp(
                                                                            order,
                                                                            step.key,
                                                                        );

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                step.key
                                                                            }
                                                                            className={`relative flex items-start gap-3 rounded-2xl border p-3.5 transition-all sm:flex-col sm:items-center sm:text-center ${
                                                                                isCurrent
                                                                                    ? 'border-[#16233B] bg-white shadow-sm'
                                                                                    : isCompleted
                                                                                      ? 'border-[#A88B54]/40 bg-white/70'
                                                                                      : 'border-[#A88B54]/20 bg-[#F2EBDC]/40 opacity-65'
                                                                            }`}
                                                                        >
                                                                            <div
                                                                                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                                                                                    isCompleted
                                                                                        ? 'bg-[#16233B] text-[#A88B54]'
                                                                                        : 'border border-[#A88B54]/30 bg-[#FAF7F0] text-[#6E675D]'
                                                                                }`}
                                                                            >
                                                                                {idx <
                                                                                activeStepIndex ? (
                                                                                    <CheckCircle2Icon className="size-5 text-[#A88B54]" />
                                                                                ) : (
                                                                                    <StepIcon className="size-4.5" />
                                                                                )}
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <p className="font-serif text-sm font-semibold text-[#16233B]">
                                                                                    {
                                                                                        step.label
                                                                                    }
                                                                                </p>
                                                                                <p className="mt-0.5 font-sans text-[11px] text-[#6E675D]">
                                                                                    {
                                                                                        step.desc
                                                                                    }
                                                                                </p>
                                                                                {stepTime && (
                                                                                    <p className="mt-1 font-sans text-[10px] font-medium text-[#16233B]">
                                                                                        {formatDateId(
                                                                                            stepTime,
                                                                                        )}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Tracking, Address & QR Video Greeting Bar */}
                                                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#A88B54]/25 bg-white/80 p-4">
                                                        <div className="space-y-1 text-xs">
                                                            {recipientName && (
                                                                <p className="font-sans text-[#6E675D]">
                                                                    Penerima:{' '}
                                                                    <strong className="text-[#16233B]">
                                                                        {
                                                                            recipientName
                                                                        }
                                                                    </strong>
                                                                    {city
                                                                        ? ` (${city})`
                                                                        : ''}
                                                                </p>
                                                            )}
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="font-sans text-[#6E675D]">
                                                                    Nomor Resi:
                                                                </span>
                                                                {order.tracking_number ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleCopyTracking(
                                                                                order.tracking_number ??
                                                                                    '',
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-full border border-[#A88B54]/35 bg-[#FAF7F0] px-3 py-0.5 font-mono text-xs font-semibold text-[#16233B] hover:border-[#16233B]"
                                                                    >
                                                                        <span>
                                                                            {
                                                                                order.tracking_number
                                                                            }
                                                                        </span>
                                                                        <CopyIcon className="size-3 text-[#A88B54]" />
                                                                    </button>
                                                                ) : (
                                                                    <span className="font-sans text-[#6E675D] italic">
                                                                        Menunggu
                                                                        pengiriman
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {(order.greeting_url ||
                                                            order.b2b_video_token) &&
                                                            (() => {
                                                                const greetingPath =
                                                                    order.greeting_url ??
                                                                    `/greeting/${order.b2b_video_token}`;
                                                                const absoluteGreetingUrl =
                                                                    greetingPath.startsWith(
                                                                        'http',
                                                                    )
                                                                        ? greetingPath
                                                                        : `${typeof window !== 'undefined' ? window.location.origin : ''}${greetingPath}`;

                                                                return (
                                                                    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#A88B54]/35 bg-[#FAF7F0] p-3">
                                                                        <div className="overflow-hidden rounded-xl border border-[#A88B54]/30 bg-white p-1.5 shadow-xs">
                                                                            <QrCodeSvg
                                                                                value={
                                                                                    absoluteGreetingUrl
                                                                                }
                                                                                size={
                                                                                    84
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <p className="font-serif text-sm font-semibold text-[#16233B]">
                                                                                QR
                                                                                Video
                                                                                Ucapan
                                                                                B2B
                                                                            </p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                <a
                                                                                    href={
                                                                                        greetingPath
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#16233B] px-4 py-1.5 font-sans text-[11px] font-semibold text-[#F2EBDC] transition-colors hover:bg-[#1F304F]"
                                                                                >
                                                                                    <QrCodeIcon className="size-3.5 text-[#A88B54]" />
                                                                                    <span>
                                                                                        Buka
                                                                                        Video
                                                                                    </span>
                                                                                    <ExternalLinkIcon className="size-3 text-[#A88B54]" />
                                                                                </a>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        void navigator.clipboard?.writeText(
                                                                                            absoluteGreetingUrl,
                                                                                        );
                                                                                        toast.success(
                                                                                            'Tautan QR ucapan disalin.',
                                                                                        );
                                                                                    }}
                                                                                    className="inline-flex items-center gap-1 rounded-full border border-[#A88B54]/40 bg-white px-3 py-1.5 font-sans text-[11px] font-medium text-[#16233B] hover:border-[#16233B]"
                                                                                >
                                                                                    <CopyIcon className="size-3 text-[#A88B54]" />
                                                                                    Salin
                                                                                    Link
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                    </div>

                                                    {/* Daftar Item Pesanan */}
                                                    <div className="mt-6 border-t border-[#A88B54]/20 pt-4">
                                                        <p className="font-sans text-[11px] font-semibold tracking-wider text-[#6E675D] uppercase">
                                                            Rincian Bingkisan
                                                        </p>
                                                        <ul className="mt-2.5 divide-y divide-[#A88B54]/15">
                                                            {order.items.map(
                                                                (item) => (
                                                                    <li
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        className="flex flex-wrap items-center justify-between gap-2 py-2.5 font-sans text-xs sm:text-sm"
                                                                    >
                                                                        <div className="min-w-0">
                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                <span className="font-semibold text-[#16233B]">
                                                                                    {
                                                                                        item.product_name
                                                                                    }
                                                                                </span>
                                                                                {item.is_custom_b2b && (
                                                                                    <span className="rounded-full bg-[#16233B] px-2.5 py-0.5 text-[10px] font-semibold text-[#F2EBDC]">
                                                                                        Custom
                                                                                        3D
                                                                                    </span>
                                                                                )}
                                                                                <span className="text-[#6E675D]">
                                                                                    ×{' '}
                                                                                    {
                                                                                        item.quantity
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            {item.is_custom_b2b &&
                                                                                Array.isArray(
                                                                                    item
                                                                                        .custom_config
                                                                                        ?.items,
                                                                                ) &&
                                                                                item
                                                                                    .custom_config
                                                                                    .items
                                                                                    .length >
                                                                                    0 && (
                                                                                    <p className="mt-1 font-sans text-[11px] text-[#6E675D]">
                                                                                        Isi
                                                                                        Parsel:{' '}
                                                                                        {item.custom_config.items
                                                                                            .map(
                                                                                                (
                                                                                                    p,
                                                                                                ) =>
                                                                                                    p.name,
                                                                                            )
                                                                                            .join(
                                                                                                ', ',
                                                                                            )}
                                                                                    </p>
                                                                                )}
                                                                        </div>
                                                                        <span className="font-serif text-sm font-semibold text-[#16233B]">
                                                                            {formatRupiah(
                                                                                item.subtotal,
                                                                            )}
                                                                        </span>
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </StorefrontLayout>

            {/* ── Modal Tambah / Edit Alamat ─────────────────────────────────── */}
            <Dialog open={addressModalOpen} onOpenChange={setAddressModalOpen}>
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-[#A88B54]/40 bg-[#FAF7F0] text-[#16233B]">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-normal text-[#16233B]">
                            {editingAddress
                                ? 'Edit Alamat Pengiriman'
                                : 'Tambah Alamat Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        id="address-form"
                        onSubmit={handleAddressSubmit}
                        className="space-y-4 pt-2"
                    >
                        <div>
                            <label
                                htmlFor="addr_label"
                                className="block font-sans text-xs font-semibold text-[#16233B]"
                            >
                                Label Alamat *
                            </label>
                            <input
                                id="addr_label"
                                type="text"
                                required
                                value={addressForm.data.label}
                                onChange={(e) =>
                                    addressForm.setData('label', e.target.value)
                                }
                                placeholder="cth. Rumah, Kantor Pusat, Klien VIP"
                                className="mt-1 w-full rounded-xl border border-[#A88B54]/35 bg-white px-3.5 py-2 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B]"
                            />
                            {addressForm.errors.label && (
                                <p className="mt-1 font-sans text-xs text-red-600">
                                    {addressForm.errors.label}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="addr_name"
                                    className="block font-sans text-xs font-semibold text-[#16233B]"
                                >
                                    Nama Penerima *
                                </label>
                                <input
                                    id="addr_name"
                                    type="text"
                                    required
                                    value={addressForm.data.recipient_name}
                                    onChange={(e) =>
                                        addressForm.setData(
                                            'recipient_name',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-xl border border-[#A88B54]/35 bg-white px-3.5 py-2 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B]"
                                />
                                {addressForm.errors.recipient_name && (
                                    <p className="mt-1 font-sans text-xs text-red-600">
                                        {addressForm.errors.recipient_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="addr_phone"
                                    className="block font-sans text-xs font-semibold text-[#16233B]"
                                >
                                    Telepon Penerima *
                                </label>
                                <input
                                    id="addr_phone"
                                    type="tel"
                                    required
                                    value={addressForm.data.recipient_phone}
                                    onChange={(e) =>
                                        addressForm.setData(
                                            'recipient_phone',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-xl border border-[#A88B54]/35 bg-white px-3.5 py-2 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B]"
                                />
                                {addressForm.errors.recipient_phone && (
                                    <p className="mt-1 font-sans text-xs text-red-600">
                                        {addressForm.errors.recipient_phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="addr_line"
                                className="block font-sans text-xs font-semibold text-[#16233B]"
                            >
                                Alamat Lengkap *
                            </label>
                            <textarea
                                id="addr_line"
                                rows={3}
                                required
                                value={addressForm.data.address_line}
                                onChange={(e) =>
                                    addressForm.setData(
                                        'address_line',
                                        e.target.value,
                                    )
                                }
                                placeholder="Nama jalan, nomor rumah/gedung, patokan..."
                                className="mt-1 w-full rounded-xl border border-[#A88B54]/35 bg-white px-3.5 py-2 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B]"
                            />
                            {addressForm.errors.address_line && (
                                <p className="mt-1 font-sans text-xs text-red-600">
                                    {addressForm.errors.address_line}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="addr_city"
                                    className="block font-sans text-xs font-semibold text-[#16233B]"
                                >
                                    Kota / Kabupaten *
                                </label>
                                <input
                                    id="addr_city"
                                    type="text"
                                    required
                                    value={addressForm.data.city}
                                    onChange={(e) =>
                                        addressForm.setData(
                                            'city',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Jakarta Selatan"
                                    className="mt-1 w-full rounded-xl border border-[#A88B54]/35 bg-white px-3.5 py-2 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B]"
                                />
                                {addressForm.errors.city && (
                                    <p className="mt-1 font-sans text-xs text-red-600">
                                        {addressForm.errors.city}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="addr_postal"
                                    className="block font-sans text-xs font-semibold text-[#16233B]"
                                >
                                    Kode Pos *
                                </label>
                                <input
                                    id="addr_postal"
                                    type="text"
                                    required
                                    value={addressForm.data.postal_code}
                                    onChange={(e) =>
                                        addressForm.setData(
                                            'postal_code',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="12110"
                                    className="mt-1 w-full rounded-xl border border-[#A88B54]/35 bg-white px-3.5 py-2 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B]"
                                />
                                {addressForm.errors.postal_code && (
                                    <p className="mt-1 font-sans text-xs text-red-600">
                                        {addressForm.errors.postal_code}
                                    </p>
                                )}
                            </div>
                        </div>

                        <label className="flex cursor-pointer items-center gap-2.5 pt-1 font-sans text-xs font-medium text-[#16233B]">
                            <input
                                type="checkbox"
                                checked={addressForm.data.is_default}
                                onChange={(e) =>
                                    addressForm.setData(
                                        'is_default',
                                        e.target.checked,
                                    )
                                }
                                className="size-4 rounded border-[#A88B54] accent-[#16233B]"
                            />
                            <span>Jadikan sebagai alamat utama</span>
                        </label>
                    </form>

                    <DialogFooter className="pt-2">
                        <button
                            type="button"
                            onClick={() => setAddressModalOpen(false)}
                            className="rounded-full border border-[#A88B54]/40 px-5 py-2 font-sans text-xs font-semibold text-[#16233B] hover:bg-white"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            form="address-form"
                            disabled={addressForm.processing}
                            className="inline-flex items-center gap-2 rounded-full bg-[#16233B] px-6 py-2 font-sans text-xs font-semibold text-[#F2EBDC] hover:bg-[#1F304F] disabled:opacity-60"
                        >
                            {addressForm.processing && (
                                <Spinner className="size-3.5" />
                            )}
                            {editingAddress ? 'Simpan Alamat' : 'Tambah Alamat'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Modal Konfirmasi Hapus Alamat ─────────────────────────────── */}
            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent className="max-w-sm border-[#A88B54]/40 bg-[#FAF7F0] text-[#16233B]">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl font-normal text-[#16233B]">
                            Hapus Alamat?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="font-sans text-sm text-[#6E675D]">
                        Alamat{' '}
                        <strong className="text-[#16233B]">
                            {deleteTarget?.label}
                        </strong>{' '}
                        ({deleteTarget?.recipient_name}) akan dihapus dari buku
                        alamat Anda.
                    </p>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-full border border-[#A88B54]/40 px-5 py-2 font-sans text-xs font-semibold text-[#16233B]"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteAddress}
                            className="rounded-full bg-red-700 px-5 py-2 font-sans text-xs font-semibold text-white hover:bg-red-800"
                        >
                            Hapus Alamat
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
