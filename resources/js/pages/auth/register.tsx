import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Building2Icon, EyeIcon, EyeOffIcon, UserIcon } from 'lucide-react';
import { useState } from 'react';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store as registerStore } from '@/routes/register';
import type { SharedPageProps } from '@/types';

type AccountRole = 'customer' | 'b2b';

export default function Register() {
    const { flash, errors: pageErrors } = usePage<SharedPageProps>().props;
    const oauthError = flash?.error || pageErrors?.google;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        email: string;
        role: AccountRole;
        phone: string;
        company_name: string;
        password: string;
        password_confirmation: string;
    }>({
        name: '',
        email: '',
        role: 'customer',
        phone: '',
        company_name: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(registerStore().url, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Daftar Akun — Galuh & Co." />

            <AuthLayout
                title="Buat Akun Galuh & Co."
                description="Nikmati kemudahan memesan hampers mewah, buku alamat, serta layanan khusus korporasi."
                maxWidth="xl"
            >
                <div>
                    {oauthError && (
                        <div
                            role="alert"
                            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center font-sans text-xs font-medium text-red-700"
                        >
                            {oauthError}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Segmented Pill Switcher Tipe Akun */}
                        <div>
                            <div
                                role="group"
                                aria-label="Pilih Tipe Akun"
                                className="grid grid-cols-2 rounded-full border border-[#A88B54]/30 bg-[#F2EBDC]/80 p-1"
                            >
                                <button
                                    type="button"
                                    onClick={() => setData('role', 'customer')}
                                    className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 font-sans text-xs font-semibold transition-all duration-200 ${
                                        data.role === 'customer'
                                            ? 'bg-[#16233B] text-[#F2EBDC] shadow-sm'
                                            : 'text-[#6E675D] hover:text-[#16233B]'
                                    }`}
                                >
                                    <UserIcon className="size-3.5 text-[#A88B54]" />
                                    <span>Personal</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setData('role', 'b2b')}
                                    className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 font-sans text-xs font-semibold transition-all duration-200 ${
                                        data.role === 'b2b'
                                            ? 'bg-[#16233B] text-[#F2EBDC] shadow-sm'
                                            : 'text-[#6E675D] hover:text-[#16233B]'
                                    }`}
                                >
                                    <Building2Icon className="size-3.5 text-[#A88B54]" />
                                    <span>Corporate (B2B)</span>
                                </button>
                            </div>
                            <p className="mt-2 text-center font-sans text-[11px] text-[#6E675D]">
                                {data.role === 'b2b'
                                    ? 'Akses penuh kustom logo perusahaan, MOQ korporat, & video ucapan QR.'
                                    : 'Ideal untuk bingkisan pribadi, keluarga, dan perayaan istimewa.'}
                            </p>
                            <InputError
                                message={errors.role}
                                className="mt-1.5"
                            />
                        </div>

                        {/* Nama Lengkap */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block font-sans text-xs font-semibold text-[#16233B]"
                            >
                                Nama Lengkap *
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="cth. Sarah Wijaya"
                                className="mt-1.5 w-full rounded-xl border border-[#A88B54]/35 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] transition-all outline-none placeholder:text-[#6E675D]/70 focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                            />
                            <InputError
                                message={errors.name}
                                className="mt-1"
                            />
                        </div>

                        {/* Email & Phone */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block font-sans text-xs font-semibold text-[#16233B]"
                                >
                                    Alamat Email *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder="nama@email.com"
                                    className="mt-1.5 w-full rounded-xl border border-[#A88B54]/35 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] transition-all outline-none placeholder:text-[#6E675D]/70 focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block font-sans text-xs font-semibold text-[#16233B]"
                                >
                                    Nomor Telepon / WhatsApp *
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    required
                                    autoComplete="tel"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    placeholder="081234567890"
                                    className="mt-1.5 w-full rounded-xl border border-[#A88B54]/35 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] transition-all outline-none placeholder:text-[#6E675D]/70 focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                />
                                <InputError
                                    message={errors.phone}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Nama Perusahaan (wajib jika Corporate/B2B) */}
                        {data.role === 'b2b' && (
                            <div>
                                <label
                                    htmlFor="company_name"
                                    className="block font-sans text-xs font-semibold text-[#16233B]"
                                >
                                    Nama Perusahaan / Organisasi *
                                </label>
                                <input
                                    id="company_name"
                                    type="text"
                                    required
                                    value={data.company_name}
                                    onChange={(e) =>
                                        setData('company_name', e.target.value)
                                    }
                                    placeholder="cth. PT Mahakarya Nusantara"
                                    className="mt-1.5 w-full rounded-xl border border-[#A88B54]/35 bg-white px-4 py-2.5 font-sans text-sm text-[#16233B] transition-all outline-none placeholder:text-[#6E675D]/70 focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                />
                                <InputError
                                    message={errors.company_name}
                                    className="mt-1"
                                />
                            </div>
                        )}

                        {/* Password & Confirmation */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block font-sans text-xs font-semibold text-[#16233B]"
                                >
                                    Password *
                                </label>
                                <div className="relative mt-1.5">
                                    <input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        required
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder="Minimal 8 karakter"
                                        className="w-full rounded-xl border border-[#A88B54]/35 bg-white py-2.5 pr-10 pl-4 font-sans text-sm text-[#16233B] transition-all outline-none placeholder:text-[#6E675D]/70 focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Tampilkan password"
                                        onClick={() =>
                                            setShowPassword((v) => !v)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6E675D] hover:text-[#16233B]"
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon className="size-4" />
                                        ) : (
                                            <EyeIcon className="size-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className="block font-sans text-xs font-semibold text-[#16233B]"
                                >
                                    Konfirmasi Password *
                                </label>
                                <div className="relative mt-1.5">
                                    <input
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Ulangi password"
                                        className="w-full rounded-xl border border-[#A88B54]/35 bg-white py-2.5 pr-10 pl-4 font-sans text-sm text-[#16233B] transition-all outline-none placeholder:text-[#6E675D]/70 focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B]"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Tampilkan konfirmasi password"
                                        onClick={() =>
                                            setShowConfirm((v) => !v)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6E675D] hover:text-[#16233B]"
                                    >
                                        {showConfirm ? (
                                            <EyeOffIcon className="size-4" />
                                        ) : (
                                            <EyeIcon className="size-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#16233B] px-6 py-3.5 font-sans text-sm font-semibold tracking-wide text-[#F2EBDC] shadow-md transition-all duration-300 hover:bg-[#1F304F] disabled:opacity-60"
                        >
                            {processing && <Spinner className="size-4" />}
                            {processing
                                ? 'Mendaftarkan Akun...'
                                : 'Daftar Sekarang'}
                        </button>

                        <GoogleAuthButton label="Daftar dengan Google" />

                        <p className="border-t border-[#A88B54]/20 pt-4 text-center font-sans text-xs text-[#6E675D]">
                            Sudah memiliki akun?{' '}
                            <Link
                                href={login()}
                                className="font-semibold text-[#16233B] underline decoration-[#A88B54] underline-offset-4 hover:text-[#1F304F]"
                            >
                                Masuk di sini
                            </Link>
                        </p>
                    </form>
                </div>
            </AuthLayout>
        </>
    );
}
