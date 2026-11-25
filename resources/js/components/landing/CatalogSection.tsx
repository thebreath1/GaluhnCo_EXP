import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import {
    CheckIcon,
    ChevronDownIcon,
    EyeIcon,
    GiftIcon,
    MinusIcon,
    PlusIcon,
    ShoppingBagIcon,
    SparklesIcon,
    StarIcon,
    XIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import CartController from '@/actions/App/Http/Controllers/CartController';
import { getCmsText, type SectionContent } from '@/components/landing/cms';
import { login } from '@/routes';
import type { SharedPageProps } from '@/types';
import type { Product } from '@/types/product';

interface CatalogSectionProps {
    products?: Product[];
    categories?: string[];
    featuredCategory?: string;
    content?: SectionContent;
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

const SEASONAL_KEYWORDS = [
    'seasonal',
    'festive',
    'ramadan',
    'lebaran',
    'natal',
    'imlek',
];

export default function CatalogSection({
    products = [],
    categories: serverCategories = [],
    featuredCategory,
    content,
}: CatalogSectionProps) {
    const items = products;

    const eyebrow = getCmsText(content, 'eyebrow', 'Koleksi Eksklusif');
    const title = getCmsText(
        content,
        'title',
        'Kurasi Hampers untuk Setiap Momen',
    );
    const description = getCmsText(
        content,
        'description',
        'Setiap koleksi dirangkai dengan harmoni rasa, aroma, dan estetika visual untuk menyampaikan apresiasi tertinggi.',
    );
    const ctaLabel = getCmsText(content, 'cta_label', 'Lihat Katalog Lengkap');

    // Kategori / Event / Season dinamis dari data produk & backend categories
    const allCategoryOptions = Array.from(
        new Set(
            [
                ...serverCategories,
                ...items.map((p) => p.category),
                ...items.map((p) => p.event_category),
                ...items.map((p) => p.season_tag),
            ]
                .map((value) => (value ?? '').trim())
                .filter((value): value is string => value !== ''),
        ),
    );

    const activeSeasonCategory =
        featuredCategory && featuredCategory.trim() !== ''
            ? featuredCategory.trim()
            : (allCategoryOptions.find(
                  (cat) => cat.toLowerCase() === 'seasonal & festive',
              ) ??
              allCategoryOptions.find((cat) =>
                  SEASONAL_KEYWORDS.some((kw) =>
                      cat.toLowerCase().includes(kw),
                  ),
              ) ??
              'Seasonal & Festive');

    const otherCategories = allCategoryOptions.filter(
        (cat) => cat.toLowerCase() !== activeSeasonCategory.toLowerCase(),
    );

    const { auth } = usePage<SharedPageProps>().props;
    const isAuthenticated = Boolean(auth?.user);

    const [activeCategory, setActiveCategory] = useState('all');
    const [onlyBestSeller, setOnlyBestSeller] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [modalQuantity, setModalQuantity] = useState(1);
    const [addingProductId, setAddingProductId] = useState<number | null>(null);

    const isAllActive = activeCategory === 'all' && !onlyBestSeller;
    const isSeasonActive =
        activeCategory.toLowerCase() === activeSeasonCategory.toLowerCase();
    const isOtherCategoryActive = activeCategory !== 'all' && !isSeasonActive;

    const openDetailModal = (product: Product) => {
        setModalQuantity(1);
        setSelectedProduct(product);
    };

    const handleAddToCart = (
        product: Product,
        quantity: number,
        closeOnSuccess = false,
    ) => {
        if (!isAuthenticated) {
            toast.info(
                'Silakan masuk terlebih dahulu untuk menambahkan ke keranjang.',
            );
            router.visit(login().url);
            return;
        }

        setAddingProductId(product.id);
        router.post(
            CartController.store().url,
            {
                product_id: product.id,
                quantity,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `${quantity}× ${product.name} ditambahkan ke keranjang.`,
                    );
                    if (closeOnSuccess) {
                        setSelectedProduct(null);
                    }
                },
                onError: () => {
                    toast.error('Gagal menambahkan produk ke keranjang.');
                },
                onFinish: () => {
                    setAddingProductId(null);
                },
            },
        );
    };

    // Tutup dropdown kategori saat klik di luar area dropdown atau tekan Escape
    useEffect(() => {
        if (!isDropdownOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isDropdownOpen]);

    // Kunci scroll body ketika modal terbuka
    useEffect(() => {
        if (selectedProduct) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedProduct(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedProduct]);

    // Filter produk (Kategori/Event/Season + Best Seller) dan batasi maksimal 8 produk
    const filteredProducts = items.filter((p) => {
        const normalizedActive = activeCategory.toLowerCase();
        const matchesCategory =
            activeCategory === 'all' ||
            p.category?.toLowerCase() === normalizedActive ||
            p.event_category?.toLowerCase() === normalizedActive ||
            (p.season_tag ?? '').toLowerCase() === normalizedActive;

        const matchesBestSeller = !onlyBestSeller || Boolean(p.is_best_seller);

        return matchesCategory && matchesBestSeller;
    });

    const displayedProducts = filteredProducts.slice(0, 8);
    const hasActiveFilter = activeCategory !== 'all' || onlyBestSeller;

    const resetFilters = () => {
        setActiveCategory('all');
        setOnlyBestSeller(false);
        setIsDropdownOpen(false);
    };

    return (
        <section
            id="koleksi"
            className="relative scroll-mt-20 overflow-hidden bg-[#F2EBDC] py-20 md:py-28"
        >
            <div className="mx-auto max-w-7xl px-6">
                {/* ── Tingkat 1: Header & Bar Filter 1 Baris Ringkas ─────────── */}
                <div className="relative z-20 mx-auto max-w-3xl text-center">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-10 left-1/2 h-56 w-80 -translate-x-1/2 rounded-full blur-2xl"
                        style={{
                            background:
                                'radial-gradient(circle, rgba(168,139,84,0.08) 0%, transparent 70%)',
                        }}
                    />
                    <span className="relative font-sans text-xs font-semibold tracking-[0.24em] text-[#6E675D] uppercase">
                        {eyebrow}
                    </span>
                    <h2 className="relative mt-3 font-serif text-3xl leading-tight font-normal tracking-normal text-[#16233B] sm:text-4xl lg:text-5xl">
                        {title}
                    </h2>
                    <p className="relative mx-auto mt-4 max-w-2xl font-sans text-sm font-normal text-[#6E675D] sm:text-base">
                        {description}
                    </p>

                    {/* Bar Filter 1 Baris Ringkas */}
                    {items.length > 0 && (
                        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-2.5">
                            {/* 1) Semua */}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveCategory('all');
                                    setOnlyBestSeller(false);
                                    setIsDropdownOpen(false);
                                }}
                                className={`inline-flex items-center rounded-full border px-5 py-2 font-sans text-xs font-medium tracking-wide transition-all duration-300 ${
                                    isAllActive
                                        ? 'border-[#16233B] bg-[#16233B] text-[#F2EBDC] shadow-sm'
                                        : 'border-[#16233B]/15 bg-white text-[#16233B] hover:border-[#A88B54]'
                                }`}
                            >
                                Semua
                            </button>

                            {/* 2) Season Berlangsung */}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveCategory(activeSeasonCategory);
                                    setIsDropdownOpen(false);
                                }}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-5 py-2 font-sans text-xs font-medium tracking-wide transition-all duration-300 ${
                                    isSeasonActive
                                        ? 'border-[#A88B54]/60 bg-[#16233B] text-[#F2EBDC] shadow-sm'
                                        : 'border-[#A88B54]/50 bg-[#FAF7F0] text-[#16233B] hover:border-[#A88B54] hover:bg-[#A88B54]/10'
                                }`}
                            >
                                <SparklesIcon className="size-3.5 text-[#A88B54]" />
                                {activeSeasonCategory}
                            </button>

                            {/* 3) ★ Best Seller */}
                            <button
                                type="button"
                                onClick={() => {
                                    setOnlyBestSeller((prev) => !prev);
                                    setIsDropdownOpen(false);
                                }}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-5 py-2 font-sans text-xs font-medium tracking-wide transition-all duration-300 ${
                                    onlyBestSeller
                                        ? 'border-[#16233B] bg-[#16233B] text-[#F2EBDC] shadow-sm'
                                        : 'border-[#16233B]/15 bg-white text-[#16233B] hover:border-[#A88B54]'
                                }`}
                            >
                                <StarIcon
                                    className={`size-3.5 ${
                                        onlyBestSeller
                                            ? 'fill-[#A88B54] text-[#A88B54]'
                                            : 'text-[#A88B54]'
                                    }`}
                                />
                                Best Seller
                            </button>

                            {/* 4) Dropdown Kategori Lainnya */}
                            <div ref={dropdownRef} className="relative">
                                <button
                                    type="button"
                                    aria-expanded={isDropdownOpen}
                                    aria-haspopup="listbox"
                                    onClick={() =>
                                        setIsDropdownOpen((prev) => !prev)
                                    }
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-5 py-2 font-sans text-xs font-medium tracking-wide transition-all duration-300 ${
                                        isOtherCategoryActive
                                            ? 'border-[#16233B] bg-[#16233B] text-[#F2EBDC] shadow-sm'
                                            : 'border-[#16233B]/15 bg-white text-[#16233B] hover:border-[#A88B54]'
                                    }`}
                                >
                                    <span>
                                        {isOtherCategoryActive
                                            ? activeCategory
                                            : 'Kategori Lainnya'}
                                    </span>
                                    <ChevronDownIcon
                                        className={`size-3.5 transition-transform duration-200 ${
                                            isDropdownOpen ? 'rotate-180' : ''
                                        } ${
                                            isOtherCategoryActive
                                                ? 'text-[#A88B54]'
                                                : 'text-[#6E675D]'
                                        }`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            role="listbox"
                                            aria-label="Pilih kategori lainnya"
                                            initial={{
                                                opacity: 0,
                                                y: -6,
                                                scale: 0.98,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -6,
                                                scale: 0.98,
                                            }}
                                            transition={{
                                                duration: 0.18,
                                                ease: [
                                                    0.16, 1, 0.3, 1,
                                                ] as const,
                                            }}
                                            className="absolute top-full left-1/2 z-30 mt-2 min-w-[230px] -translate-x-1/2 rounded-2xl border border-[#16233B]/15 bg-white p-2 text-left shadow-xl"
                                        >
                                            {otherCategories.length > 0 ? (
                                                <div className="space-y-1">
                                                    {otherCategories.map(
                                                        (category) => {
                                                            const isSelected =
                                                                activeCategory.toLowerCase() ===
                                                                category.toLowerCase();
                                                            return (
                                                                <button
                                                                    key={
                                                                        category
                                                                    }
                                                                    type="button"
                                                                    role="option"
                                                                    aria-selected={
                                                                        isSelected
                                                                    }
                                                                    onClick={() => {
                                                                        setActiveCategory(
                                                                            category,
                                                                        );
                                                                        setIsDropdownOpen(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left font-sans text-xs font-medium transition-colors ${
                                                                        isSelected
                                                                            ? 'bg-[#16233B] text-[#F2EBDC]'
                                                                            : 'text-[#16233B] hover:bg-[#F2EBDC]'
                                                                    }`}
                                                                >
                                                                    <span>
                                                                        {
                                                                            category
                                                                        }
                                                                    </span>
                                                                    {isSelected && (
                                                                        <CheckIcon className="size-3.5 shrink-0 text-[#A88B54]" />
                                                                    )}
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="px-3 py-2 font-sans text-xs text-[#6E675D]">
                                                    Belum ada kategori lainnya.
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Tingkat 2: Grid Kartu Produk atau Empty State ─────────── */}
                {items.length === 0 ? (
                    /* Empty State: Belum ada produk di database */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: [0.16, 1, 0.3, 1] as const,
                        }}
                        className="mx-auto mt-14 max-w-xl rounded-3xl border border-[#A88B54]/25 bg-[#FAF7F0] p-8 text-center shadow-[0_12px_32px_-12px_rgba(22,35,59,0.10)] sm:p-12"
                    >
                        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#16233B] text-[#A88B54] shadow-inner">
                            <GiftIcon className="size-8 text-[#A88B54]" />
                        </div>
                        <h3 className="mt-6 font-serif text-2xl font-normal text-[#16233B]">
                            Koleksi Sedang Dipersiapkan
                        </h3>
                        <p className="mt-3 font-sans text-sm leading-relaxed text-[#6E675D]">
                            Koleksi hampers eksklusif kami sedang dipersiapkan
                            untuk musim perayaan mendatang.
                        </p>
                        <div className="mt-6 flex justify-center">
                            <a
                                href="#corporate"
                                className="inline-flex items-center gap-2 rounded-full bg-[#16233B] px-6 py-3 font-sans text-xs font-semibold tracking-wide text-[#F2EBDC] transition-colors hover:bg-[#1F304F]"
                            >
                                <SparklesIcon className="size-4 text-[#A88B54]" />
                                Ajukan Pemesanan Khusus
                            </a>
                        </div>
                    </motion.div>
                ) : filteredProducts.length === 0 ? (
                    /* Empty State: Filter tidak memiliki produk */
                    <div className="mx-auto mt-14 max-w-md py-12 text-center">
                        <p className="font-sans text-sm text-[#6E675D]">
                            Tidak ada produk yang sesuai dengan filter pilihan
                            Anda.
                        </p>
                        {hasActiveFilter && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mt-3 font-sans text-xs font-medium text-[#16233B] underline decoration-[#A88B54] underline-offset-4 hover:text-[#1F304F]"
                            >
                                Lihat semua koleksi
                            </button>
                        )}
                    </div>
                ) : (
                    /* Grid Kartu Produk Asli Database (Maksimal 8) */
                    <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <AnimatePresence mode="popLayout">
                            {displayedProducts.map((product) => {
                                return (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{
                                            duration: 0.42,
                                            ease: [0.16, 1, 0.3, 1] as const,
                                        }}
                                        viewport={{ once: true }}
                                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#A88B54]/25 bg-[#FAF7F0] shadow-[0_12px_32px_-12px_rgba(22,35,59,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-[#A88B54]/60 hover:shadow-[0_18px_38px_-12px_rgba(22,35,59,0.16)]"
                                    >
                                        {/* Foto Produk atau Placeholder Elegan */}
                                        <div className="relative aspect-square w-full overflow-hidden bg-[#16233B]/5">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                                                    <div className="flex size-14 items-center justify-center rounded-full bg-[#16233B] text-[#A88B54] shadow-sm">
                                                        <GiftIcon className="size-7 text-[#A88B54]" />
                                                    </div>
                                                    <span className="mt-3 font-serif text-xs font-semibold text-[#16233B]">
                                                        {product.name}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Inner hairline ring — kesan bingkai kemasan */}
                                            <div
                                                aria-hidden="true"
                                                className="pointer-events-none absolute inset-[6px] rounded-[6px] ring-1 ring-[#A88B54]/25 transition-all duration-300 ring-inset group-hover:ring-[#A88B54]/45"
                                            />
                                            <span className="absolute top-3 left-3 rounded-full border border-[#A88B54]/45 bg-[#FAF7F0]/95 px-2.5 py-0.5 font-sans text-[10px] font-semibold tracking-wider text-[#16233B] uppercase backdrop-blur-xs">
                                                {product.category}
                                            </span>
                                            {product.is_best_seller && (
                                                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#16233B] px-2.5 py-0.5 font-sans text-[10px] font-semibold text-[#F2EBDC] shadow-sm">
                                                    <StarIcon className="size-2.5 fill-[#A88B54] text-[#A88B54]" />
                                                    Best Seller
                                                </span>
                                            )}
                                        </div>

                                        {/* Informasi Produk */}
                                        <div className="flex flex-1 flex-col justify-between p-5">
                                            <div>
                                                <h3 className="line-clamp-1 font-serif text-lg font-semibold text-[#16233B]">
                                                    {product.name}
                                                </h3>
                                                {(product.event_category ||
                                                    product.season_tag) && (
                                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                                        {product.event_category &&
                                                            product.event_category !==
                                                                'All Occasion' && (
                                                                <span className="rounded-md bg-[#16233B]/8 px-2 py-0.5 font-sans text-[10px] font-medium text-[#16233B]">
                                                                    {
                                                                        product.event_category
                                                                    }
                                                                </span>
                                                            )}
                                                        {product.season_tag && (
                                                            <span className="rounded-md border border-[#A88B54]/30 px-2 py-0.5 font-sans text-[10px] font-medium text-[#6E675D]">
                                                                {
                                                                    product.season_tag
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <p className="mt-1.5 line-clamp-2 font-sans text-xs leading-relaxed font-normal text-[#6E675D]">
                                                    {product.short_description}
                                                </p>
                                            </div>

                                            <div className="mt-4">
                                                {/* Harga Mulai */}
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="font-sans text-[11px] font-medium text-[#6E675D]">
                                                        Mulai
                                                    </span>
                                                    <span className="font-serif text-base font-semibold text-[#16233B]">
                                                        {formatRupiah(
                                                            product.price_from,
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Baris Dua Tombol Aksi */}
                                                <div className="mt-4 flex items-center gap-2 border-t border-[#A88B54]/25 pt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDetailModal(
                                                                product,
                                                            )
                                                        }
                                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#A88B54] bg-transparent py-2 font-sans text-xs font-medium text-[#16233B] transition-colors hover:bg-[#A88B54]/12"
                                                    >
                                                        <EyeIcon className="size-3.5 text-[#A88B54]" />
                                                        Detail
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            addingProductId ===
                                                            product.id
                                                        }
                                                        onClick={() =>
                                                            handleAddToCart(
                                                                product,
                                                                1,
                                                            )
                                                        }
                                                        aria-label={`Tambah ${product.name} ke keranjang`}
                                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#16233B] py-2 font-sans text-xs font-semibold text-[#F2EBDC] transition-colors hover:bg-[#1F304F] disabled:opacity-60"
                                                    >
                                                        <ShoppingBagIcon className="size-3.5 text-[#A88B54]" />
                                                        {addingProductId ===
                                                        product.id
                                                            ? 'Menambah...'
                                                            : 'Keranjang'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* ── Tingkat 3: Tombol Menuju Halaman Katalog Lengkap ────────── */}
                {items.length > 0 && (
                    <div className="mt-14 text-center">
                        <Link
                            href="/katalog"
                            className="inline-flex items-center gap-2 rounded-full border border-[#A88B54] bg-transparent px-8 py-3.5 font-sans text-xs font-semibold tracking-wider text-[#16233B] uppercase transition-all duration-300 hover:bg-[#16233B] hover:text-[#F2EBDC] hover:shadow-md"
                        >
                            <span>{ctaLabel}</span>
                            <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* ── Pop-up Modal Detail Produk (Deep Navy & Warm Ivory) ──────────── */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        {/* Backdrop Gelap Transparan */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setSelectedProduct(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                        />

                        {/* Modal Dialog Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            transition={{
                                duration: 0.35,
                                ease: [0.16, 1, 0.3, 1] as const,
                            }}
                            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-[#A88B54]/45 bg-[#FAF7F0] shadow-2xl"
                        >
                            {/* Tombol Tutup X */}
                            <button
                                type="button"
                                aria-label="Tutup detail produk"
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full bg-[#FAF7F0]/95 text-[#16233B] shadow-xs transition-colors hover:bg-white"
                            >
                                <XIcon className="size-5" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {/* Sisi Kiri (Atas di mobile): Visual Hampers Besar */}
                                <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-[#16233B]/5 md:aspect-auto md:h-full">
                                    {selectedProduct.image_url ? (
                                        <img
                                            src={selectedProduct.image_url}
                                            alt={selectedProduct.name}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 text-center">
                                            <div className="flex size-20 items-center justify-center rounded-full bg-[#16233B] text-[#A88B54]">
                                                <GiftIcon className="size-10 text-[#A88B54]" />
                                            </div>
                                            <span className="mt-3 font-serif text-sm font-semibold text-[#16233B]">
                                                {selectedProduct.name}
                                            </span>
                                        </div>
                                    )}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:hidden" />
                                </div>

                                {/* Sisi Kanan: Detail & Daftar Isi Hampers */}
                                <div className="no-scrollbar flex max-h-[75vh] flex-col justify-between overflow-y-auto p-6 md:max-h-[580px] md:p-8">
                                    <div>
                                        <span className="inline-block rounded-full border border-[#A88B54]/45 bg-[#A88B54]/15 px-3 py-1 font-sans text-[10px] font-semibold tracking-wider text-[#16233B] uppercase">
                                            {selectedProduct.category}
                                        </span>

                                        <h3 className="mt-2.5 font-serif text-2xl font-normal text-[#16233B] md:text-3xl">
                                            {selectedProduct.name}
                                        </h3>

                                        <p className="mt-2 font-serif text-lg font-semibold text-[#16233B]">
                                            {formatRupiah(
                                                selectedProduct.price_from,
                                            )}
                                        </p>

                                        <p className="mt-3 font-sans text-xs leading-relaxed font-normal text-[#6E675D] sm:text-sm">
                                            {selectedProduct.short_description}
                                        </p>

                                        {/* Daftar Lengkap Isi Hampers */}
                                        <div className="mt-6 border-t border-[#A88B54]/25 pt-5">
                                            <h4 className="font-sans text-xs font-semibold tracking-wider text-[#16233B] uppercase">
                                                Daftar Isi Paket:
                                            </h4>
                                            <ul className="mt-3 space-y-2">
                                                {selectedProduct.contents &&
                                                selectedProduct.contents
                                                    .length > 0 ? (
                                                    selectedProduct.contents.map(
                                                        (item, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="flex items-start gap-2.5 font-sans text-xs text-[#16233B] sm:text-sm"
                                                            >
                                                                <CheckIcon className="mt-0.5 size-4 shrink-0 text-[#A88B54]" />
                                                                <span className="font-normal">
                                                                    {item}
                                                                </span>
                                                            </li>
                                                        ),
                                                    )
                                                ) : (
                                                    <li className="font-sans text-xs text-[#6E675D] italic">
                                                        Detail isi paket dapat
                                                        dikustomisasi sesuai
                                                        permintaan.
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Pengatur Kuantitas & Tombol Tambah ke Keranjang */}
                                    <div className="mt-8 space-y-3 border-t border-[#A88B54]/25 pt-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="font-sans text-xs font-semibold text-[#16233B]">
                                                Jumlah
                                            </span>
                                            <div className="inline-flex items-center gap-2 rounded-full border border-[#A88B54]/40 bg-white px-2 py-1">
                                                <button
                                                    type="button"
                                                    aria-label="Kurangi jumlah"
                                                    onClick={() =>
                                                        setModalQuantity((q) =>
                                                            Math.max(1, q - 1),
                                                        )
                                                    }
                                                    className="flex size-7 items-center justify-center rounded-full text-[#16233B] hover:bg-[#F2EBDC]"
                                                >
                                                    <MinusIcon className="size-3.5" />
                                                </button>
                                                <span className="min-w-[28px] text-center font-sans text-xs font-bold text-[#16233B]">
                                                    {modalQuantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    aria-label="Tambah jumlah"
                                                    onClick={() =>
                                                        setModalQuantity(
                                                            (q) => q + 1,
                                                        )
                                                    }
                                                    className="flex size-7 items-center justify-center rounded-full text-[#16233B] hover:bg-[#F2EBDC]"
                                                >
                                                    <PlusIcon className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={
                                                addingProductId ===
                                                selectedProduct.id
                                            }
                                            onClick={() =>
                                                handleAddToCart(
                                                    selectedProduct,
                                                    modalQuantity,
                                                    true,
                                                )
                                            }
                                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#16233B] py-3.5 font-sans text-xs font-semibold tracking-wide text-[#F2EBDC] transition-colors hover:bg-[#1F304F] disabled:opacity-60"
                                        >
                                            <ShoppingBagIcon className="size-4 text-[#A88B54]" />
                                            {addingProductId ===
                                            selectedProduct.id
                                                ? 'Menambahkan...'
                                                : `Tambah ke Keranjang (${formatRupiah(selectedProduct.price_from * modalQuantity)})`}
                                        </button>
                                        <p className="text-center font-sans text-[11px] text-[#6E675D]">
                                            Catatan kartu ucapan eksklusif dapat
                                            diisi saat checkout.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
