import { CheckIcon, CopyIcon, SparklesIcon, TagIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { PublicPromotion } from '@/types/product';

export function formatPromoEndDate(iso: string | null): string | null {
    if (!iso) {
        return null;
    }

    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function ActivePromoBanner({
    promotions = [],
}: {
    promotions?: PublicPromotion[];
}) {
    const [copiedId, setCopiedId] = useState<number | null>(null);

    if (promotions.length === 0) {
        return null;
    }

    const handleCopyCode = (promo: PublicPromotion) => {
        if (!promo.code) return;
        void navigator.clipboard?.writeText(promo.code);
        setCopiedId(promo.id);
        toast.success(`Kode promo "${promo.code}" berhasil disalin.`);
        setTimeout(
            () => setCopiedId((prev) => (prev === promo.id ? null : prev)),
            2000,
        );
    };

    return (
        <div className="mt-8 rounded-2xl border border-[#A88B54]/45 bg-[#16233B] p-4 text-[#F2EBDC] shadow-[0_14px_34px_-14px_rgba(22,35,59,0.35)] sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#1E2F4D] text-[#A88B54]">
                        <SparklesIcon className="size-4" />
                    </div>
                    <div className="text-left">
                        <p className="font-sans text-[11px] font-semibold tracking-[0.2em] text-[#A88B54] uppercase">
                            Penawaran Spesial Berlangsung
                        </p>
                        <p className="font-serif text-base text-[#F2EBDC] sm:text-lg">
                            Nikmati potongan harga eksklusif untuk pemesanan
                            periode ini
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {promotions.slice(0, 3).map((promo) => {
                        const endsLabel = formatPromoEndDate(promo.ends_at);
                        return (
                            <div
                                key={promo.id}
                                className="flex items-center gap-2.5 rounded-xl border border-[#A88B54]/40 bg-[#1E2F4D]/85 px-3 py-2 text-left"
                            >
                                <TagIcon className="size-3.5 shrink-0 text-[#A88B54]" />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="truncate font-sans text-xs font-semibold text-[#F2EBDC]">
                                            {promo.name}
                                        </span>
                                        <span className="rounded bg-[#A88B54] px-1.5 py-0.5 font-sans text-[10px] font-bold text-[#16233B]">
                                            {promo.discount_label}
                                        </span>
                                    </div>
                                    {endsLabel && (
                                        <p className="font-sans text-[10px] text-[#F2EBDC]/70">
                                            s.d. {endsLabel}
                                        </p>
                                    )}
                                </div>
                                {promo.apply_mode === 'code' && promo.code && (
                                    <button
                                        type="button"
                                        onClick={() => handleCopyCode(promo)}
                                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#A88B54]/60 bg-[#16233B] px-2 py-1 font-mono text-[11px] font-bold text-[#A88B54] transition-colors hover:bg-[#A88B54] hover:text-[#16233B]"
                                        title="Salin kode promo"
                                    >
                                        <span>{promo.code}</span>
                                        {copiedId === promo.id ? (
                                            <CheckIcon className="size-3" />
                                        ) : (
                                            <CopyIcon className="size-3" />
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
