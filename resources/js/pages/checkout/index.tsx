import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    Building2Icon,
    CheckCircle2Icon,
    CreditCardIcon,
    FileTextIcon,
    LockIcon,
    MapPinIcon,
    PlusIcon,
    SparklesIcon,
    TagIcon,
    UploadCloudIcon,
    VideoIcon,
    XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AccountController from '@/actions/App/Http/Controllers/AccountController';
import CartController from '@/actions/App/Http/Controllers/CartController';
import CheckoutController from '@/actions/App/Http/Controllers/CheckoutController';
import type { StoredParcelItem } from '@/components/b2b/parcel-catalog';
import { Spinner } from '@/components/ui/spinner';
import { home } from '@/routes';
import type { SharedPageProps } from '@/types';

interface CheckoutCartItem {
    id: number;
    product_id: number | null;
    is_custom_b2b: boolean;
    custom_config: {
        title?: string;
        package_tier?: string;
        items?: StoredParcelItem[];
    } | null;
    quantity: number;
    original_unit_price?: number;
    unit_price: string | number;
    item_discount_total?: number;
    subtotal?: number;
    active_promo?: {
        id: number;
        name: string;
        badge_text: string | null;
        discount_type: string;
        discount_value: number;
        discount_label: string;
        ends_at: string | null;
    } | null;
    product?: {
        id: number;
        name: string;
        category: string;
    } | null;
}

interface AddressOption {
    id: number;
    label: string;
    recipient_name: string;
    recipient_phone: string;
    address_line: string;
    city: string;
    postal_code: string;
    is_default: boolean;
}

interface CheckoutProps {
    items: CheckoutCartItem[];
    items_original_subtotal?: number;
    items_discount_total?: number;
    subtotal: number;
    applied_promotion?: {
        id: number;
        name: string;
        code: string | null;
        apply_mode: string;
        discount_type: string;
        discount_value: number;
        discount_label: string;
        discount_amount: number;
    } | null;
    promo_discount?: number;
    total_discount?: number;
    total?: number;
    addresses: AddressOption[];
    isB2B: boolean;
}

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function CheckoutIndex({
    items,
    items_discount_total = 0,
    subtotal,
    applied_promotion = null,
    promo_discount = 0,
    total,
    addresses,
    isB2B,
}: CheckoutProps) {
    const defaultAddress =
        addresses.find((a) => a.is_default) ?? addresses[0] ?? null;

    const { errors: pageErrors } = usePage<
        SharedPageProps & { errors?: { promo_code?: string } }
    >().props;

    const [paymentPreview, setPaymentPreview] = useState<string | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [promoInput, setPromoInput] = useState('');
    const [applyingPromo, setApplyingPromo] = useState(false);

    const finalTotal = total ?? subtotal;

    const handleApplyPromo = () => {
        if (promoInput.trim() === '') return;

        setApplyingPromo(true);
        router.post(
            CartController.applyPromo().url,
            { code: promoInput.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPromoInput('');
                    toast.success('Kode promo berhasil diterapkan.');
                },
                onError: (errs) => {
                    if (errs.promo_code) {
                        toast.error(errs.promo_code);
                    }
                },
                onFinish: () => setApplyingPromo(false),
            },
        );
    };

    const handleRemovePromo = () => {
        setApplyingPromo(true);
        router.delete(CartController.removePromo().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kode promo dihapus.');
            },
            onFinish: () => setApplyingPromo(false),
        });
    };

    const { data, setData, post, processing, errors } = useForm<{
        address_id: string;
        greeting_note: string;
        payment_proof: File | null;
        b2b_video: File | null;
    }>({
        address_id: defaultAddress ? String(defaultAddress.id) : '',
        greeting_note: '',
        payment_proof: null,
        b2b_video: null,
    });

    const handlePaymentProofChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0] ?? null;
        setData('payment_proof', file);
        if (file && file.type.startsWith('image/')) {
            setPaymentPreview(URL.createObjectURL(file));
        } else {
            setPaymentPreview(null);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) {
            setData('b2b_video', null);
            setVideoPreviewUrl(null);
            return;
        }
        if (file.size > MAX_VIDEO_BYTES) {
            toast.error('Ukuran file video maksimal 50MB.');
            e.target.value = '';
            return;
        }
        setData('b2b_video', file);
        setVideoPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.address_id) {
            toast.error('Pilih alamat pengiriman terlebih dahulu.');
            return;
        }

        post(CheckoutController.store().url, {
            forceFormData: true,
            onSuccess: () => {
                toast.success(
                    'Pesanan berhasil dibuat! Sedang dalam tahap Verifikasi.',
                );
            },
            onError: () => {
                toast.error(
                    'Mohon periksa kembali alamat dan lampiran checkout Anda.',
                );
            },
        });
    };

    return (
        <>
            <Head title="Checkout Pesanan — Galuh & Co." />

            <div className="min-h-screen bg-[#F2EBDC] font-sans text-[#16233B] antialiased selection:bg-[#A88B54]/25 selection:text-[#16233B]">
                {/* Minimal Distraction-Free Checkout Header */}
                <header className="sticky top-0 z-40 border-b border-[#A88B54]/30 bg-[#16233B]/95 backdrop-blur-md">
                    <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-6">
                        <Link
                            href={CartController.index()}
                            className="inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-wider text-[#F2EBDC] uppercase transition-colors hover:text-[#A88B54]"
                        >
                            <ArrowLeftIcon className="size-4" />
                            <span>Kembali ke Keranjang</span>
                        </Link>

                        <Link
                            href={home()}
                            aria-label="Galuh & Co. Beranda"
                            className="flex items-center transition-opacity hover:opacity-90"
                        >
                            <img
                                src="/Asset/Logo/Logo_galu&co.png"
                                alt="Galuh & Co."
                                className="h-8 w-auto object-contain sm:h-9"
                            />
                        </Link>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A88B54]/45 bg-[#1E2F4D] px-3.5 py-1.5 font-sans text-[11px] font-semibold tracking-wider text-[#F2EBDC] uppercase">
                            <LockIcon className="size-3.5 text-[#A88B54]" />
                            <span className="hidden sm:inline">
                                SECURE CHECKOUT
                            </span>
                            <span className="sm:hidden">SECURE</span>
                        </span>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">
                    <div className="mb-8">
                        <span className="font-sans text-xs font-semibold tracking-[0.24em] text-[#6E675D] uppercase">
                            Penyelesaian Pesanan
                        </span>
                        <h1 className="mt-2 font-serif text-3xl font-normal text-[#16233B] sm:text-4xl">
                            Checkout &amp; Konfirmasi Pembayaran
                        </h1>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
                    >
                        {/* Kiri: Alamat, Kartu Ucapan, Pembayaran, & Video B2B */}
                        <div className="space-y-6 lg:col-span-7">
                            {/* 1. Alamat Pengiriman */}
                            <section className="rounded-3xl border border-[#A88B54]/25 bg-[#FAF7F0] p-6 shadow-[0_12px_32px_-12px_rgba(22,35,59,0.10)] sm:p-8">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#A88B54]/20 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-9 items-center justify-center rounded-xl bg-[#16233B] text-[#A88B54]">
                                            <MapPinIcon className="size-4.5" />
                                        </div>
                                        <div>
                                            <h2 className="font-serif text-2xl font-normal text-[#16233B]">
                                                1. Alamat Pengiriman
                                            </h2>
                                        </div>
                                    </div>
                                    <Link
                                        href={AccountController.index()}
                                        className="inline-flex items-center gap-1 rounded-full border border-[#A88B54]/40 px-3.5 py-1.5 font-sans text-xs font-semibold text-[#16233B] hover:bg-white"
                                    >
                                        <PlusIcon className="size-3.5 text-[#A88B54]" />
                                        Kelola Alamat
                                    </Link>
                                </div>

                                {addresses.length === 0 ? (
                                    <div className="mt-5 rounded-2xl border border-dashed border-[#A88B54]/50 bg-white/70 p-6 text-center">
                                        <p className="font-sans text-sm text-[#6E675D]">
                                            Anda belum memiliki alamat
                                            pengiriman tersimpan.
                                        </p>
                                        <Link
                                            href={AccountController.index()}
                                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#16233B] px-5 py-2.5 font-sans text-xs font-semibold text-[#F2EBDC] hover:bg-[#1F304F]"
                                        >
                                            Tambah Alamat di Akun Saya
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {addresses.map((addr) => {
                                            const selected =
                                                data.address_id ===
                                                String(addr.id);
                                            return (
                                                <label
                                                    key={addr.id}
                                                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${selected
                                                        ? 'border-[#16233B] bg-[#16233B] text-[#F2EBDC] shadow-md'
                                                        : 'border-[#A88B54]/30 bg-white/80 text-[#16233B] hover:border-[#A88B54]'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="address_id"
                                                        value={addr.id}
                                                        checked={selected}
                                                        onChange={() =>
                                                            setData(
                                                                'address_id',
                                                                String(addr.id),
                                                            )
                                                        }
                                                        className="sr-only"
                                                    />
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-serif text-base font-semibold">
                                                            {addr.label}
                                                        </span>
                                                        {selected && (
                                                            <CheckCircle2Icon className="size-4 shrink-0 text-[#A88B54]" />
                                                        )}
                                                    </div>
                                                    <p
                                                        className={`mt-1.5 font-sans text-xs font-semibold ${selected
                                                            ? 'text-[#F2EBDC]'
                                                            : 'text-[#16233B]'
                                                            }`}
                                                    >
                                                        {addr.recipient_name} ·{' '}
                                                        {addr.recipient_phone}
                                                    </p>
                                                    <p
                                                        className={`mt-1 font-sans text-xs leading-relaxed ${selected
                                                            ? 'text-[#F2EBDC]/80'
                                                            : 'text-[#6E675D]'
                                                            }`}
                                                    >
                                                        {addr.address_line},{' '}
                                                        {addr.city}{' '}
                                                        {addr.postal_code}
                                                    </p>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                                {errors.address_id && (
                                    <p className="mt-2 font-sans text-xs text-red-600">
                                        {errors.address_id}
                                    </p>
                                )}
                            </section>

                            {/* 2. Catatan Kartu Ucapan */}
                            <section className="rounded-3xl border border-[#A88B54]/25 bg-[#FAF7F0] p-6 shadow-[0_12px_32px_-12px_rgba(22,35,59,0.10)] sm:p-8">
                                <div className="flex items-center gap-2.5 border-b border-[#A88B54]/20 pb-4">
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-[#16233B] text-[#A88B54]">
                                        <FileTextIcon className="size-4.5" />
                                    </div>
                                    <div>
                                        <h2 className="font-serif text-2xl font-normal text-[#16233B]">
                                            2. Catatan Kartu Ucapan (Opsional)
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <textarea
                                        id="greeting_note"
                                        rows={3}
                                        maxLength={1000}
                                        value={data.greeting_note}
                                        onChange={(e) =>
                                            setData(
                                                'greeting_note',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Tuliskan pesan tulus untuk dicetak pada kartu ucapan eksklusif Anda (maks. 1.000 karakter)..."
                                        className="w-full rounded-2xl border border-[#A88B54]/30 bg-white px-4 py-3 font-sans text-sm text-[#16233B] outline-none placeholder:text-[#6E675D]/70 focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                    />
                                    {errors.greeting_note && (
                                        <p className="mt-1 font-sans text-xs text-red-600">
                                            {errors.greeting_note}
                                        </p>
                                    )}
                                </div>
                            </section>

                            {/* 3. Bukti Pembayaran */}
                            <section className="rounded-3xl border border-[#A88B54]/25 bg-[#FAF7F0] p-6 shadow-[0_12px_32px_-12px_rgba(22,35,59,0.10)] sm:p-8">
                                <div className="flex items-center gap-2.5 border-b border-[#A88B54]/20 pb-4">
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-[#16233B] text-[#A88B54]">
                                        <CreditCardIcon className="size-4.5" />
                                    </div>
                                    <div>
                                        <h2 className="font-serif text-2xl font-normal text-[#16233B]">
                                            3. Pembayaran &amp; Bukti Transfer
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl border border-[#A88B54]/35 bg-[#16233B] p-4 text-[#F2EBDC]">
                                    <p className="font-sans text-[11px] font-semibold tracking-wider text-[#A88B54] uppercase">
                                        Rekening Resmi Galuh &amp; Co.
                                    </p>
                                    <p className="mt-1 font-serif text-lg font-semibold">
                                        Bank BCA — 8840 1298 77 (a.n. PT Galuh
                                        Kriya Nusantara)
                                    </p>
                                    <p className="mt-1 font-sans text-xs text-[#F2EBDC]/80">
                                        Transfer sesuai total tagihan dan unggah
                                        bukti transfer agar admin segera
                                        memverifikasi pesanan Anda.
                                    </p>
                                </div>

                                <div className="mt-5">
                                    <label
                                        htmlFor="payment_proof"
                                        className="block font-sans text-xs font-semibold text-[#16233B]"
                                    >
                                        Unggah Bukti Pembayaran (JPG, PNG, PDF ·
                                        Maks. 4MB)
                                    </label>
                                    <label
                                        htmlFor="payment_proof"
                                        className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#A88B54]/50 bg-white/75 p-5 text-center transition-colors hover:border-[#16233B] hover:bg-white"
                                    >
                                        <UploadCloudIcon className="size-6 text-[#A88B54]" />
                                        <span className="mt-2 font-sans text-xs font-semibold text-[#16233B]">
                                            {data.payment_proof
                                                ? data.payment_proof.name
                                                : 'Pilih file bukti transfer'}
                                        </span>
                                        <span className="mt-0.5 font-sans text-[11px] text-[#6E675D]">
                                            Klik untuk memilih berkas
                                        </span>
                                        <input
                                            id="payment_proof"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={handlePaymentProofChange}
                                            className="sr-only"
                                        />
                                    </label>
                                    {paymentPreview && (
                                        <img
                                            src={paymentPreview}
                                            alt="Pratinjau bukti pembayaran"
                                            className="mt-3 max-h-40 rounded-xl border border-[#A88B54]/30 object-contain"
                                        />
                                    )}
                                    {errors.payment_proof && (
                                        <p className="mt-1 font-sans text-xs text-red-600">
                                            {errors.payment_proof}
                                        </p>
                                    )}
                                </div>
                            </section>

                            {/* 4. Khusus B2B: Video Ucapan Perusahaan */}
                            {isB2B && (
                                <section className="rounded-3xl border border-[#A88B54]/45 bg-[#16233B] p-6 text-[#F2EBDC] shadow-[0_18px_42px_-12px_rgba(22,35,59,0.45)] sm:p-8">
                                    <div className="flex items-center gap-3 border-b border-[#A88B54]/30 pb-4">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-[#1E2F4D] text-[#A88B54]">
                                            <VideoIcon className="size-5" />
                                        </div>
                                        <div>
                                            <div className="inline-flex items-center gap-1.5 font-sans text-[10px] font-semibold tracking-wider text-[#A88B54] uppercase">
                                                <Building2Icon className="size-3" />
                                                Fitur Eksklusif Corporate B2B
                                            </div>
                                            <h2 className="font-serif text-2xl font-normal text-[#F2EBDC]">
                                                Video Ucapan Perusahaan (QR
                                                Code)
                                            </h2>
                                        </div>
                                    </div>

                                    <p className="mt-4 font-sans text-xs leading-relaxed text-[#F2EBDC]/80">
                                        Unggah video sambutan direksi atau
                                        perusahaan (MP4 / WebM, maksimal 50MB).
                                        Kami akan menghasilkan QR Code unik di
                                        halaman Akun Anda untuk dicetak di dalam
                                        setiap kotak hampers.
                                    </p>

                                    <div className="mt-4">
                                        <label
                                            htmlFor="b2b_video"
                                            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#A88B54]/50 bg-[#1E2F4D]/80 p-5 text-center transition-colors hover:border-[#A88B54] hover:bg-[#1E2F4D]"
                                        >
                                            <VideoIcon className="size-6 text-[#A88B54]" />
                                            <span className="mt-2 font-sans text-xs font-semibold text-[#F2EBDC]">
                                                {data.b2b_video
                                                    ? `${data.b2b_video.name} (${(data.b2b_video.size / (1024 * 1024)).toFixed(1)} MB)`
                                                    : 'Unggah Video Ucapan (MP4 / WebM · Maks. 50MB)'}
                                            </span>
                                            <input
                                                id="b2b_video"
                                                type="file"
                                                accept="video/mp4,video/webm"
                                                onChange={handleVideoChange}
                                                className="sr-only"
                                            />
                                        </label>
                                        {videoPreviewUrl && (
                                            <video
                                                src={videoPreviewUrl}
                                                controls
                                                className="mt-3 aspect-video w-full rounded-xl bg-black"
                                            />
                                        )}
                                        {errors.b2b_video && (
                                            <p className="mt-1 font-sans text-xs text-rose-300">
                                                {errors.b2b_video}
                                            </p>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Kanan: Ringkasan Pesanan */}
                        <aside className="rounded-3xl border border-[#A88B54]/30 bg-[#FAF7F0] p-6 shadow-[0_14px_34px_-12px_rgba(22,35,59,0.12)] sm:p-8 lg:sticky lg:top-24 lg:col-span-5">
                            <h2 className="font-serif text-2xl font-normal text-[#16233B]">
                                Ringkasan Pesanan
                            </h2>

                            <ul className="mt-5 divide-y divide-[#A88B54]/20">
                                {items.map((item) => {
                                    const unitPrice = Number(item.unit_price);
                                    const itemName = item.is_custom_b2b
                                        ? (item.custom_config?.title ??
                                            'Custom B2B Luxury Hampers')
                                        : (item.product?.name ??
                                            'Galuh & Co. Hampers');

                                    return (
                                        <li
                                            key={item.id}
                                            className="flex items-start justify-between gap-3 py-3 text-xs sm:text-sm"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[#16233B]">
                                                    {itemName}
                                                </p>
                                                {item.is_custom_b2b && (
                                                    <div className="mt-0.5 space-y-1">
                                                        <span className="inline-flex items-center gap-1 font-sans text-[10px] font-semibold text-[#6E675D]">
                                                            <SparklesIcon className="size-3 text-[#A88B54]" />
                                                            Custom 3D Box
                                                            {item.custom_config
                                                                ?.package_tier
                                                                ? ` · ${item.custom_config.package_tier}`
                                                                : ''}
                                                        </span>
                                                        {Array.isArray(
                                                            item.custom_config
                                                                ?.items,
                                                        ) &&
                                                            item.custom_config
                                                                .items.length >
                                                            0 && (
                                                                <p className="font-sans text-[11px] text-[#6E675D]">
                                                                    Isi:{' '}
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
                                                )}
                                                <p className="font-sans text-xs text-[#6E675D]">
                                                    {item.quantity} ×{' '}
                                                    {item.active_promo &&
                                                        (item.original_unit_price ??
                                                            unitPrice) >
                                                        unitPrice ? (
                                                        <>
                                                            <span className="mr-1.5 line-through">
                                                                {formatRupiah(
                                                                    item.original_unit_price ??
                                                                    unitPrice,
                                                                )}
                                                            </span>
                                                            <span className="font-semibold text-[#16233B]">
                                                                {formatRupiah(
                                                                    unitPrice,
                                                                )}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        formatRupiah(unitPrice)
                                                    )}
                                                </p>
                                            </div>
                                            <span className="shrink-0 font-serif text-base font-semibold text-[#16233B]">
                                                {formatRupiah(
                                                    item.quantity * unitPrice,
                                                )}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Input Kode Promo di Checkout */}
                            <div className="mt-4 border-t border-[#A88B54]/20 pt-4">
                                {applied_promotion &&
                                    applied_promotion.apply_mode === 'code' ? (
                                    <div className="flex items-center justify-between gap-2 rounded-xl border border-[#A88B54]/40 bg-white px-3.5 py-2.5 text-xs">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-[#16233B]">
                                                Kode {applied_promotion.code}{' '}
                                                diterapkan
                                            </p>
                                            <p className="truncate text-[11px] text-[#6E675D]">
                                                {applied_promotion.name} (
                                                {
                                                    applied_promotion.discount_label
                                                }
                                                )
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={applyingPromo}
                                            onClick={handleRemovePromo}
                                            className="rounded-full p-1 text-[#6E675D] hover:bg-red-50 hover:text-red-600"
                                            aria-label="Hapus kode promo"
                                        >
                                            <XIcon className="size-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="checkout_promo_code"
                                            className="block font-sans text-xs font-semibold text-[#16233B]"
                                        >
                                            Kode Promo / Voucher (Opsional)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                id="checkout_promo_code"
                                                type="text"
                                                value={promoInput}
                                                onChange={(e) =>
                                                    setPromoInput(
                                                        e.target.value.toUpperCase(),
                                                    )
                                                }
                                                placeholder="Masukkan kode"
                                                className="min-w-0 flex-1 rounded-xl border border-[#A88B54]/35 bg-white px-3 py-2 font-mono text-xs text-[#16233B] uppercase outline-none focus:border-[#16233B]"
                                            />
                                            <button
                                                type="button"
                                                disabled={
                                                    applyingPromo ||
                                                    promoInput.trim() === ''
                                                }
                                                onClick={handleApplyPromo}
                                                className="shrink-0 rounded-xl bg-[#16233B] px-4 py-2 font-sans text-xs font-semibold text-[#F2EBDC] transition-colors hover:bg-[#1F304F] disabled:opacity-50"
                                            >
                                                Terapkan
                                            </button>
                                        </div>
                                        {pageErrors?.promo_code && (
                                            <p className="font-sans text-[11px] text-red-600">
                                                {pageErrors.promo_code}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 space-y-2 border-t border-[#A88B54]/30 pt-4">
                                {items_discount_total > 0 && (
                                    <div className="flex items-center justify-between text-xs text-emerald-700">
                                        <span>Diskon Produk Katalog</span>
                                        <span className="font-semibold">
                                            -{formatRupiah(items_discount_total)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-xs text-[#6E675D]">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-[#16233B]">
                                        {formatRupiah(subtotal)}
                                    </span>
                                </div>
                                {applied_promotion && promo_discount > 0 && (
                                    <div className="flex items-center justify-between text-xs text-emerald-700">
                                        <span className="flex items-center gap-1">
                                            <TagIcon className="size-3.5" />
                                            <span>
                                                Promo{' '}
                                                {applied_promotion.code ??
                                                    applied_promotion.name}
                                            </span>
                                        </span>
                                        <span className="font-semibold">
                                            -{formatRupiah(promo_discount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-baseline justify-between border-t border-[#A88B54]/20 pt-2">
                                    <span className="font-sans text-sm font-semibold text-[#16233B]">
                                        Total Tagihan
                                    </span>
                                    <span className="font-serif text-2xl font-semibold text-[#16233B]">
                                        {formatRupiah(finalTotal)}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    addresses.length === 0 ||
                                    !data.address_id
                                }
                                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#16233B] px-6 py-4 font-sans text-sm font-semibold tracking-wide text-[#F2EBDC] shadow-md transition-colors hover:bg-[#1F304F] disabled:opacity-60"
                            >
                                {processing && <Spinner className="size-4" />}
                                {processing
                                    ? 'Memproses Pesanan...'
                                    : 'Buat Pesanan Sekarang'}
                            </button>
                        </aside>
                    </form>
                </main>
            </div>
        </>
    );
}
