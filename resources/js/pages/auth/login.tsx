import { Form, Head, usePage } from '@inertiajs/react';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import type { SharedPageProps } from '@/types';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const { flash, errors: pageErrors } = usePage<SharedPageProps>().props;
    const oauthError = flash?.error || pageErrors?.google;

    return (
        <>
            <Head title="Masuk — Galuh & Co." />

            {status && (
                <div className="mb-5 rounded-xl border border-[#A88B54]/30 bg-[#F2EBDC] px-4 py-2.5 text-center font-sans text-xs font-medium text-[#16233B]">
                    {status}
                </div>
            )}

            {oauthError && (
                <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center font-sans text-xs font-medium text-red-700"
                >
                    {oauthError}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            <div>
                                <Label
                                    htmlFor="email"
                                    className="font-sans text-xs font-semibold text-[#16233B]"
                                >
                                    Alamat Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="mt-1.5 h-11 rounded-xl border-[#A88B54]/35 bg-white px-4 font-sans text-sm text-[#16233B] placeholder:text-[#6E675D]/70 focus-visible:border-[#16233B] focus-visible:ring-[#16233B]/20"
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="font-sans text-xs font-semibold text-[#16233B]"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="font-sans text-xs font-medium text-[#6E675D] no-underline hover:text-[#16233B] hover:underline"
                                            tabIndex={5}
                                        >
                                            Lupa password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan password"
                                    className="mt-1.5 h-11 rounded-xl border-[#A88B54]/35 bg-white px-4 font-sans text-sm text-[#16233B] placeholder:text-[#6E675D]/70 focus-visible:border-[#16233B] focus-visible:ring-[#16233B]/20"
                                />
                                <InputError
                                    message={errors.password}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex items-center gap-2.5 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-[#A88B54]/50 data-[state=checked]:border-[#16233B] data-[state=checked]:bg-[#16233B]"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="font-sans text-xs font-normal text-[#6E675D]"
                                >
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#16233B] px-6 py-3.5 font-sans text-sm font-semibold tracking-wide text-[#F2EBDC] shadow-md transition-all duration-300 hover:bg-[#1F304F] disabled:opacity-60"
                        >
                            {processing && <Spinner className="size-4" />}
                            <span>{processing ? 'Memproses...' : 'Masuk'}</span>
                        </button>

                        <GoogleAuthButton label="Masuk dengan Google" />

                        <p className="border-t border-[#A88B54]/20 pt-4 text-center font-sans text-xs text-[#6E675D]">
                            Belum memiliki akun?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={6}
                                className="font-semibold text-[#16233B] decoration-[#A88B54] underline-offset-4 hover:text-[#1F304F]"
                            >
                                Daftar sekarang
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Selamat Datang Kembali',
    description:
        'Masuk untuk mengakses buku alamat, keranjang, dan pelacakan pesanan Anda.',
};
