import { ArrowUpRightIcon, MessageCircleIcon } from 'lucide-react';
import { getCmsText, type SectionContent } from '@/components/landing/cms';

const WA_URL =
    'https://wa.me/6281779839434?text=Halo%20Galuh%20%26%20Co.%2C%20saya%20tertarik%20untuk%20konsultasi%20pemesanan%20hampers.';

export default function ClosingCtaSection({
    content,
}: {
    content?: SectionContent;
}) {
    const ctaEyebrow = getCmsText(
        content,
        'cta_eyebrow',
        'Mulai Kolaborasi Anda',
    );
    const ctaTitle = getCmsText(
        content,
        'cta_title',
        'Siap Merangkai Bingkisan',
    );
    const ctaTitleItalic = getCmsText(
        content,
        'cta_title_italic',
        'Berkesan Hari Ini?',
    );
    const ctaDescription = getCmsText(
        content,
        'cta_description',
        'Konsultasikan kebutuhan hampers personal maupun corporate gifting bersama kurator Galuh & Co. Kami siap mewujudkan bingkisan istimewa Anda dengan sentuhan penuh kehangatan.',
    );

    const handleSmoothScroll = (
        e: React.MouseEvent<HTMLAnchorElement>,
        targetId: string,
    ) => {
        if (targetId.startsWith('#')) {
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <section
            aria-label="Konsultasi Pemesanan Hampers"
            className="bg-[#F2EBDC] px-6 py-16 md:py-20"
        >
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[#A88B54]/30 bg-[#16233B] px-6 py-12 text-center text-[#F2EBDC] shadow-xl md:px-14 md:py-16">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(30,47,77,0.85) 0%, rgba(22,35,59,0) 72%), radial-gradient(circle at 85% 85%, rgba(168,139,84,0.12) 0%, transparent 50%)',
                    }}
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-3 rounded-[1.5rem] border border-[#A88B54]/20"
                />

                <div className="relative z-10 mx-auto max-w-3xl">
                    <span className="font-sans text-xs font-semibold tracking-[0.24em] text-[#A88B54] uppercase">
                        {ctaEyebrow}
                    </span>

                    <h2 className="mt-3 font-serif text-3xl leading-tight font-normal tracking-normal text-[#F2EBDC] sm:text-4xl lg:text-5xl">
                        {ctaTitle}{' '}
                        <span className="italic">{ctaTitleItalic}</span>
                    </h2>

                    <p className="mt-4 font-sans text-sm leading-relaxed font-normal text-[#F2EBDC]/85 sm:text-base">
                        {ctaDescription}
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <a
                            href={WA_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#A88B54] px-8 py-3.5 font-sans text-sm font-semibold tracking-wide text-[#16233B] shadow-lg shadow-[#A88B54]/15 transition-all duration-300 hover:scale-[1.02] hover:bg-[#B89B64] hover:shadow-[#A88B54]/25 active:scale-[0.98] sm:w-auto"
                        >
                            <MessageCircleIcon className="size-4" />
                            Konsultasi via WhatsApp
                        </a>

                        <a
                            href="#corporate"
                            onClick={(e) => handleSmoothScroll(e, '#corporate')}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#F2EBDC]/45 px-8 py-3.5 font-sans text-sm font-medium tracking-wide text-[#F2EBDC] backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-[#F2EBDC]/10 active:scale-[0.98] sm:w-auto"
                        >
                            Ajukan Penawaran Corporate
                            <ArrowUpRightIcon className="size-4 text-[#A88B54]" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
