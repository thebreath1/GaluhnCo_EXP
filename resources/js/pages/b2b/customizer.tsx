import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    Building2Icon,
    CheckIcon,
    LockIcon,
    PackageIcon,
    PackageOpenIcon,
    PlusIcon,
    RotateCwIcon,
    ShoppingBagIcon,
    SparklesIcon,
    Trash2Icon,
    UploadCloudIcon,
    VideoIcon,
    XIcon,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';
import B2BCustomizerController from '@/actions/App/Http/Controllers/B2BCustomizerController';
import CartController from '@/actions/App/Http/Controllers/CartController';
import type {
    ParcelCatalogItem,
    ParcelItemId,
} from '@/components/b2b/parcel-catalog';
import {
    BASE_BOX_PRICE,
    MAX_PARCEL_SLOTS,
    PARCEL_ITEMS,
    QUICK_PRESETS,
} from '@/components/b2b/parcel-catalog';
import { Spinner } from '@/components/ui/spinner';
import { home, login, register } from '@/routes';
import type { SharedPageProps } from '@/types';

const GiftBox3DCanvas = lazy(() => import('@/components/b2b/GiftBox3DCanvas'));

const BOX_COLORS = [
    { name: 'Deep Navy', value: '#16233B' },
    { name: 'Warm Ivory', value: '#F2EBDC' },
    { name: 'Soft Navy', value: '#1E2F4D' },
] as const;

const RIBBON_COLORS = [
    { name: 'Muted Brass', value: '#A88B54' },
    { name: 'Champagne', value: '#D8C39E' },
    { name: 'Silver', value: '#C8CDD5' },
] as const;

type PanelTab = 'design' | 'contents';

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function GiftBoxCustomizer({
    isB2B = false,
}: {
    isB2B?: boolean;
}) {
    const { auth, cartCount } = usePage<SharedPageProps>().props;
    const isLoggedIn = Boolean(auth?.user);
    const minQuantity = isB2B ? 10 : 1;

    const [activeTab, setActiveTab] = useState<PanelTab>('design');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [title, setTitle] = useState(
        isB2B ? 'Corporate Executive Custom Box' : 'Personal Luxury Custom Box',
    );
    const [boxColor, setBoxColor] = useState<string>(BOX_COLORS[0].value);
    const [ribbonColor, setRibbonColor] = useState<string>(
        RIBBON_COLORS[0].value,
    );
    const [slots, setSlots] = useState<Array<ParcelItemId | null>>(() => [
        ...QUICK_PRESETS[0].slots,
    ]);
    const [activeSlotIndex, setActiveSlotIndex] = useState<number>(4);
    const [quantity, setQuantity] = useState<number>(isB2B ? 20 : 1);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
    const [autoRotate, setAutoRotate] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        return () => {
            if (logoPreviewUrl) {
                URL.revokeObjectURL(logoPreviewUrl);
            }
        };
    }, [logoPreviewUrl]);

    const handleTabChange = (tab: PanelTab) => {
        setActiveTab(tab);
        if (tab === 'contents') {
            setIsOpen(true);
        }
    };

    const handleSelectCatalogItem = (catalogItem: ParcelCatalogItem) => {
        setIsOpen(true);
        const nextSlots = [...slots];
        const targetIndex =
            activeSlotIndex >= 0 && activeSlotIndex < MAX_PARCEL_SLOTS
                ? activeSlotIndex
                : nextSlots.findIndex((s) => s === null);

        const resolvedIndex = targetIndex === -1 ? 0 : targetIndex;
        nextSlots[resolvedIndex] = catalogItem.id;
        setSlots(nextSlots);

        const nextEmpty = nextSlots.findIndex((s) => s === null);
        setActiveSlotIndex(
            nextEmpty !== -1
                ? nextEmpty
                : (resolvedIndex + 1) % MAX_PARCEL_SLOTS,
        );
    };

    const handleClearSlot = (index: number) => {
        const nextSlots = [...slots];
        nextSlots[index] = null;
        setSlots(nextSlots);
        setActiveSlotIndex(index);
    };

    const handleApplyPreset = (presetSlots: Array<ParcelItemId | null>) => {
        setIsOpen(true);
        setSlots([...presetSlots]);
        const nextEmpty = presetSlots.findIndex((s) => s === null);
        setActiveSlotIndex(nextEmpty !== -1 ? nextEmpty : 0);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isB2B) {
            return;
        }
        const file = e.target.files?.[0] ?? null;
        if (!file) {
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran file logo maksimal 2MB.');
            return;
        }
        if (logoPreviewUrl) {
            URL.revokeObjectURL(logoPreviewUrl);
        }
        setLogoFile(file);
        setLogoPreviewUrl(URL.createObjectURL(file));
    };

    const handleClearLogo = () => {
        if (logoPreviewUrl) {
            URL.revokeObjectURL(logoPreviewUrl);
        }
        setLogoFile(null);
        setLogoPreviewUrl(null);
    };

    const selectedEntries = slots
        .map((id, slotIndex) => {
            if (!id) {
                return null;
            }
            const item = PARCEL_ITEMS.find((p) => p.id === id);
            return item ? { ...item, slot: slotIndex } : null;
        })
        .filter(
            (entry): entry is ParcelCatalogItem & { slot: number } =>
                entry !== null,
        );

    const itemsTotal = selectedEntries.reduce(
        (sum, entry) => sum + entry.price,
        0,
    );
    const unitPrice = BASE_BOX_PRICE + itemsTotal;
    const safeQty = Math.max(minQuantity, quantity || minQuantity);
    const totalEstimate = unitPrice * safeQty;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoggedIn) {
            toast.info(
                'Silakan masuk terlebih dahulu untuk menyimpan konfigurasi ke keranjang.',
            );
            router.visit(login().url);
            return;
        }

        if (selectedEntries.length === 0) {
            setActiveTab('contents');
            setIsOpen(true);
            toast.error(
                'Pilih minimal 1 item isi parsel di dalam kotak sebelum menambahkan ke keranjang.',
            );
            return;
        }

        if (quantity < minQuantity) {
            toast.error(
                isB2B
                    ? 'Minimal pemesanan Corporate B2B (MOQ) adalah 10 box.'
                    : 'Minimal pemesanan adalah 1 box.',
            );
            return;
        }

        const payload = new FormData();
        payload.append(
            'title',
            title.trim() ||
                (isB2B
                    ? 'Corporate Executive Custom Box'
                    : 'Personal Luxury Custom Box'),
        );
        payload.append('box_color', boxColor);
        payload.append('ribbon_color', ribbonColor);
        payload.append(
            'package_tier',
            `Custom ${selectedEntries.length} Item Pilihan`,
        );
        payload.append('quantity', String(quantity));
        payload.append('unit_price', String(unitPrice));

        selectedEntries.forEach((entry, idx) => {
            payload.append(`items[${idx}][id]`, entry.id);
            payload.append(`items[${idx}][name]`, entry.name);
            payload.append(`items[${idx}][price]`, String(entry.price));
            payload.append(`items[${idx}][slot]`, String(entry.slot));
            payload.append(`items[${idx}][category]`, entry.category);
        });

        if (isB2B && logoFile) {
            payload.append('logo', logoFile);
        }

        setSubmitting(true);
        router.post(B2BCustomizerController.addToCart().url, payload, {
            forceFormData: true,
            onSuccess: () => {
                toast.success(
                    'Konfigurasi 3D Gift Box berhasil ditambahkan ke keranjang!',
                );
            },
            onError: () => {
                toast.error(
                    `Gagal menyimpan konfigurasi. Periksa kembali isian Anda (min. ${minQuantity} box & min. 1 item).`,
                );
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <>
            <Head title="3D Luxury Gift Box Customizer — Galuh & Co." />

            <div className="min-h-screen bg-[#F2EBDC] font-sans text-[#16233B] antialiased selection:bg-[#A88B54]/25 selection:text-[#16233B]">
                {/* Minimal Floating Studio Header */}
                <header className="sticky top-3 z-40 px-4 sm:px-6">
                    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full border border-[#A88B54]/40 bg-[#16233B]/95 px-4 shadow-[0_8px_28px_rgba(22,35,59,0.28)] backdrop-blur-xl sm:px-6">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-wider text-[#F2EBDC] uppercase transition-colors hover:text-[#A88B54]"
                        >
                            <ArrowLeftIcon className="size-4" />
                            <span>Kembali</span>
                        </Link>

                        <Link
                            href={home()}
                            aria-label="Galuh & Co. — 3D Studio"
                            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
                        >
                            <img
                                src="/Asset/Logo/Logo_galu&co.png"
                                alt="Galuh & Co."
                                className="h-6 w-auto object-contain sm:h-7"
                            />
                            <span
                                aria-hidden="true"
                                className="hidden h-4 w-px bg-[#A88B54]/45 sm:inline-block"
                            />
                            <span className="hidden font-sans text-[11px] font-semibold tracking-[0.22em] text-[#A88B54] uppercase sm:inline">
                                3D STUDIO
                            </span>
                        </Link>

                        <Link
                            href={isLoggedIn ? CartController.index() : login()}
                            aria-label="Keranjang Belanja"
                            className="relative inline-flex items-center gap-1.5 rounded-full bg-[#F2EBDC] px-3.5 py-1.5 font-sans text-xs font-semibold text-[#16233B] transition-colors hover:bg-white"
                        >
                            <ShoppingBagIcon className="size-3.5" />
                            <span className="hidden sm:inline">Keranjang</span>
                            {cartCount > 0 && (
                                <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#16233B] px-1 text-[10px] font-bold text-[#F2EBDC]">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-6 md:py-8">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#A88B54]/40 bg-[#16233B] px-3.5 py-1 text-[11px] font-semibold tracking-wider text-[#F2EBDC] uppercase">
                                {isB2B ? (
                                    <Building2Icon className="size-3.5 text-[#A88B54]" />
                                ) : (
                                    <SparklesIcon className="size-3.5 text-[#A88B54]" />
                                )}
                                {isB2B
                                    ? 'Studio Kustomisasi Corporate (B2B)'
                                    : 'Studio Kustomisasi Gift Box 3D'}
                            </div>
                            <h1 className="mt-3 font-serif text-3xl font-normal text-[#16233B] sm:text-4xl">
                                3D Luxury Gift Box Customizer
                            </h1>
                            <p className="mt-1.5 font-sans text-xs text-[#6E675D] sm:text-sm">
                                {isB2B
                                    ? 'Buka tutup kotak, pilih hingga 6 isi parsel 3D secara langsung, dan unggah logo perusahaan Anda (MOQ min. 10 box).'
                                    : 'Buka tutup kotak dan rangkai hingga 6 isi parsel mewah secara interaktif 3D, mulai dari 1 kotak.'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                        {/* Kiri: Interactive 3D Viewport (Lazy Loaded) */}
                        <div className="lg:sticky lg:top-20 lg:col-span-7">
                            <div className="relative overflow-hidden rounded-3xl border border-[#A88B54]/40 bg-[#16233B] shadow-[0_24px_60px_-15px_rgba(22,35,59,0.45)]">
                                {/* Studio Header Bar */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#A88B54]/25 px-5 py-3.5 text-xs text-[#F2EBDC]">
                                    <div className="flex items-center gap-2">
                                        <SparklesIcon className="size-4 text-[#A88B54]" />
                                        <span className="font-serif text-base font-normal">
                                            Pratinjau 3D (
                                            {selectedEntries.length}/
                                            {MAX_PARCEL_SLOTS} Isi)
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsOpen((prev) => !prev)
                                            }
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 font-sans text-[11px] font-semibold transition-colors ${
                                                isOpen
                                                    ? 'border-[#A88B54] bg-[#A88B54] text-[#16233B]'
                                                    : 'border-[#A88B54]/60 bg-[#1E2F4D] text-[#F2EBDC] hover:border-[#A88B54]'
                                            }`}
                                        >
                                            {isOpen ? (
                                                <PackageIcon className="size-3.5" />
                                            ) : (
                                                <PackageOpenIcon className="size-3.5 text-[#A88B54]" />
                                            )}
                                            {isOpen
                                                ? 'Tutup Box'
                                                : 'Buka Tutup Box'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAutoRotate((prev) => !prev)
                                            }
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-[11px] font-medium transition-colors ${
                                                autoRotate
                                                    ? 'border-[#A88B54]/60 bg-[#A88B54]/20 text-[#F2EBDC]'
                                                    : 'border-[#F2EBDC]/25 text-[#F2EBDC]/75 hover:text-[#F2EBDC]'
                                            }`}
                                        >
                                            <RotateCwIcon className="size-3" />
                                            {autoRotate
                                                ? 'Auto-Rotate'
                                                : 'Diam'}
                                        </button>
                                    </div>
                                </div>

                                {/* 3D Canvas Container */}
                                <div className="relative h-[400px] w-full bg-gradient-to-b from-[#1E2F4D] to-[#16233B] sm:h-[490px]">
                                    <Suspense
                                        fallback={
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#F2EBDC]">
                                                <Spinner className="size-7 text-[#A88B54]" />
                                                <span className="font-sans text-xs text-[#F2EBDC]/80">
                                                    Memuat Studio 3D Luxury
                                                    Box...
                                                </span>
                                            </div>
                                        }
                                    >
                                        <GiftBox3DCanvas
                                            boxColor={boxColor}
                                            ribbonColor={ribbonColor}
                                            logoPreviewUrl={
                                                isB2B ? logoPreviewUrl : null
                                            }
                                            isOpen={isOpen}
                                            slots={slots}
                                            activeSlotIndex={
                                                activeTab === 'contents'
                                                    ? activeSlotIndex
                                                    : null
                                            }
                                            autoRotate={autoRotate}
                                        />
                                    </Suspense>

                                    <div className="pointer-events-none absolute right-4 bottom-4 left-4 flex justify-between text-[11px] text-[#F2EBDC]/75">
                                        <span>
                                            Seret untuk memutar 360° · Scroll
                                            untuk zoom
                                        </span>
                                        <span>
                                            {isOpen
                                                ? 'Kotak Terbuka'
                                                : 'Kotak Tertutup'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kanan: Panel Konfigurasi 2 Tab */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 rounded-3xl border border-[#A88B54]/30 bg-[#FAF7F0] p-6 shadow-[0_14px_34px_-12px_rgba(22,35,59,0.12)] sm:p-7 lg:col-span-5"
                        >
                            {/* Tabs Header */}
                            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#A88B54]/25 bg-white/70 p-1.5">
                                <button
                                    type="button"
                                    onClick={() => handleTabChange('design')}
                                    className={`rounded-xl py-2.5 font-sans text-xs font-semibold transition-all ${
                                        activeTab === 'design'
                                            ? 'bg-[#16233B] text-[#F2EBDC] shadow-sm'
                                            : 'text-[#6E675D] hover:text-[#16233B]'
                                    }`}
                                >
                                    1. Desain Box &amp; Pita
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTabChange('contents')}
                                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-sans text-xs font-semibold transition-all ${
                                        activeTab === 'contents'
                                            ? 'bg-[#16233B] text-[#F2EBDC] shadow-sm'
                                            : 'text-[#6E675D] hover:text-[#16233B]'
                                    }`}
                                >
                                    <span>2. Isi Parsel</span>
                                    <span
                                        className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                                            activeTab === 'contents'
                                                ? 'bg-[#A88B54] text-[#16233B]'
                                                : 'bg-[#16233B]/10 text-[#16233B]'
                                        }`}
                                    >
                                        {selectedEntries.length}/
                                        {MAX_PARCEL_SLOTS}
                                    </span>
                                </button>
                            </div>

                            {activeTab === 'design' ? (
                                <div className="space-y-5">
                                    {/* Nama Proyek */}
                                    <div>
                                        <label
                                            htmlFor="b2b_title"
                                            className="block font-sans text-xs font-semibold text-[#16233B]"
                                        >
                                            Nama Bingkisan / Edisi Kustom *
                                        </label>
                                        <input
                                            id="b2b_title"
                                            type="text"
                                            required
                                            maxLength={150}
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                            className="mt-1.5 w-full rounded-xl border border-[#A88B54]/35 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] outline-none focus:border-[#16233B]"
                                        />
                                    </div>

                                    {/* Warna Kotak */}
                                    <div>
                                        <span className="block font-sans text-xs font-semibold text-[#16233B]">
                                            Pilih Warna Hardbox
                                        </span>
                                        <div className="mt-2 grid grid-cols-3 gap-2.5">
                                            {BOX_COLORS.map((color) => {
                                                const active =
                                                    boxColor === color.value;
                                                return (
                                                    <button
                                                        key={color.value}
                                                        type="button"
                                                        onClick={() =>
                                                            setBoxColor(
                                                                color.value,
                                                            )
                                                        }
                                                        className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all ${
                                                            active
                                                                ? 'border-[#16233B] bg-white shadow-sm ring-1 ring-[#16233B]'
                                                                : 'border-[#A88B54]/25 bg-white/60 hover:border-[#A88B54]'
                                                        }`}
                                                    >
                                                        <span
                                                            className="flex size-7 items-center justify-center rounded-full border border-black/15 shadow-xs"
                                                            style={{
                                                                backgroundColor:
                                                                    color.value,
                                                            }}
                                                        >
                                                            {active && (
                                                                <CheckIcon
                                                                    className={`size-3.5 ${
                                                                        color.value ===
                                                                        '#F2EBDC'
                                                                            ? 'text-[#16233B]'
                                                                            : 'text-[#F2EBDC]'
                                                                    }`}
                                                                />
                                                            )}
                                                        </span>
                                                        <span className="font-sans text-[11px] font-semibold text-[#16233B]">
                                                            {color.name}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Warna Pita */}
                                    <div>
                                        <span className="block font-sans text-xs font-semibold text-[#16233B]">
                                            Pilih Warna Pita Satin
                                        </span>
                                        <div className="mt-2 grid grid-cols-3 gap-2.5">
                                            {RIBBON_COLORS.map((ribbon) => {
                                                const active =
                                                    ribbonColor ===
                                                    ribbon.value;
                                                return (
                                                    <button
                                                        key={ribbon.value}
                                                        type="button"
                                                        onClick={() =>
                                                            setRibbonColor(
                                                                ribbon.value,
                                                            )
                                                        }
                                                        className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all ${
                                                            active
                                                                ? 'border-[#16233B] bg-white shadow-sm ring-1 ring-[#16233B]'
                                                                : 'border-[#A88B54]/25 bg-white/60 hover:border-[#A88B54]'
                                                        }`}
                                                    >
                                                        <span
                                                            className="flex size-7 items-center justify-center rounded-full border border-black/15 shadow-xs"
                                                            style={{
                                                                backgroundColor:
                                                                    ribbon.value,
                                                            }}
                                                        >
                                                            {active && (
                                                                <CheckIcon className="size-3.5 text-[#16233B]" />
                                                            )}
                                                        </span>
                                                        <span className="font-sans text-[11px] font-semibold text-[#16233B]">
                                                            {ribbon.name}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Unggah Logo Perusahaan (Aktif hanya untuk B2B) */}
                                    <div>
                                        <span className="block font-sans text-xs font-semibold text-[#16233B]">
                                            Logo Perusahaan pada Tutup Kotak
                                        </span>
                                        {isB2B ? (
                                            <div className="mt-2 flex items-center gap-3">
                                                <label
                                                    htmlFor="b2b_logo"
                                                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#A88B54]/50 bg-white px-4 py-3 font-sans text-xs font-medium text-[#16233B] transition-colors hover:border-[#16233B]"
                                                >
                                                    <UploadCloudIcon className="size-4 text-[#A88B54]" />
                                                    <span className="truncate">
                                                        {logoFile
                                                            ? logoFile.name
                                                            : 'Unggah Logo (PNG/JPG · Maks 2MB)'}
                                                    </span>
                                                    <input
                                                        id="b2b_logo"
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/webp"
                                                        onChange={
                                                            handleLogoChange
                                                        }
                                                        className="sr-only"
                                                    />
                                                </label>
                                                {logoFile && (
                                                    <button
                                                        type="button"
                                                        aria-label="Hapus logo"
                                                        onClick={
                                                            handleClearLogo
                                                        }
                                                        className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 hover:bg-red-100"
                                                    >
                                                        <Trash2Icon className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-2 rounded-2xl border border-[#A88B54]/40 bg-[#16233B] p-4 text-[#F2EBDC]">
                                                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#A88B54]/45 bg-[#1E2F4D] px-2.5 py-0.5 font-sans text-[10px] font-semibold tracking-wider text-[#A88B54] uppercase">
                                                    <LockIcon className="size-3" />
                                                    Eksklusif Akun Corporate /
                                                    B2B
                                                </div>
                                                <p className="mt-2 font-sans text-xs leading-relaxed text-[#F2EBDC]/85">
                                                    Unggah logo perusahaan pada
                                                    tutup kotak 3D serta fitur{' '}
                                                    <span className="inline-flex items-center gap-1 font-semibold text-[#A88B54]">
                                                        <VideoIcon className="size-3" />
                                                        Video Ucapan QR Code
                                                    </span>{' '}
                                                    saat checkout tersedia
                                                    khusus untuk akun Corporate
                                                    (B2B).
                                                </p>
                                                <Link
                                                    href={register()}
                                                    className="mt-2.5 inline-flex items-center font-sans text-[11px] font-semibold text-[#A88B54] underline decoration-[#A88B54]/60 underline-offset-4 hover:text-[#F2EBDC]"
                                                >
                                                    Daftar Akun Corporate (B2B)
                                                    &rarr;
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleTabChange('contents')
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#A88B54] bg-white py-2.5 font-sans text-xs font-semibold text-[#16233B] transition-colors hover:bg-[#16233B] hover:text-[#F2EBDC]"
                                    >
                                        <PackageOpenIcon className="size-4 text-[#A88B54]" />
                                        Lanjut Pilih Isi Parsel (6 Slot) &rarr;
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Preset Kurasi Cepat */}
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-sans text-xs font-semibold text-[#16233B]">
                                                Paket Kurasi Cepat
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSlots(
                                                        Array.from(
                                                            {
                                                                length: MAX_PARCEL_SLOTS,
                                                            },
                                                            () => null,
                                                        ),
                                                    );
                                                    setActiveSlotIndex(0);
                                                }}
                                                className="font-sans text-[11px] font-medium text-[#6E675D] underline hover:text-[#16233B]"
                                            >
                                                Kosongkan Semua
                                            </button>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {QUICK_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleApplyPreset(
                                                            preset.slots,
                                                        )
                                                    }
                                                    title={preset.desc}
                                                    className="rounded-full border border-[#A88B54]/40 bg-white px-3 py-1 font-sans text-[11px] font-semibold text-[#16233B] transition-colors hover:bg-[#16233B] hover:text-[#F2EBDC]"
                                                >
                                                    {preset.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Grid 6 Slot Kompartemen */}
                                    <div>
                                        <span className="block font-sans text-xs font-semibold text-[#16233B]">
                                            Kompartemen Box (Pilih Slot Target)
                                        </span>
                                        <div className="mt-2 grid grid-cols-3 gap-2">
                                            {slots.map((itemId, idx) => {
                                                const item = itemId
                                                    ? PARCEL_ITEMS.find(
                                                          (p) =>
                                                              p.id === itemId,
                                                      )
                                                    : null;
                                                const isActive =
                                                    activeSlotIndex === idx;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`relative rounded-xl border p-2 text-left transition-all ${
                                                            isActive
                                                                ? 'border-[#16233B] bg-white ring-1 ring-[#16233B]'
                                                                : item
                                                                  ? 'border-[#A88B54]/45 bg-white/80'
                                                                  : 'border-dashed border-[#A88B54]/40 bg-white/40'
                                                        }`}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsOpen(true);
                                                                setActiveSlotIndex(
                                                                    idx,
                                                                );
                                                            }}
                                                            className="w-full text-left"
                                                        >
                                                            <span className="block font-sans text-[10px] font-semibold text-[#6E675D]">
                                                                Slot {idx + 1}
                                                            </span>
                                                            <span className="mt-0.5 line-clamp-2 min-h-[28px] font-serif text-xs leading-tight font-semibold text-[#16233B]">
                                                                {item
                                                                    ? item.name
                                                                    : 'Kosong'}
                                                            </span>
                                                        </button>
                                                        {item && (
                                                            <button
                                                                type="button"
                                                                aria-label={`Kosongkan slot ${idx + 1}`}
                                                                onClick={() =>
                                                                    handleClearSlot(
                                                                        idx,
                                                                    )
                                                                }
                                                                className="absolute top-1.5 right-1.5 rounded-full p-0.5 text-[#6E675D] hover:bg-red-50 hover:text-red-700"
                                                            >
                                                                <XIcon className="size-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Katalog Item Isi Parsel */}
                                    <div>
                                        <span className="block font-sans text-xs font-semibold text-[#16233B]">
                                            Katalog Item Parsel (Klik untuk Isi
                                            Slot {activeSlotIndex + 1})
                                        </span>
                                        <div className="mt-2 max-h-[250px] space-y-2 overflow-y-auto pr-1">
                                            {PARCEL_ITEMS.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectCatalogItem(
                                                            item,
                                                        )
                                                    }
                                                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#A88B54]/25 bg-white p-3 text-left transition-all hover:border-[#16233B] hover:shadow-xs"
                                                >
                                                    <div className="min-w-0">
                                                        <span className="inline-block rounded bg-[#16233B]/8 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-[#16233B]">
                                                            {item.category}
                                                        </span>
                                                        <p className="mt-1 font-serif text-sm font-semibold text-[#16233B]">
                                                            {item.name}
                                                        </p>
                                                        <p className="font-sans text-[11px] text-[#6E675D]">
                                                            {item.shortDesc}
                                                        </p>
                                                    </div>
                                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                                        <span className="font-serif text-sm font-semibold text-[#16233B]">
                                                            {formatRupiah(
                                                                item.price,
                                                            )}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#16233B] px-2.5 py-0.5 font-sans text-[10px] font-semibold text-[#F2EBDC]">
                                                            <PlusIcon className="size-2.5 text-[#A88B54]" />
                                                            Pilih
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Kuantitas & Kalkulasi Harga Otomatis */}
                            <div className="space-y-4 border-t border-[#A88B54]/25 pt-4">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="b2b_qty"
                                            className="font-sans text-xs font-semibold text-[#16233B]"
                                        >
                                            Jumlah Pesanan *
                                        </label>
                                        <span className="rounded-full bg-[#16233B] px-2.5 py-0.5 font-sans text-[10px] font-semibold text-[#F2EBDC]">
                                            {isB2B
                                                ? 'MOQ Min. 10 Box'
                                                : 'Min. 1 Box'}
                                        </span>
                                    </div>
                                    <input
                                        id="b2b_qty"
                                        type="number"
                                        min={minQuantity}
                                        max={5000}
                                        required
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(
                                                Number.parseInt(
                                                    e.target.value ||
                                                        String(minQuantity),
                                                    10,
                                                ),
                                            )
                                        }
                                        className="mt-1.5 w-full rounded-xl border border-[#A88B54]/35 bg-white px-4 py-2 font-sans text-sm font-semibold text-[#16233B] outline-none focus:border-[#16233B]"
                                    />
                                </div>

                                <div className="space-y-1.5 rounded-2xl border border-[#A88B54]/25 bg-white/80 p-3.5 font-sans text-xs">
                                    <div className="flex justify-between text-[#6E675D]">
                                        <span>Hardbox Mewah &amp; Pita</span>
                                        <span className="font-semibold text-[#16233B]">
                                            {formatRupiah(BASE_BOX_PRICE)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[#6E675D]">
                                        <span>
                                            Total {selectedEntries.length} Item
                                            Isi
                                        </span>
                                        <span className="font-semibold text-[#16233B]">
                                            {formatRupiah(itemsTotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-[#A88B54]/20 pt-1.5 text-[#16233B]">
                                        <span className="font-semibold">
                                            Harga per Box
                                        </span>
                                        <span className="font-serif text-base font-semibold">
                                            {formatRupiah(unitPrice)}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline justify-between pt-1">
                                        <span className="font-medium text-[#6E675D]">
                                            Estimasi Total ({safeQty} box)
                                        </span>
                                        <span className="font-serif text-2xl font-semibold text-[#16233B]">
                                            {formatRupiah(totalEstimate)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        submitting ||
                                        selectedEntries.length === 0
                                    }
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#16233B] px-6 py-3.5 font-sans text-sm font-semibold tracking-wide text-[#F2EBDC] shadow-md transition-colors hover:bg-[#1F304F] disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <Spinner className="size-4" />
                                    ) : (
                                        <ShoppingBagIcon className="size-4 text-[#A88B54]" />
                                    )}
                                    {submitting
                                        ? 'Menyimpan ke Keranjang...'
                                        : isLoggedIn
                                          ? 'Tambahkan Custom Box ke Keranjang'
                                          : 'Masuk untuk Memesan Custom Box'}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}
