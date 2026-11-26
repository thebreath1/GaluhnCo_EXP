import { Head, router } from '@inertiajs/react';
import {
    RotateCcwIcon,
    SaveIcon,
    SparklesIcon,
    UploadCloudIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import AdminLandingContentController from '@/actions/App/Http/Controllers/Admin/LandingContentController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils';

interface FieldSchema {
    section?: string;
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'boolean' | 'select';
    defaultValue: string;
    helper?: string;
    options?: Array<{ value: string; label: string }>;
}

interface SectionSchema {
    id: string;
    title: string;
    description: string;
    fields: FieldSchema[];
}

const SECTION_SCHEMAS: SectionSchema[] = [
    {
        id: 'seasonal_hero',
        title: 'Tema Musiman & Hero',
        description:
            'Atur tema musiman Hero (Fanned Showcase & Eyebrow), teks RotatingTypewriter, serta item Luxury Promo Marquee di bagian bawah Hero.',
        fields: [
            {
                section: 'seasonal',
                key: 'seasonal_ribbon_active',
                label: 'Aktifkan Promo Eyebrow Musiman',
                type: 'boolean',
                defaultValue: '1',
                helper: 'Menampilkan teks promo musiman interaktif pada kapsul eyebrow Hero.',
            },
            {
                section: 'seasonal',
                key: 'seasonal_ribbon_text',
                label: 'Teks Promo Musiman (Eyebrow Hero)',
                type: 'text',
                defaultValue:
                    'Edisi Terbatas Ramadan & Idul Fitri — Pemesanan Korporat Kini Dibuka',
                helper: 'Tampil di dalam kapsul eyebrow Hero saat status aktif.',
            },
            {
                section: 'seasonal',
                key: 'seasonal_ribbon_link',
                label: 'Tautan Klik Eyebrow Musiman',
                type: 'text',
                defaultValue: '/katalog',
                helper: 'Contoh: /katalog, /b2b/customizer, atau #koleksi',
            },
            {
                section: 'hero',
                key: 'hero_season_theme',
                label: 'Tema Cutout Parsel & Ornamen Musim',
                type: 'select',
                defaultValue: 'ramadan',
                helper: 'Menyesuaikan gambar cutout parsel tanpa background dan ornamen garis emas di sisi kanan Hero.',
                options: [
                    { value: 'default', label: 'Signature Default' },
                    { value: 'ramadan', label: 'Ramadan & Idul Fitri' },
                    { value: 'christmas', label: 'Natal & Akhir Tahun' },
                    { value: 'cny', label: 'Imlek / Chinese New Year' },
                    { value: 'wedding', label: 'Wedding & Souvenir' },
                ],
            },
            {
                section: 'hero',
                key: 'hero_season_eyebrow',
                label: 'Label Musim Cadangan (saat Promo Nonaktif)',
                type: 'text',
                defaultValue: 'RAMADAN CURATION 2026',
                helper: 'Contoh: RAMADAN CURATION 2026, CHRISTMAS EDITION, YEAR END CORPORATE',
            },
            {
                section: 'hero',
                key: 'headline_line_1',
                label: 'Judul Hero Baris 1',
                type: 'text',
                defaultValue: 'Merangkai Kehangatan',
            },
            {
                section: 'hero',
                key: 'headline_line_2',
                label: 'Judul Hero Baris 2 (sebelum kata berjalan)',
                type: 'text',
                defaultValue: 'dalam Setiap Bingkisan',
            },
            {
                section: 'hero',
                key: 'rotating_words',
                label: 'Kata Berjalan RotatingTypewriter (pisah koma)',
                type: 'text',
                defaultValue: 'Istimewa,Korporat,Hari Raya,Pernikahan',
                helper: 'Contoh: Istimewa,Korporat,Hari Raya,Pernikahan',
            },
            {
                section: 'hero',
                key: 'hero_subtitle',
                label: 'Subjudul Hero',
                type: 'textarea',
                defaultValue:
                    'Kurasi hampers eksklusif dengan kemasan penuh estetika dan sentuhan personal untuk merayakan momen berharga bersama orang terdekat maupun relasi bisnis.',
            },
            {
                section: 'hero',
                key: 'hero_cta_text',
                label: 'Teks Tombol CTA Utama',
                type: 'text',
                defaultValue: 'Jelajahi Koleksi',
            },
            {
                section: 'hero',
                key: 'hero_cta_link',
                label: 'Tautan Tombol CTA Utama',
                type: 'text',
                defaultValue: '#koleksi',
                helper: 'Contoh: #koleksi, /katalog, atau /b2b/customizer',
            },
            {
                section: 'hero',
                key: 'promo_marquee_items',
                label: 'Item Luxury Promo Marquee (bawah Hero)',
                type: 'textarea',
                defaultValue:
                    'Gratis Kartu Ucapan Kaligrafi Personal | Kustom Logo Perusahaan & Video QR (B2B) | Pengiriman Aman Double-Box Seluruh Indonesia | Kurasi Bahan Artisan Premium | 3D Gift Box Customizer Interaktif',
                helper: 'Pisahkan setiap item promo menggunakan tanda "|" atau baris baru.',
            },
        ],
    },
    {
        id: 'about',
        title: 'Tentang Kami',
        description: 'Narasi filosofi Galuh & Co. dan badge kualitas.',
        fields: [
            {
                key: 'eyebrow',
                label: 'Eyebrow',
                type: 'text',
                defaultValue: 'Tentang Galuh & Co.',
            },
            {
                key: 'title',
                label: 'Judul Utama',
                type: 'text',
                defaultValue: 'Lebih dari Sekadar Hadiah,',
            },
            {
                key: 'title_italic',
                label: 'Judul Lanjutan (Italic)',
                type: 'text',
                defaultValue: 'Sebuah Pengalaman Membuka Kebahagiaan',
            },
            {
                key: 'description',
                label: 'Paragraf Cerita Brand',
                type: 'textarea',
                defaultValue:
                    'Kami percaya setiap bingkisan membawa cerita dan ketulusan pengirimnya. Di Galuh & Co., setiap elemen dipilih dengan saksama—mulai dari kualitas isi, keharuman kemasan, hingga kartu ucapan tulisan tangan—untuk menciptakan kesan yang tak terlupakan.',
            },
            {
                key: 'badge_title',
                label: 'Judul Floating Badge',
                type: 'text',
                defaultValue: '100% Curated Quality',
            },
            {
                key: 'badge_subtitle',
                label: 'Subjudul Floating Badge',
                type: 'text',
                defaultValue: 'Artisanal, Elegant & Personal',
            },
        ],
    },
    {
        id: 'catalog',
        title: 'Katalog Koleksi',
        description: 'Header section katalog produk di halaman depan.',
        fields: [
            {
                key: 'eyebrow',
                label: 'Eyebrow',
                type: 'text',
                defaultValue: 'Koleksi Eksklusif',
            },
            {
                key: 'title',
                label: 'Judul Section',
                type: 'text',
                defaultValue: 'Kurasi Hampers untuk Setiap Momen',
            },
            {
                key: 'description',
                label: 'Deskripsi Singkat',
                type: 'textarea',
                defaultValue:
                    'Setiap koleksi dirangkai dengan harmoni rasa, aroma, dan estetika visual untuk menyampaikan apresiasi tertinggi.',
            },
            {
                key: 'cta_label',
                label: 'Label Tombol Katalog Lengkap',
                type: 'text',
                defaultValue: 'Lihat Katalog Lengkap',
            },
        ],
    },
    {
        id: 'why_us',
        title: 'Keunggulan',
        description: 'Narasi standar kualitas dan statistik pengiriman.',
        fields: [
            {
                key: 'eyebrow',
                label: 'Eyebrow',
                type: 'text',
                defaultValue: 'Standar Keunggulan Kami',
            },
            {
                key: 'title',
                label: 'Judul Utama',
                type: 'text',
                defaultValue: 'Detail Sempurna dalam',
            },
            {
                key: 'title_italic',
                label: 'Judul Lanjutan (Italic)',
                type: 'text',
                defaultValue: 'Setiap Sentuhan Bingkisan',
            },
            {
                key: 'description',
                label: 'Deskripsi Keunggulan',
                type: 'textarea',
                defaultValue:
                    'Kami menggabungkan seni kurasi artisan dengan keandalan pengerjaan tingkat tinggi untuk memastikan setiap bingkisan menghadirkan aura kemewahan sejak pertama kali diterima.',
            },
            {
                key: 'stat_number',
                label: 'Angka Statistik Badge',
                type: 'text',
                defaultValue: '5.000+',
            },
            {
                key: 'stat_label',
                label: 'Judul Statistik',
                type: 'text',
                defaultValue: 'Bingkisan Mewah Terkirim',
            },
            {
                key: 'stat_sublabel',
                label: 'Keterangan Statistik',
                type: 'text',
                defaultValue: 'Ke Seluruh Penjuru Nusantara',
            },
        ],
    },
    {
        id: 'how_to_order',
        title: 'Cara Pesan',
        description: 'Header 4 langkah proses pemesanan hampers.',
        fields: [
            {
                key: 'eyebrow',
                label: 'Eyebrow',
                type: 'text',
                defaultValue: 'Proses Pemesanan',
            },
            {
                key: 'title',
                label: 'Judul Section',
                type: 'text',
                defaultValue: 'Kemudahan Memesan dalam 4 Langkah',
            },
            {
                key: 'description',
                label: 'Deskripsi',
                type: 'textarea',
                defaultValue:
                    'Dari pemilihan hingga pengantaran, tim kurator kami siap membantu mewujudkan bingkisan terbaik tanpa kerumitan.',
            },
        ],
    },
    {
        id: 'corporate',
        title: 'Corporate B2B',
        description: 'Teks section layanan korporasi & formulir penawaran.',
        fields: [
            {
                key: 'eyebrow',
                label: 'Eyebrow Layanan',
                type: 'text',
                defaultValue: 'Layanan Korporasi',
            },
            {
                key: 'title',
                label: 'Judul Layanan Korporasi',
                type: 'text',
                defaultValue:
                    'Solusi Corporate Gifting & Kustomisasi Berskala Besar',
            },
            {
                key: 'description',
                label: 'Deskripsi Layanan Korporasi',
                type: 'textarea',
                defaultValue:
                    'Kami berpengalaman mendampingi perusahaan terkemuka dalam menyusun bingkisan hari raya, apresiasi mitra bisnis, maupun souvenir VIP event dengan efisiensi dan estetika premium.',
            },
            {
                key: 'form_eyebrow',
                label: 'Eyebrow Formulir',
                type: 'text',
                defaultValue: 'Formulir Kerjasama',
            },
            {
                key: 'form_title',
                label: 'Judul Formulir',
                type: 'text',
                defaultValue: 'Ajukan Penawaran Corporate',
            },
            {
                key: 'form_description',
                label: 'Deskripsi Formulir',
                type: 'textarea',
                defaultValue:
                    'Dapatkan proposal katalog khusus, sampel bahan, dan skema harga spesial skala korporasi.',
            },
        ],
    },
    {
        id: 'testimonials',
        title: 'Testimoni',
        description: 'Judul dan pengantar section cerita penerima.',
        fields: [
            {
                key: 'eyebrow',
                label: 'Eyebrow',
                type: 'text',
                defaultValue: 'Cerita & Apresiasi',
            },
            {
                key: 'title',
                label: 'Judul Section',
                type: 'text',
                defaultValue: 'Kehangatan yang Dirasakan Penerima',
            },
            {
                key: 'description',
                label: 'Deskripsi',
                type: 'textarea',
                defaultValue:
                    'Untaian kesan tulus dari mereka yang telah mempercayakan momen berharga bersama Galuh & Co.',
            },
        ],
    },
    {
        id: 'faq',
        title: 'FAQ',
        description: 'Judul section pertanyaan umum pemesanan.',
        fields: [
            {
                key: 'eyebrow',
                label: 'Eyebrow',
                type: 'text',
                defaultValue: 'Pertanyaan Umum',
            },
            {
                key: 'title',
                label: 'Judul Section',
                type: 'text',
                defaultValue: 'Informasi Seputar Pemesanan',
            },
            {
                key: 'description',
                label: 'Deskripsi',
                type: 'textarea',
                defaultValue:
                    'Segala hal penting yang perlu Anda ketahui mengenai layanan kurasi, proses pengemasan, dan kebijakan pengiriman kami.',
            },
        ],
    },
    {
        id: 'footer',
        title: 'CTA Penutup & Footer',
        description: 'Banner ajakan penutup serta informasi studio & kontak.',
        fields: [
            {
                key: 'cta_eyebrow',
                label: 'Eyebrow CTA Penutup',
                type: 'text',
                defaultValue: 'Mulai Kolaborasi Anda',
            },
            {
                key: 'cta_title',
                label: 'Judul CTA Penutup',
                type: 'text',
                defaultValue: 'Siap Merangkai Bingkisan',
            },
            {
                key: 'cta_title_italic',
                label: 'Judul CTA Lanjutan (Italic)',
                type: 'text',
                defaultValue: 'Berkesan Hari Ini?',
            },
            {
                key: 'cta_description',
                label: 'Deskripsi CTA Penutup',
                type: 'textarea',
                defaultValue:
                    'Konsultasikan kebutuhan hampers personal maupun corporate gifting bersama kurator Galuh & Co. Kami siap mewujudkan bingkisan istimewa Anda dengan sentuhan penuh kehangatan.',
            },
            {
                key: 'brand_tagline',
                label: 'Tagline Brand di Footer',
                type: 'textarea',
                defaultValue:
                    'House of Curated Luxury Hampers & Corporate Gifting. Merangkai estetika, kehangatan rasa, dan ketulusan hati dalam setiap bingkisan istimewa.',
            },
            {
                key: 'address',
                label: 'Alamat Studio',
                type: 'text',
                defaultValue:
                    'Jl. Gunawarman No. 42, Kebayoran Baru, Jakarta Selatan 12110',
            },
            {
                key: 'hours',
                label: 'Jam Operasional',
                type: 'text',
                defaultValue: 'Senin – Sabtu, 09.00 – 18.00 WIB',
            },
            {
                key: 'phone_display',
                label: 'Nomor Telepon Tampil',
                type: 'text',
                defaultValue: '+62 817-7983-9434',
            },
            {
                key: 'email',
                label: 'Email Resmi',
                type: 'text',
                defaultValue: 'hello@galuhco.id',
            },
            {
                key: 'instagram_handle',
                label: 'Instagram Handle',
                type: 'text',
                defaultValue: '@galuh.and.co',
            },
        ],
    },
];

type GroupedContents = Record<string, Record<string, string | null>>;

const DEFAULT_CUTOUT_BY_THEME: Record<string, string> = {
    default: '/Asset/hero/parcel-default.svg',
    ramadan: '/Asset/hero/parcel-ramadan.svg',
    christmas: '/Asset/hero/parcel-christmas.svg',
    cny: '/Asset/hero/parcel-cny.svg',
    wedding: '/Asset/hero/parcel-wedding.svg',
};

function resolveFieldSection(
    section: SectionSchema,
    field: FieldSchema,
): string {
    return field.section ?? section.id;
}

function buildInitialValues(contents: GroupedContents): Record<string, string> {
    const map: Record<string, string> = {};
    for (const section of SECTION_SCHEMAS) {
        for (const field of section.fields) {
            const targetSection = resolveFieldSection(section, field);
            const compositeKey = `${targetSection}.${field.key}`;
            const existing = contents[targetSection]?.[field.key];
            map[compositeKey] =
                existing !== undefined && existing !== null
                    ? existing
                    : field.defaultValue;
        }
    }
    return map;
}

export default function LandingContentCms({
    contents = {},
}: {
    contents?: GroupedContents;
}) {
    const [activeSectionId, setActiveSectionId] = useState<string>(
        SECTION_SCHEMAS[0].id,
    );
    const [values, setValues] = useState<Record<string, string>>(() =>
        buildInitialValues(contents),
    );
    const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
    const [heroImagePreview, setHeroImagePreview] = useState<string | null>(
        () => contents.hero?.hero_image ?? null,
    );
    const [removeHeroImage, setRemoveHeroImage] = useState(false);
    const [resettingHeroImage, setResettingHeroImage] = useState(false);
    const [saving, setSaving] = useState(false);
    const heroFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!heroImageFile) {
            return;
        }
        const objectUrl = URL.createObjectURL(heroImageFile);
        setHeroImagePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [heroImageFile]);

    useEffect(() => {
        if (!heroImageFile && !removeHeroImage) {
            setHeroImagePreview(contents.hero?.hero_image ?? null);
        }
    }, [contents.hero?.hero_image, heroImageFile, removeHeroImage]);

    const activeSection =
        SECTION_SCHEMAS.find((s) => s.id === activeSectionId) ??
        SECTION_SCHEMAS[0];

    const handleFieldChange = (
        sectionId: string,
        key: string,
        nextValue: string,
    ) => {
        setValues((prev) => ({
            ...prev,
            [`${sectionId}.${key}`]: nextValue,
        }));
    };

    const handleHeroFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) {
            return;
        }
        if (file.type !== 'image/png' && file.type !== 'image/webp') {
            toast.error(
                'Format gambar harus PNG atau WebP transparan tanpa background.',
            );
            e.target.value = '';
            return;
        }
        if (file.size > 4 * 1024 * 1024) {
            toast.error('Ukuran file gambar cutout maksimal 4 MB.');
            e.target.value = '';
            return;
        }
        setHeroImageFile(file);
        setRemoveHeroImage(false);
    };

    const handleResetToSeasonalDefault = () => {
        if (heroFileInputRef.current) {
            heroFileInputRef.current.value = '';
        }

        if (!contents.hero?.hero_image) {
            setHeroImageFile(null);
            setHeroImagePreview(null);
            setRemoveHeroImage(false);
            toast.info('Pratinjau dikembalikan ke cutout default musim.');
            return;
        }

        setResettingHeroImage(true);
        router.post(
            AdminLandingContentController.update().url,
            { remove_hero_image: true },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setHeroImageFile(null);
                    setHeroImagePreview(null);
                    setRemoveHeroImage(false);
                    toast.success(
                        'Gambar parsel hero direset ke cutout default musim.',
                    );
                },
                onError: () => {
                    toast.error('Gagal mereset gambar cutout hero.');
                },
                onFinish: () => {
                    setResettingHeroImage(false);
                },
            },
        );
    };

    const handleSaveSection = (sectionOnly: boolean) => {
        const targetSections = sectionOnly ? [activeSection] : SECTION_SCHEMAS;

        const payload = targetSections.flatMap((section) =>
            section.fields.map((field) => {
                const targetSection = resolveFieldSection(section, field);
                return {
                    section: targetSection,
                    key: field.key,
                    value: values[`${targetSection}.${field.key}`] ?? '',
                    type: field.type,
                };
            }),
        );

        const requestData: {
            contents: typeof payload;
            hero_image_file?: File;
            remove_hero_image?: boolean;
        } = {
            contents: payload,
        };

        if (!sectionOnly || activeSection.id === 'seasonal_hero') {
            if (heroImageFile) {
                requestData.hero_image_file = heroImageFile;
            }
            if (removeHeroImage) {
                requestData.remove_hero_image = true;
            }
        }

        setSaving(true);
        router.post(AdminLandingContentController.update().url, requestData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setHeroImageFile(null);
                setRemoveHeroImage(false);
                toast.success(
                    sectionOnly
                        ? `Konten section "${activeSection.title}" berhasil disimpan.`
                        : 'Seluruh konten landing page berhasil disimpan.',
                );
            },
            onError: () => {
                toast.error(
                    'Gagal menyimpan perubahan konten. Periksa kembali isian Anda.',
                );
            },
            onFinish: () => {
                setSaving(false);
            },
        });
    };

    return (
        <>
            <Head title="CMS Konten Landing Page" />

            <div className="space-y-6 p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#A88B54]/20 pb-5 sm:flex-row sm:items-center">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#16233B] px-3.5 py-1 text-xs font-semibold text-[#F2EBDC]">
                            <SparklesIcon className="size-3.5 text-[#A88B54]" />
                            CMS Halaman Depan
                        </div>
                        <h1 className="mt-2.5 font-serif text-2xl font-normal text-[#16233B] sm:text-3xl">
                            Konten Landing Page
                        </h1>
                        <p className="mt-1 font-sans text-sm text-[#6E675D]">
                            Ubah teks tajuk, tema musiman, cutout parsel, dan
                            informasi kontak halaman depan Galuh &amp; Co.
                            secara dinamis.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={saving}
                            onClick={() => handleSaveSection(true)}
                            className="gap-2 rounded-full border-[#A88B54]/40 bg-white text-[#16233B] hover:bg-[#F2EBDC]"
                        >
                            <SaveIcon className="size-4 text-[#A88B54]" />
                            Simpan Section Ini
                        </Button>
                        <Button
                            type="button"
                            disabled={saving}
                            onClick={() => handleSaveSection(false)}
                            className="gap-2 rounded-full bg-[#16233B] text-[#F2EBDC] hover:bg-[#1F304F]"
                        >
                            <SaveIcon className="size-4 text-[#A88B54]" />
                            {saving ? 'Menyimpan...' : 'Simpan Semua'}
                        </Button>
                    </div>
                </div>

                {/* Section Tabs */}
                <div className="flex flex-wrap gap-2">
                    {SECTION_SCHEMAS.map((section) => {
                        const isActive = section.id === activeSection.id;
                        return (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => setActiveSectionId(section.id)}
                                className={cn(
                                    'rounded-full px-4 py-2 font-sans text-xs font-semibold transition-all',
                                    isActive
                                        ? 'bg-[#16233B] text-[#F2EBDC] shadow-sm'
                                        : 'border border-[#A88B54]/30 bg-white text-[#16233B] hover:border-[#A88B54]/60 hover:bg-[#F2EBDC]',
                                )}
                            >
                                {section.title}
                            </button>
                        );
                    })}
                </div>

                {/* Active Section Editor Card */}
                <div className="rounded-2xl border border-[#A88B54]/25 bg-white p-6 shadow-xs sm:p-8">
                    <div className="border-b border-[#A88B54]/20 pb-4">
                        <h2 className="font-serif text-2xl font-semibold text-[#16233B]">
                            {activeSection.title}
                        </h2>
                        <p className="mt-1 text-xs text-[#6E675D] sm:text-sm">
                            {activeSection.description}
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                        {activeSection.fields.map((field) => {
                            const targetSection = resolveFieldSection(
                                activeSection,
                                field,
                            );
                            const fieldValue =
                                values[`${targetSection}.${field.key}`] ?? '';
                            const isTextarea = field.type === 'textarea';
                            const isBoolean = field.type === 'boolean';
                            const isSelect = field.type === 'select';

                            if (isBoolean) {
                                const checked = fieldValue === '1';
                                return (
                                    <div
                                        key={`${targetSection}.${field.key}`}
                                        className="flex flex-col justify-between gap-3 rounded-xl border border-[#A88B54]/25 bg-white p-4 sm:flex-row sm:items-center md:col-span-2"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Label
                                                    htmlFor={`${targetSection}_${field.key}`}
                                                    className="text-sm font-semibold text-[#16233B]"
                                                >
                                                    {field.label}
                                                </Label>
                                                <span
                                                    className={cn(
                                                        'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                                                        checked
                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                                            : 'border-gray-200 bg-gray-100 text-gray-600',
                                                    )}
                                                >
                                                    {checked
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </span>
                                            </div>
                                            {field.helper && (
                                                <p className="mt-1 text-xs text-[#6E675D]">
                                                    {field.helper}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            id={`${targetSection}_${field.key}`}
                                            type="button"
                                            role="switch"
                                            aria-checked={checked}
                                            onClick={() =>
                                                handleFieldChange(
                                                    targetSection,
                                                    field.key,
                                                    checked ? '0' : '1',
                                                )
                                            }
                                            className={cn(
                                                'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors',
                                                checked
                                                    ? 'border-[#A88B54] bg-[#16233B]'
                                                    : 'border-gray-300 bg-gray-200',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'inline-block size-5 transform rounded-full transition-transform',
                                                    checked
                                                        ? 'translate-x-6 bg-[#A88B54]'
                                                        : 'translate-x-1 bg-white',
                                                )}
                                            />
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={`${targetSection}.${field.key}`}
                                    className={cn(
                                        'grid gap-1.5',
                                        isTextarea && 'md:col-span-2',
                                    )}
                                >
                                    <Label
                                        htmlFor={`${targetSection}_${field.key}`}
                                        className="text-xs font-semibold text-[#16233B]"
                                    >
                                        {field.label}
                                    </Label>
                                    {isTextarea ? (
                                        <Textarea
                                            id={`${targetSection}_${field.key}`}
                                            rows={3}
                                            value={fieldValue}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    targetSection,
                                                    field.key,
                                                    e.target.value,
                                                )
                                            }
                                            className="border-[#A88B54]/30 bg-white text-sm text-[#16233B]"
                                        />
                                    ) : isSelect ? (
                                        <select
                                            id={`${targetSection}_${field.key}`}
                                            value={fieldValue}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    targetSection,
                                                    field.key,
                                                    e.target.value,
                                                )
                                            }
                                            className="h-9 w-full rounded-md border border-[#A88B54]/30 bg-white px-3 text-sm text-[#16233B] outline-none focus:border-[#16233B]"
                                        >
                                            {(field.options ?? []).map(
                                                (option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    ) : (
                                        <Input
                                            id={`${targetSection}_${field.key}`}
                                            value={fieldValue}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    targetSection,
                                                    field.key,
                                                    e.target.value,
                                                )
                                            }
                                            className="border-[#A88B54]/30 bg-white text-sm text-[#16233B]"
                                        />
                                    )}
                                    {field.helper && (
                                        <p className="text-[11px] text-[#6E675D]">
                                            {field.helper}
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        {activeSection.id === 'seasonal_hero' &&
                            (() => {
                                const currentThemeKey =
                                    values['hero.hero_season_theme'] ??
                                    'ramadan';
                                const defaultThemeCutout =
                                    DEFAULT_CUTOUT_BY_THEME[currentThemeKey] ??
                                    DEFAULT_CUTOUT_BY_THEME.default;
                                const activePreviewSrc =
                                    heroImagePreview ?? defaultThemeCutout;
                                const hasCustomImage = Boolean(
                                    heroImageFile ||
                                    (contents.hero?.hero_image &&
                                        !removeHeroImage),
                                );

                                return (
                                    <div className="rounded-xl border border-[#A88B54]/25 bg-white p-5 md:col-span-2">
                                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                            <div>
                                                <Label
                                                    htmlFor="hero_image_file"
                                                    className="text-sm font-semibold text-[#16233B]"
                                                >
                                                    Foto Cutout Parsel Hero (PNG
                                                    / WebP Transparan)
                                                </Label>
                                                <p className="mt-1 text-xs text-[#6E675D]">
                                                    Unggah foto parsel tanpa
                                                    background (format{' '}
                                                    <strong className="font-semibold text-[#16233B]">
                                                        PNG atau WebP transparan
                                                    </strong>
                                                    , maks. 4 MB) agar melayang
                                                    menyatu di atas latar Deep
                                                    Navy Hero.
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <label
                                                    htmlFor="hero_image_file"
                                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#A88B54]/40 bg-[#FAF7F0] px-3.5 py-2 text-xs font-semibold text-[#16233B] transition-colors hover:bg-[#F2EBDC]"
                                                >
                                                    <UploadCloudIcon className="size-4 text-[#A88B54]" />
                                                    Pilih PNG / WebP
                                                </label>
                                                <input
                                                    ref={heroFileInputRef}
                                                    id="hero_image_file"
                                                    type="file"
                                                    accept="image/png,image/webp"
                                                    onChange={
                                                        handleHeroFileSelect
                                                    }
                                                    className="hidden"
                                                />
                                                {hasCustomImage && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={
                                                            resettingHeroImage ||
                                                            saving
                                                        }
                                                        onClick={
                                                            handleResetToSeasonalDefault
                                                        }
                                                        className="gap-1.5 rounded-xl border-[#A88B54]/50 text-xs text-[#16233B] hover:bg-[#FAF7F0]"
                                                    >
                                                        <RotateCcwIcon className="size-3.5 text-[#A88B54]" />
                                                        {resettingHeroImage
                                                            ? 'Mereset...'
                                                            : 'Reset ke Default Musim'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Live Preview di Atas Latar Deep Navy Hero (#16233B) */}
                                        <div className="relative mt-4 flex min-h-[250px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#A88B54]/30 bg-[#16233B] p-6">
                                            <div
                                                aria-hidden="true"
                                                className="pointer-events-none absolute size-52 rounded-full bg-[#A88B54]/15 blur-2xl"
                                            />
                                            <span className="relative z-10 mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#A88B54]/40 bg-[#1E2F4D]/85 px-3 py-1 text-[11px] font-semibold tracking-wider text-[#F2EBDC] uppercase">
                                                <SparklesIcon className="size-3 text-[#A88B54]" />
                                                {heroImageFile
                                                    ? 'Pratinjau Unggahan Baru — Klik Simpan'
                                                    : hasCustomImage
                                                      ? 'Cutout Kustom Aktif'
                                                      : `Cutout Default Musim (${currentThemeKey})`}
                                            </span>
                                            <img
                                                src={activePreviewSrc}
                                                alt="Pratinjau cutout parsel di atas latar Deep Navy"
                                                className="relative z-10 max-h-52 w-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)]"
                                            />
                                        </div>
                                    </div>
                                );
                            })()}
                    </div>
                </div>
            </div>
        </>
    );
}
