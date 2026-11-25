import { AnimatePresence, motion } from 'motion/react';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { getCmsText, type SectionContent } from '@/components/landing/cms';

const FAQS = [
    {
        question:
            'Berapa minimal pemesanan untuk hampers personal maupun corporate?',
        answer: 'Untuk koleksi reguler tidak ada minimal pemesanan (bisa pesan mulai dari 1 kotak). Untuk pemesanan corporate dengan custom logo pada kemasan/sleeve, minimal pemesanan adalah 20 kotak.',
    },
    {
        question: 'Berapa lama waktu pengerjaan pesanan?',
        answer: 'Pesanan reguler membutuhkan waktu 1–2 hari kerja. Untuk pesanan custom atau jumlah besar (corporate), disarankan melakukan pemesanan minimal 7–14 hari kerja sebelum tanggal pengiriman.',
    },
    {
        question:
            'Apakah bisa request isi hampers dan desain kartu ucapan sendiri?',
        answer: 'Tentu. Anda dapat menyesuaikan kombinasi isi produk sesuai anggaran, memilih warna pita, serta menyertakan pesan khusus yang akan kami cetak pada kartu ucapan eksklusif.',
    },
    {
        question: 'Apakah melayani pengiriman ke luar kota?',
        answer: 'Ya, kami melayani pengiriman ke seluruh Indonesia menggunakan ekspedisi terpercaya dengan standar pengemasan berlapis (double-box dan pelindung benturan) agar kotak tetap rapi saat tiba.',
    },
    {
        question:
            'Bagaimana dengan masa kedaluwarsa (expired date) produk makanan dan minuman?',
        answer: 'Seluruh produk konsumsi dirangkai segar mendekati tanggal pengiriman dengan masa simpan minimal 3 hingga 6 bulan ke depan.',
    },
    {
        question:
            'Apakah Galuh & Co. menyediakan invoice resmi untuk kebutuhan perusahaan?',
        answer: 'Ya, kami menyediakan invoice resmi dan dokumen administrasi lengkap untuk seluruh transaksi corporate gifting.',
    },
    {
        question:
            'Bisakah mengirimkan hampers langsung ke banyak alamat penerima sekaligus?',
        answer: 'Sangat bisa. Anda cukup mengirimkan daftar nama, nomor telepon, dan alamat penerima dalam format spreadsheet, dan tim kami akan mengatur seluruh proses pengirimannya.',
    },
];

export default function FaqSection({ content }: { content?: SectionContent }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const eyebrow = getCmsText(content, 'eyebrow', 'Pertanyaan Umum');
    const title = getCmsText(content, 'title', 'Informasi Seputar Pemesanan');
    const description = getCmsText(
        content,
        'description',
        'Segala hal penting yang perlu Anda ketahui mengenai layanan kurasi, proses pengemasan, dan kebijakan pengiriman kami.',
    );

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section
            id="faq"
            className="relative scroll-mt-20 overflow-hidden border-t border-[#A88B54]/25 bg-[#F2EBDC] py-20 md:py-28"
        >
            <div className="mx-auto max-w-3xl px-6">
                {/* Header */}
                <div className="relative text-center">
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
                    <p className="relative mt-4 font-sans text-sm font-normal text-[#6E675D] sm:text-base">
                        {description}
                    </p>
                </div>

                {/* 7 Accordion Items */}
                <div className="mt-12 space-y-4">
                    {FAQS.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                className="overflow-hidden rounded-2xl border border-[#A88B54]/25 bg-[#FAF7F0] shadow-[0_12px_30px_-12px_rgba(22,35,59,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#A88B54]/60 hover:shadow-[0_18px_38px_-12px_rgba(22,35,59,0.16)]"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleFaq(index)}
                                    aria-expanded={isOpen}
                                    className="flex w-full items-center justify-between p-5 text-left sm:p-6"
                                >
                                    <span className="pr-4 font-sans text-base leading-snug font-semibold text-[#16233B] md:text-lg">
                                        {faq.question}
                                    </span>
                                    <ChevronDownIcon
                                        className={`size-5 shrink-0 text-[#A88B54] transition-transform duration-300 ${
                                            isOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                height: 0,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            exit={{
                                                opacity: 0,
                                                height: 0,
                                            }}
                                            transition={{
                                                duration: 0.35,
                                                ease: [0.16, 1, 0.3, 1],
                                            }}
                                        >
                                            <div className="border-t border-[#A88B54]/25 px-5 pt-3 pb-6 sm:px-6">
                                                <p className="font-sans text-sm leading-relaxed font-normal text-[#16233B]/80">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
