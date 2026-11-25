const DEFAULT_PROMO_ITEMS = [
    'Gratis Kartu Ucapan Kaligrafi Personal',
    'Kustom Logo Perusahaan & Video QR (B2B)',
    'Pengiriman Aman Double-Box Seluruh Indonesia',
    'Kurasi Bahan Artisan Premium',
    '3D Gift Box Customizer Interaktif',
];

function parseMarqueeItems(itemsRaw?: string | null): string[] {
    if (!itemsRaw || itemsRaw.trim() === '') {
        return DEFAULT_PROMO_ITEMS;
    }

    const parsed = itemsRaw
        .split(/\r?\n|\|/)
        .map((item) => item.trim())
        .filter((item) => item !== '');

    return parsed.length > 0 ? parsed : DEFAULT_PROMO_ITEMS;
}

export default function PromoMarquee({
    itemsRaw,
}: {
    itemsRaw?: string | null;
}) {
    const items = parseMarqueeItems(itemsRaw);

    return (
        <div
            aria-label="Keunggulan dan Promo Eksklusif Galuh & Co."
            className="relative z-20 w-full overflow-hidden border-t border-b border-t-[#A88B54]/30 border-b-[#A88B54]/25 bg-[#16233B] py-3.5 text-[#F2EBDC]"
        >
            <div className="animate-marquee flex w-max items-center hover:[animation-play-state:paused]">
                {[0, 1].map((trackIndex) => (
                    <div
                        key={trackIndex}
                        aria-hidden={trackIndex === 1}
                        className="flex shrink-0 items-center"
                    >
                        {items.map((text, itemIndex) => (
                            <div
                                key={`${trackIndex}-${itemIndex}`}
                                className="flex shrink-0 items-center gap-6 px-4 sm:gap-8 sm:px-5"
                            >
                                <span className="font-sans text-[11px] font-semibold tracking-[0.2em] whitespace-nowrap text-[#F2EBDC] uppercase sm:text-xs">
                                    {text}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="font-serif text-sm text-[#A88B54]"
                                >
                                    ✦
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
