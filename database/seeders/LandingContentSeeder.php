<?php

namespace Database\Seeders;

use App\Models\LandingContent;
use Illuminate\Database\Seeder;

class LandingContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $entries = [
            // Seasonal Ribbon
            ['section' => 'seasonal', 'key' => 'seasonal_ribbon_active', 'value' => '1', 'type' => 'boolean'],
            ['section' => 'seasonal', 'key' => 'seasonal_ribbon_text', 'value' => 'Edisi Terbatas Ramadan & Idul Fitri — Pemesanan Korporat Kini Dibuka', 'type' => 'text'],
            ['section' => 'seasonal', 'key' => 'seasonal_ribbon_link', 'value' => '/katalog', 'type' => 'text'],

            // Hero
            ['section' => 'hero', 'key' => 'hero_season_theme', 'value' => 'ramadan', 'type' => 'text'],
            ['section' => 'hero', 'key' => 'hero_season_eyebrow', 'value' => 'RAMADAN CURATION 2026', 'type' => 'text'],
            ['section' => 'hero', 'key' => 'hero_title', 'value' => 'Merangkai Kehangatan dalam Setiap Bingkisan Istimewa', 'type' => 'text'],
            ['section' => 'hero', 'key' => 'hero_subtitle', 'value' => 'Kurasi hampers eksklusif dengan kemasan penuh estetika dan sentuhan personal untuk merayakan momen berharga bersama orang terdekat maupun relasi bisnis.', 'type' => 'textarea'],
            ['section' => 'hero', 'key' => 'hero_cta_text', 'value' => 'Jelajahi Koleksi', 'type' => 'text'],
            ['section' => 'hero', 'key' => 'hero_cta_link', 'value' => '#koleksi', 'type' => 'text'],
            ['section' => 'hero', 'key' => 'promo_marquee_items', 'value' => 'Gratis Kartu Ucapan Kaligrafi Personal | Kustom Logo Perusahaan & Video QR (B2B) | Pengiriman Aman Double-Box Seluruh Indonesia | Kurasi Bahan Artisan Premium | 3D Gift Box Customizer Interaktif', 'type' => 'textarea'],
            ['section' => 'hero', 'key' => 'eyebrow', 'value' => 'Curated Luxury Hampers & Corporate Gifting', 'type' => 'text'],
            ['section' => 'hero', 'key' => 'headline_line_1', 'value' => 'Merangkai Kehangatan', 'type' => 'text'],
            ['section' => 'hero', 'key' => 'headline_line_2', 'value' => 'dalam Setiap Bingkisan', 'type' => 'text'],
            ['section' => 'hero', 'key' => 'rotating_words', 'value' => 'Istimewa,Korporat,Hari Raya,Pernikahan', 'type' => 'text'],
            ['section' => 'hero', 'key' => 'subheadline', 'value' => 'Kurasi hampers eksklusif dengan kemasan penuh estetika dan sentuhan personal untuk merayakan momen berharga bersama orang terdekat maupun relasi bisnis.', 'type' => 'textarea'],
            ['section' => 'hero', 'key' => 'primary_cta_label', 'value' => 'Lihat Koleksi', 'type' => 'text'],
            ['section' => 'hero', 'key' => 'secondary_cta_label', 'value' => 'Pesan via WhatsApp', 'type' => 'text'],

            // About
            ['section' => 'about', 'key' => 'eyebrow', 'value' => 'Tentang Galuh & Co.', 'type' => 'text'],
            ['section' => 'about', 'key' => 'title', 'value' => 'Lebih dari Sekadar Hadiah,', 'type' => 'text'],
            ['section' => 'about', 'key' => 'title_italic', 'value' => 'Sebuah Pengalaman Membuka Kebahagiaan', 'type' => 'text'],
            ['section' => 'about', 'key' => 'description', 'value' => 'Kami percaya setiap bingkisan membawa cerita dan ketulusan pengirimnya. Di Galuh & Co., setiap elemen dipilih dengan saksama—mulai dari kualitas isi, keharuman kemasan, hingga kartu ucapan tulisan tangan—untuk menciptakan kesan yang tak terlupakan.', 'type' => 'textarea'],
            ['section' => 'about', 'key' => 'badge_title', 'value' => '100% Curated Quality', 'type' => 'text'],
            ['section' => 'about', 'key' => 'badge_subtitle', 'value' => 'Artisanal, Elegant & Personal', 'type' => 'text'],

            // Catalog
            ['section' => 'catalog', 'key' => 'eyebrow', 'value' => 'Koleksi Eksklusif', 'type' => 'text'],
            ['section' => 'catalog', 'key' => 'title', 'value' => 'Kurasi Hampers untuk Setiap Momen', 'type' => 'text'],
            ['section' => 'catalog', 'key' => 'description', 'value' => 'Setiap koleksi dirangkai dengan harmoni rasa, aroma, dan estetika visual untuk menyampaikan apresiasi tertinggi.', 'type' => 'textarea'],
            ['section' => 'catalog', 'key' => 'cta_label', 'value' => 'Lihat Katalog Lengkap', 'type' => 'text'],

            // Why Us
            ['section' => 'why_us', 'key' => 'eyebrow', 'value' => 'Standar Keunggulan Kami', 'type' => 'text'],
            ['section' => 'why_us', 'key' => 'title', 'value' => 'Detail Sempurna dalam', 'type' => 'text'],
            ['section' => 'why_us', 'key' => 'title_italic', 'value' => 'Setiap Sentuhan Bingkisan', 'type' => 'text'],
            ['section' => 'why_us', 'key' => 'description', 'value' => 'Kami menggabungkan seni kurasi artisan dengan keandalan pengerjaan tingkat tinggi untuk memastikan setiap bingkisan menghadirkan aura kemewahan sejak pertama kali diterima.', 'type' => 'textarea'],
            ['section' => 'why_us', 'key' => 'stat_number', 'value' => '5.000+', 'type' => 'text'],
            ['section' => 'why_us', 'key' => 'stat_label', 'value' => 'Bingkisan Mewah Terkirim', 'type' => 'text'],
            ['section' => 'why_us', 'key' => 'stat_sublabel', 'value' => 'Ke Seluruh Penjuru Nusantara', 'type' => 'text'],

            // How To Order
            ['section' => 'how_to_order', 'key' => 'eyebrow', 'value' => 'Proses Pemesanan', 'type' => 'text'],
            ['section' => 'how_to_order', 'key' => 'title', 'value' => 'Kemudahan Memesan dalam 4 Langkah', 'type' => 'text'],
            ['section' => 'how_to_order', 'key' => 'description', 'value' => 'Dari pemilihan hingga pengantaran, tim kurator kami siap membantu mewujudkan bingkisan terbaik tanpa kerumitan.', 'type' => 'textarea'],

            // Corporate
            ['section' => 'corporate', 'key' => 'eyebrow', 'value' => 'Layanan Korporasi', 'type' => 'text'],
            ['section' => 'corporate', 'key' => 'title', 'value' => 'Solusi Corporate Gifting & Kustomisasi Berskala Besar', 'type' => 'text'],
            ['section' => 'corporate', 'key' => 'description', 'value' => 'Kami berpengalaman mendampingi perusahaan terkemuka dalam menyusun bingkisan hari raya, apresiasi mitra bisnis, maupun souvenir VIP event dengan efisiensi dan estetika premium.', 'type' => 'textarea'],
            ['section' => 'corporate', 'key' => 'form_eyebrow', 'value' => 'Formulir Kerjasama', 'type' => 'text'],
            ['section' => 'corporate', 'key' => 'form_title', 'value' => 'Ajukan Penawaran Corporate', 'type' => 'text'],
            ['section' => 'corporate', 'key' => 'form_description', 'value' => 'Dapatkan proposal katalog khusus, sampel bahan, dan skema harga spesial skala korporasi.', 'type' => 'textarea'],

            // Testimonials
            ['section' => 'testimonials', 'key' => 'eyebrow', 'value' => 'Cerita & Apresiasi', 'type' => 'text'],
            ['section' => 'testimonials', 'key' => 'title', 'value' => 'Kehangatan yang Dirasakan Penerima', 'type' => 'text'],
            ['section' => 'testimonials', 'key' => 'description', 'value' => 'Untaian kesan tulus dari mereka yang telah mempercayakan momen berharga bersama Galuh & Co.', 'type' => 'textarea'],

            // FAQ
            ['section' => 'faq', 'key' => 'eyebrow', 'value' => 'Pertanyaan Umum', 'type' => 'text'],
            ['section' => 'faq', 'key' => 'title', 'value' => 'Informasi Seputar Pemesanan', 'type' => 'text'],
            ['section' => 'faq', 'key' => 'description', 'value' => 'Segala hal penting yang perlu Anda ketahui mengenai layanan kurasi, proses pengemasan, dan kebijakan pengiriman kami.', 'type' => 'textarea'],

            // Footer
            ['section' => 'footer', 'key' => 'cta_eyebrow', 'value' => 'Mulai Kolaborasi Anda', 'type' => 'text'],
            ['section' => 'footer', 'key' => 'cta_title', 'value' => 'Siap Merangkai Bingkisan', 'type' => 'text'],
            ['section' => 'footer', 'key' => 'cta_title_italic', 'value' => 'Berkesan Hari Ini?', 'type' => 'text'],
            ['section' => 'footer', 'key' => 'cta_description', 'value' => 'Konsultasikan kebutuhan hampers personal maupun corporate gifting bersama kurator Galuh & Co. Kami siap mewujudkan bingkisan istimewa Anda dengan sentuhan penuh kehangatan.', 'type' => 'textarea'],
            ['section' => 'footer', 'key' => 'brand_tagline', 'value' => 'House of Curated Luxury Hampers & Corporate Gifting. Merangkai estetika, kehangatan rasa, dan ketulusan hati dalam setiap bingkisan istimewa.', 'type' => 'textarea'],
            ['section' => 'footer', 'key' => 'address', 'value' => 'Jl. Gunawarman No. 42, Kebayoran Baru, Jakarta Selatan 12110', 'type' => 'text'],
            ['section' => 'footer', 'key' => 'hours', 'value' => 'Senin – Sabtu, 09.00 – 18.00 WIB', 'type' => 'text'],
            ['section' => 'footer', 'key' => 'phone_display', 'value' => '+62 817-7983-9434', 'type' => 'text'],
            ['section' => 'footer', 'key' => 'email', 'value' => 'hello@galuhco.id', 'type' => 'text'],
            ['section' => 'footer', 'key' => 'instagram_handle', 'value' => '@galuh.and.co', 'type' => 'text'],
        ];

        foreach ($entries as $entry) {
            LandingContent::updateOrCreate(
                [
                    'section' => $entry['section'],
                    'key' => $entry['key'],
                ],
                [
                    'value' => $entry['value'],
                    'type' => $entry['type'],
                ],
            );
        }

        LandingContent::firstOrCreate(
            ['section' => 'hero', 'key' => 'hero_image'],
            ['value' => null, 'type' => 'image'],
        );
    }
}
