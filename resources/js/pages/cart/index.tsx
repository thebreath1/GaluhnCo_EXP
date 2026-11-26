import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRightIcon,
    GiftIcon,
    MinusIcon,
    PlusIcon,
    ShoppingBagIcon,
    SparklesIcon,
    TagIcon,
    Trash2Icon,
    XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import B2BCustomizerController from '@/actions/App/Http/Controllers/B2BCustomizerController';
import CartController from '@/actions/App/Http/Controllers/CartController';
import CheckoutController from '@/actions/App/Http/Controllers/CheckoutController';
import type { StoredParcelItem } from '@/components/b2b/parcel-catalog';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { catalog } from '@/routes';
import type { SharedPageProps } from '@/types';

interface CustomConfig {
    title?: string;
    box_color?: string;
    ribbon_color?: string;
    package_tier?: string;
    logo_path?: string | null;
    items?: StoredParcelItem[];
}

interface CartItemEntry {
    id: number;
    product_id: number | null;
    product_name: string;
    category: string | null;
    image_url: string | null;
    is_custom_b2b: boolean;
    custom_config: CustomConfig | null;
    quantity: number;
    original_unit_price?: number;
    unit_price: number;
    item_discount_total?: number;
    subtotal: number;
    active_promo?: {
        id: number;
        name: string;
        badge_text: string | null;
        discount_type: string;
        discount_value: number;
        discount_label: string;
        ends_at: string | null;
    } | null;
}

interface CartSummary {
    items_original_subtotal: number;
    items_discount_total: number;
    subtotal: number;
    applied_promotion: {
        id: number;
        name: string;
        code: string | null;
        apply_mode: string;
        discount_type: string;
        discount_value: number;
        discount_label: string;
        discount_amount: number;
    } | null;
    promo_discount: number;
    total_discount: number;
    total: number;
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function CartIndex({
    items = [],
    summary,
}: {
    items?: CartItemEntry[];
    summary?: CartSummary;
}) {
    const { auth, errors } = usePage<
        SharedPageProps & { errors?: { promo_code?: string } }
    >().props;
    const isB2B = auth?.user?.role === 'b2b';
    const [busyId, setBusyId] = useState<number | null>(null);
    const [promoInput, setPromoInput] = useState('');
    const [applyingPromo, setApplyingPromo] = useState(false);

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const fallbackSubtotal = items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0,
    );
    const itemsDiscountTotal = summary?.items_discount_total ?? 0;
    const subtotal = summary?.subtotal ?? fallbackSubtotal;
    const appliedPromo = summary?.applied_promotion ?? null;
    const promoDiscount = summary?.promo_discount ?? 0;
    const finalTotal = summary?.total ?? subtotal;

    const handleApplyPromo = (e: React.FormEvent) => {
        e.preventDefault();
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

    const handleUpdateQuantity = (item: CartItemEntry, nextQty: number) => {
        const minQty = item.is_custom_b2b && isB2B ? 10 : 1;
        if (nextQty < minQty) {
            toast.info(
                item.is_custom_b2b && isB2B
                    ? 'Minimal pemesanan Custom 3D B2B adalah 10 box.'
                    : 'Minimal kuantitas produk adalah 1.',
            );
            return;
        }

        setBusyId(item.id);
        router.patch(
            CartController.update(item.id).url,
            { quantity: nextQty },
            {
                preserveScroll: true,
                onError: () => {
                    toast.error('Gagal memperbarui jumlah item.');
                },
                onFinish: () => setBusyId(null),
            },
        );
    };

    const handleRemoveItem = (item: CartItemEntry) => {
        setBusyId(item.id);
        router.delete(CartController.destroy(item.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`"${item.product_name}" dihapus dari keranjang.`);
            },
            onError: () => {
                toast.error('Gagal menghapus item dari keranjang.');
            },
            onFinish: () => setBusyId(null),
        });
    };

    return (
        <>
            <Head title="Keranjang Belanja — Galuh & Co." />

            <StorefrontLayout>
                <main className="mx-auto max-w-7xl px-6 pt-28 pb-16 md:pt-32 md:pb-20">
                    <div className="mb-8">
                        <span className="font-sans text-xs font-semibold tracking-[0.24em] text-[#6E675D] uppercase">
                            Ringkasan Bingkisan
                        </span>
                        <h1 className="mt-2 font-serif text-3xl font-normal text-[#16233B] sm:text-4xl">
                            Keranjang Belanja Anda
                        </h1>
                    </div>

                    {items.length === 0 ? (
                        <div className="mx-auto max-w-xl rounded-3xl border border-[#A88B54]/25 bg-[#FAF7F0] p-10 text-center shadow-[0_12px_32px_-12px_rgba(22,35,59,0.10)] sm:p-14">
                            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#16233B] text-[#A88B54]">
                                <ShoppingBagIcon className="size-7" />
                            </div>
                            <h2 className="mt-5 font-serif text-2xl font-normal text-[#16233B]">
                                Keranjang Anda Masih Kosong
                            </h2>
                            <p className="mt-2 font-sans text-xs leading-relaxed text-[#6E675D] sm:text-sm">
                                Temukan koleksi hampers eksklusif kami atau
                                rancang kotak kustom perusahaan Anda.
                            </p>
                            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    href={catalog()}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#16233B] px-6 py-3 font-sans text-xs font-semibold text-[#F2EBDC] transition-colors hover:bg-[#1F304F]"
                                >
                                    Jelajahi Katalog
                                </Link>
                                <Link
                                    href={B2BCustomizerController.index()}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#A88B54] bg-transparent px-6 py-3 font-sans text-xs font-semibold text-[#16233B] transition-colors hover:bg-[#16233B] hover:text-[#F2EBDC]"
                                >
                                    <SparklesIcon className="size-3.5 text-[#A88B54]" />
                                    Buka 3D Customizer
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                            {/* List Item Keranjang */}
                            <div className="space-y-4 lg:col-span-8">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-5 rounded-2xl border border-[#A88B54]/25 bg-[#FAF7F0] p-5 shadow-[0_12px_30px_-12px_rgba(22,35,59,0.10)] sm:flex-row sm:items-center"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#A88B54]/25 bg-[#16233B]/5">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.product_name}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-full flex-col items-center justify-center bg-[#16233B] text-[#A88B54]">
                                                    <GiftIcon className="size-7" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Detail Produk */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {item.is_custom_b2b ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#16233B] px-2.5 py-0.5 font-sans text-[10px] font-semibold tracking-wider text-[#F2EBDC] uppercase">
                                                        <SparklesIcon className="size-2.5 text-[#A88B54]" />
                                                        {isB2B
                                                            ? 'Custom 3D B2B'
                                                            : 'Custom 3D Box'}
                                                    </span>
                                                ) : (
                                                    item.category && (
                                                        <span className="rounded-full border border-[#A88B54]/35 bg-white px-2.5 py-0.5 font-sans text-[10px] font-semibold text-[#16233B]">
                                                            {item.category}
                                                        </span>
                                                    )
                                                )}
                                            </div>

                                            <h3 className="mt-1.5 font-serif text-xl font-semibold text-[#16233B]">
                                                {item.product_name}
                                            </h3>

                                            {/* Detail Custom B2B jika ada */}
                                            {item.is_custom_b2b &&
                                                item.custom_config && (
                                                    <div className="mt-2 flex flex-wrap items-center gap-3 font-sans text-xs text-[#6E675D]">
                                                        {item.custom_config
                                                            .package_tier && (
                                                            <span>
                                                                Paket:{' '}
                                                                <strong className="text-[#16233B]">
                                                                    {
                                                                        item
                                                                            .custom_config
                                                                            .package_tier
                                                                    }
                                                                </strong>
                                                            </span>
                                                        )}
                                                        {item.custom_config
                                                            .box_color && (
                                                            <span className="inline-flex items-center gap-1.5">
                                                                Kotak:
                                                                <span
                                                                    className="inline-block size-3.5 rounded-full border border-black/20"
                                                                    style={{
                                                                        backgroundColor:
                                                                            item
                                                                                .custom_config
                                                                                .box_color,
                                                                    }}
                                                                />
                                                            </span>
                                                        )}
                                                        {item.custom_config
                                                            .ribbon_color && (
                                                            <span className="inline-flex items-center gap-1.5">
                                                                Pita:
                                                                <span
                                                                    className="inline-block size-3.5 rounded-full border border-black/20"
                                                                    style={{
                                                                        backgroundColor:
                                                                            item
                                                                                .custom_config
                                                                                .ribbon_color,
                                                                    }}
                                                                />
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                            {item.is_custom_b2b &&
                                                Array.isArray(
                                                    item.custom_config?.items,
                                                ) &&
                                                item.custom_config.items
                                                    .length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {item.custom_config.items.map(
                                                            (parcel, idx) => (
                                                                <span
                                                                    key={`${parcel.id}-${idx}`}
                                                                    className="rounded-lg border border-[#A88B54]/25 bg-white px-2 py-0.5 font-sans text-[10px] font-medium text-[#16233B]"
                                                                >
                                                                    {
                                                                        parcel.name
                                                                    }
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                )}

                                            <div className="mt-1.5 flex flex-wrap items-center gap-2 font-sans text-xs text-[#6E675D]">
                                                <span>Harga satuan:</span>
                                                {item.active_promo &&
                                                (item.original_unit_price ??
                                                    item.unit_price) >
                                                    item.unit_price ? (
                                                    <>
                                                        <span className="line-through">
                                                            {formatRupiah(
                                                                item.original_unit_price ??
                                                                    item.unit_price,
                                                            )}
                                                        </span>
                                                        <span className="font-semibold text-[#16233B]">
                                                            {formatRupiah(
                                                                item.unit_price,
                                                            )}
                                                        </span>
                                                        <span className="rounded bg-[#A88B54]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#16233B]">
                                                            {
                                                                item
                                                                    .active_promo
                                                                    .discount_label
                                                            }
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="font-semibold text-[#16233B]">
                                                        {formatRupiah(
                                                            item.unit_price,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Kuantitas & Subtotal */}
                                        <div className="flex flex-row items-center justify-between gap-4 border-t border-[#A88B54]/20 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                                            <div className="inline-flex items-center gap-2 rounded-full border border-[#A88B54]/40 bg-white px-2 py-1">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        busyId === item.id
                                                    }
                                                    aria-label="Kurangi kuantitas"
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    className="flex size-7 items-center justify-center rounded-full text-[#16233B] hover:bg-[#F2EBDC] disabled:opacity-50"
                                                >
                                                    <MinusIcon className="size-3.5" />
                                                </button>
                                                <span className="min-w-[28px] text-center font-sans text-xs font-bold text-[#16233B]">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        busyId === item.id
                                                    }
                                                    aria-label="Tambah kuantitas"
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                    className="flex size-7 items-center justify-center rounded-full text-[#16233B] hover:bg-[#F2EBDC] disabled:opacity-50"
                                                >
                                                    <PlusIcon className="size-3.5" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="font-serif text-lg font-semibold text-[#16233B]">
                                                    {formatRupiah(
                                                        item.unit_price *
                                                            item.quantity,
                                                    )}
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        busyId === item.id
                                                    }
                                                    aria-label={`Hapus ${item.product_name}`}
                                                    onClick={() =>
                                                        handleRemoveItem(item)
                                                    }
                                                    className="rounded-full p-1.5 text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    <Trash2Icon className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Card */}
                            <aside className="rounded-3xl border border-[#A88B54]/30 bg-[#FAF7F0] p-6 shadow-[0_14px_34px_-12px_rgba(22,35,59,0.12)] sm:p-8 lg:sticky lg:top-28 lg:col-span-4">
                                <h2 className="font-serif text-2xl font-normal text-[#16233B]">
                                    Ringkasan Belanja
                                </h2>

                                <div className="mt-5 space-y-3 border-y border-[#A88B54]/25 py-4 font-sans text-xs sm:text-sm">
                                    <div className="flex justify-between text-[#6E675D]">
                                        <span>Total Kuantitas</span>
                                        <span className="font-semibold text-[#16233B]">
                                            {totalQuantity} box
                                        </span>
                                    </div>
                                    {itemsDiscountTotal > 0 && (
                                        <div className="flex justify-between text-emerald-700">
                                            <span>Diskon Katalog Otomatis</span>
                                            <span className="font-semibold">
                                                -
                                                {formatRupiah(
                                                    itemsDiscountTotal,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[#6E675D]">
                                        <span>Subtotal Produk</span>
                                        <span className="font-semibold text-[#16233B]">
                                            {formatRupiah(subtotal)}
                                        </span>
                                    </div>
                                    {appliedPromo && promoDiscount > 0 && (
                                        <div className="flex items-center justify-between text-emerald-700">
                                            <span className="flex items-center gap-1">
                                                <TagIcon className="size-3.5" />
                                                <span>
                                                    Promo{' '}
                                                    {appliedPromo.code ??
                                                        appliedPromo.name}
                                                </span>
                                            </span>
                                            <span className="font-semibold">
                                                -{formatRupiah(promoDiscount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-baseline justify-between border-t border-[#A88B54]/20 pt-2">
                                        <span className="font-semibold text-[#16233B]">
                                            Total Tagihan
                                        </span>
                                        <span className="font-serif text-xl font-semibold text-[#16233B]">
                                            {formatRupiah(finalTotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* Form Kode Promo */}
                                <div className="mt-4">
                                    {appliedPromo &&
                                    appliedPromo.apply_mode === 'code' ? (
                                        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#A88B54]/40 bg-white px-3.5 py-2.5 text-xs">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[#16233B]">
                                                    Kode {appliedPromo.code}{' '}
                                                    aktif
                                                </p>
                                                <p className="truncate text-[11px] text-[#6E675D]">
                                                    {appliedPromo.name} (
                                                    {
                                                        appliedPromo.discount_label
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
                                        <form
                                            onSubmit={handleApplyPromo}
                                            className="space-y-1.5"
                                        >
                                            <label
                                                htmlFor="cart_promo_code"
                                                className="block font-sans text-xs font-semibold text-[#16233B]"
                                            >
                                                Punya Kode Promo?
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    id="cart_promo_code"
                                                    type="text"
                                                    value={promoInput}
                                                    onChange={(e) =>
                                                        setPromoInput(
                                                            e.target.value.toUpperCase(),
                                                        )
                                                    }
                                                    placeholder="Masukkan kode voucher"
                                                    className="min-w-0 flex-1 rounded-xl border border-[#A88B54]/35 bg-white px-3 py-2 font-mono text-xs text-[#16233B] uppercase outline-none focus:border-[#16233B]"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        applyingPromo ||
                                                        promoInput.trim() === ''
                                                    }
                                                    className="shrink-0 rounded-xl bg-[#16233B] px-4 py-2 font-sans text-xs font-semibold text-[#F2EBDC] transition-colors hover:bg-[#1F304F] disabled:opacity-50"
                                                >
                                                    Pakai
                                                </button>
                                            </div>
                                            {errors?.promo_code && (
                                                <p className="font-sans text-[11px] text-red-600">
                                                    {errors.promo_code}
                                                </p>
                                            )}
                                        </form>
                                    )}
                                </div>

                                <p className="mt-4 font-sans text-[11px] leading-relaxed text-[#6E675D]">
                                    Pilih alamat pengiriman, tulis pesan kartu
                                    ucapan, serta unggah bukti pembayaran (dan
                                    video ucapan khusus B2B) pada halaman
                                    checkout.
                                </p>

                                <Link
                                    href={CheckoutController.index()}
                                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#16233B] px-6 py-3.5 font-sans text-sm font-semibold tracking-wide text-[#F2EBDC] shadow-md transition-colors hover:bg-[#1F304F]"
                                >
                                    <span>Lanjut ke Checkout</span>
                                    <ArrowRightIcon className="size-4 text-[#A88B54]" />
                                </Link>

                                <Link
                                    href={catalog()}
                                    className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#A88B54]/40 py-2.5 font-sans text-xs font-semibold text-[#16233B] transition-colors hover:bg-white"
                                >
                                    Tambah Koleksi Lainnya
                                </Link>
                            </aside>
                        </div>
                    )}
                </main>
            </StorefrontLayout>
        </>
    );
}
