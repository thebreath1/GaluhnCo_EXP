import { Link, usePage } from '@inertiajs/react';
import { ArrowRightIcon, SparklesIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import type { SharedPageProps } from '@/types';

export interface SeasonalRibbonProps {
    active?: boolean;
    text?: string;
    link?: string;
    dismissed?: boolean;
    onDismiss?: () => void;
}

export default function SeasonalRibbon({
    active,
    text,
    link,
    dismissed,
    onDismiss,
}: SeasonalRibbonProps) {
    const { seasonalRibbon } = usePage<SharedPageProps>().props;
    const [internalDismissed, setInternalDismissed] = useState(false);

    const isActive = active ?? seasonalRibbon?.active ?? false;
    const displayText = (text ?? seasonalRibbon?.text ?? '').trim();
    const targetLink =
        (link ?? seasonalRibbon?.link ?? '/katalog').trim() || '/katalog';
    const isDismissed = dismissed ?? internalDismissed;

    if (!isActive || isDismissed || displayText === '') {
        return null;
    }

    const handleDismiss = () => {
        if (onDismiss) {
            onDismiss();
            return;
        }
        setInternalDismissed(true);
    };

    const handleAnchorClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    };

    const linkContent = (
        <span className="inline-flex items-center justify-center gap-2 text-center font-sans text-xs font-medium tracking-wide text-[#F2EBDC] transition-colors group-hover:text-[#F2EBDC] sm:text-sm">
            <SparklesIcon className="size-3.5 shrink-0 text-[#A88B54]" />
            <span>{displayText}</span>
            <ArrowRightIcon className="size-3.5 shrink-0 text-[#A88B54] transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
    );

    return (
        <div
            role="region"
            aria-label="Pengumuman Musiman"
            className="bg-[#16233B] pt-[88px]"
        >
            <div className="border-y border-[#A88B54]/30 bg-gradient-to-r from-[#16233B] via-[#1E2F4D] to-[#16233B] px-4 py-2.5 sm:px-6">
                <div className="relative mx-auto flex max-w-6xl items-center justify-center pr-8">
                    {targetLink.startsWith('#') ? (
                        <a
                            href={targetLink}
                            onClick={(e) => handleAnchorClick(e, targetLink)}
                            className="group inline-flex items-center justify-center rounded-full px-2 py-0.5 focus-visible:outline-2 focus-visible:outline-[#A88B54]"
                        >
                            {linkContent}
                        </a>
                    ) : targetLink.startsWith('/') ? (
                        <Link
                            href={targetLink}
                            className="group inline-flex items-center justify-center rounded-full px-2 py-0.5 focus-visible:outline-2 focus-visible:outline-[#A88B54]"
                        >
                            {linkContent}
                        </Link>
                    ) : (
                        <a
                            href={targetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center justify-center rounded-full px-2 py-0.5 focus-visible:outline-2 focus-visible:outline-[#A88B54]"
                        >
                            {linkContent}
                        </a>
                    )}

                    <button
                        type="button"
                        onClick={handleDismiss}
                        aria-label="Tutup pengumuman musiman"
                        className="absolute right-0 inline-flex size-7 items-center justify-center rounded-full text-[#F2EBDC]/70 transition-colors hover:bg-[#F2EBDC]/10 hover:text-[#F2EBDC] focus-visible:outline-2 focus-visible:outline-[#A88B54]"
                    >
                        <XIcon className="size-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
