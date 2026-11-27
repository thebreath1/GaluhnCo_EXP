import { motion } from 'motion/react';

const WA_URL =
    'https://wa.me/6281779839434?text=Halo%20Galuh%20%26%20Co.%2C%20saya%20tertarik%20untuk%20konsultasi%20pemesanan%20hampers.';

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className={className}
        >
            <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.375c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.172.109-1.891-.125-.438-.141-.984-.328-1.688-.641-2.969-1.281-4.906-4.266-5.047-4.469-.141-.203-1.203-1.594-1.203-3.047s.75-2.156 1.031-2.453c.266-.297.594-.375.797-.375h.578c.188 0 .438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.141.328-.297.5-.141.172-.313.391-.438.516-.156.156-.313.328-.141.641.172.313.781 1.281 1.672 2.078 1.156 1.031 2.125 1.344 2.438 1.5.313.156.484.125.672-.078.188-.219.766-.891.969-1.203.203-.313.406-.266.688-.156.281.109 1.797.844 2.109 1s.516.234.594.359c.078.125.078.734-.172 1.438z" />
        </svg>
    );
}

export default function FloatingWhatsApp() {
    return (
        <aside
            aria-label="Kontak Cepat WhatsApp"
            className="fixed right-5 bottom-5 z-40 sm:right-6 sm:bottom-6"
        >
            <motion.a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Hubungi Galuh & Co. via WhatsApp"
                initial={{ opacity: 0, scale: 0.8, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex items-center rounded-full border border-[#1EBE5D] bg-[#25D366] p-1.5 text-white shadow-2xl transition-colors duration-300 hover:bg-[#1EBE5D]"
            >
                {/* Luminous Glow Ambient Ring */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1 rounded-full bg-[#25D366]/30 opacity-75 blur-md transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                    <WhatsAppIcon className="size-6" />
                </div>

                {/* Mobile: selalu tampil tanpa hover; Desktop: muncul saat hover/focus */}
                <div className="relative max-w-[140px] overflow-hidden pr-3 pl-2 whitespace-nowrap opacity-100 transition-all duration-300 ease-out md:max-w-0 md:px-0 md:opacity-0 md:group-hover:max-w-[140px] md:group-hover:pr-3.5 md:group-hover:pl-2 md:group-hover:opacity-100 md:group-focus-visible:max-w-[140px] md:group-focus-visible:pr-3.5 md:group-focus-visible:pl-2 md:group-focus-visible:opacity-100">
                    <span className="font-sans text-xs font-semibold tracking-wide text-white">
                        Hubungi
                    </span>
                </div>
            </motion.a>
        </aside>
    );
}
