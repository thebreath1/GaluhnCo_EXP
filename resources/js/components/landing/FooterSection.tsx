import {
    ClockIcon,
    InstagramIcon,
    MailIcon,
    MapPinIcon,
    PhoneIcon,
} from 'lucide-react';
import { getCmsText, type SectionContent } from '@/components/landing/cms';

const QUICK_LINKS = [
    { href: '#tentang', label: 'Tentang Kami' },
    { href: '#koleksi', label: 'Koleksi Hampers' },
    { href: '#cara-pesan', label: 'Cara Pemesanan' },
    { href: '#corporate', label: 'Corporate Gifting' },
    { href: '#faq', label: 'Pertanyaan Umum (FAQ)' },
];

export default function FooterSection({
    content,
}: {
    content?: SectionContent;
}) {
    const brandTagline = getCmsText(
        content,
        'brand_tagline',
        'House of Curated Luxury Hampers & Corporate Gifting. Merangkai estetika, kehangatan rasa, dan ketulusan hati dalam setiap bingkisan istimewa.',
    );
    const address = getCmsText(
        content,
        'address',
        'Jl. Gunawarman No. 42, Kebayoran Baru, Jakarta Selatan 12110',
    );
    const hours = getCmsText(
        content,
        'hours',
        'Senin – Sabtu, 09.00 – 18.00 WIB',
    );
    const phoneDisplay = getCmsText(
        content,
        'phone_display',
        '+62 817-7983-9434',
    );
    const email = getCmsText(content, 'email', 'hello@galuhco.id');
    const instagramHandle = getCmsText(
        content,
        'instagram_handle',
        '@galuh.and.co',
    );

    const handleQuickLinkClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        targetId: string,
    ) => {
        if (!targetId.startsWith('#')) {
            return;
        }
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        e.preventDefault();
        window.location.href = `/${targetId}`;
    };

    return (
        <footer className="relative bg-[#16233B] text-[#F2EBDC]">
            {/* ── Garis Aksen Pita Brass Tipis dengan Ornamen Simpul di Batas Atas ── */}
            <div className="relative border-t border-[#A88B54]/40">
                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center justify-center">
                    <div className="flex items-center gap-1.5 rounded-full border border-[#A88B54] bg-[#16233B] px-3 py-1 shadow-md">
                        <span className="size-1 rounded-full bg-[#A88B54]" />
                        <span className="font-serif text-[10px] tracking-[0.25em] text-[#F2EBDC] uppercase">
                            Galuh &amp; Co.
                        </span>
                        <span className="size-1 rounded-full bg-[#A88B54]" />
                    </div>
                </div>
            </div>

            {/* ── Grid Footer 3 Kolom ──────────────────────────────────────── */}
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pt-16 pb-10 md:grid-cols-3 md:gap-10">
                {/* Kolom 1: Brand & Medsos */}
                <div className="space-y-4">
                    <div className="flex items-center">
                        <img
                            src="/asset/logo/Logo_galu&co.png"
                            alt="Galuh & Co."
                            loading="lazy"
                            decoding="async"
                            className="h-10 w-auto object-contain sm:h-12"
                        />
                    </div>
                    <p className="font-sans text-xs leading-relaxed font-normal tracking-normal text-[#F2EBDC]/85 sm:text-sm">
                        {brandTagline}
                    </p>
                    <div className="pt-2">
                        <a
                            href="https://instagram.com/galuh.and.co"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-[#A88B54]/45 bg-[#F2EBDC]/5 px-4 py-2 font-sans text-xs font-medium text-[#F2EBDC] transition-colors hover:border-[#A88B54] hover:bg-[#A88B54]/15"
                        >
                            <InstagramIcon className="size-4 text-[#A88B54]" />
                            <span>{instagramHandle}</span>
                        </a>
                    </div>
                </div>

                {/* Kolom 2: Navigasi Cepat */}
                <div>
                    <h4 className="font-serif text-lg font-semibold text-[#A88B54]">
                        Navigasi
                    </h4>
                    <ul className="mt-4 space-y-2.5 font-sans text-xs sm:text-sm">
                        {QUICK_LINKS.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    onClick={(e) =>
                                        handleQuickLinkClick(e, link.href)
                                    }
                                    className="text-[#F2EBDC]/85 transition-colors duration-200 hover:text-[#A88B54]"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Kolom 3: Workshop Studio & Kontak */}
                <div className="space-y-3 font-sans text-xs text-[#F2EBDC]/85 sm:text-sm">
                    <h4 className="font-serif text-lg font-semibold text-[#A88B54]">
                        Studio &amp; Kontak Resmi
                    </h4>

                    <div className="flex items-start gap-3 pt-1">
                        <MapPinIcon className="mt-0.5 size-4 shrink-0 text-[#A88B54]" />
                        <span>{address}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <ClockIcon className="size-4 shrink-0 text-[#A88B54]" />
                        <span>{hours}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <PhoneIcon className="size-4 shrink-0 text-[#A88B54]" />
                        <a
                            href="https://wa.me/6281779839434"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-[#A88B54]"
                        >
                            {phoneDisplay}
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
                        <MailIcon className="size-4 shrink-0 text-[#A88B54]" />
                        <a
                            href={`mailto:${email}`}
                            className="transition-colors hover:text-[#A88B54]"
                        >
                            {email}
                        </a>
                    </div>
                </div>
            </div>

            {/* ── Baris Copyright ──────────────────────────────────────────── */}
            <div className="border-t border-[#F2EBDC]/15 py-6 text-center">
                <p className="font-sans text-xs text-[#F2EBDC]/75">
                    &copy; {new Date().getFullYear()} GALUH &amp; CO. All rights
                    reserved.
                </p>
            </div>
        </footer>
    );
}
