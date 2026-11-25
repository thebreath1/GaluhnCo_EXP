<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): SymfonyRedirectResponse
    {
        return $this->googleDriver()->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        try {
            $googleUser = $this->googleDriver()->user();
        } catch (Throwable $exception) {
            Log::error('Google OAuth callback failed.', [
                'message' => $exception->getMessage(),
                'exception' => $exception::class,
            ]);

            return redirect()
                ->route('login')
                ->with('error', 'Autentikasi Google dibatalkan atau gagal. Silakan coba kembali.')
                ->withErrors([
                    'google' => 'Autentikasi Google dibatalkan atau gagal. Silakan coba kembali.',
                ]);
        }

        $googleId = trim((string) $googleUser->getId());
        $googleEmail = trim((string) $googleUser->getEmail());

        if ($googleId === '' || $googleEmail === '') {
            return redirect()
                ->route('login')
                ->with('error', 'Akun Google Anda tidak membagikan alamat email yang valid.')
                ->withErrors([
                    'google' => 'Akun Google Anda tidak membagikan alamat email yang valid.',
                ]);
        }

        $user = User::query()
            ->where('google_id', $googleId)
            ->orWhere('email', $googleEmail)
            ->first();

        if ($user !== null && $user->isAdmin()) {
            return redirect()
                ->route('login')
                ->with('error', 'Akun administrator tidak diperkenankan masuk melalui pintu pelanggan.')
                ->withErrors([
                    'google' => 'Akun administrator tidak diperkenankan masuk melalui pintu pelanggan.',
                ]);
        }

        $googleAvatar = $googleUser->getAvatar();
        $googleName = trim((string) ($googleUser->getName() ?? $googleUser->getNickname() ?? ''));

        if ($user !== null) {
            $updates = [];

            if ($user->google_id === null || $user->google_id === '') {
                $updates['google_id'] = $googleId;
            }

            if ($googleAvatar !== null && $googleAvatar !== '' && ($user->avatar === null || $user->avatar === '')) {
                $updates['avatar'] = $googleAvatar;
            }

            if ($user->email_verified_at === null) {
                $updates['email_verified_at'] = Carbon::now();
            }

            if ($updates !== []) {
                $user->forceFill($updates)->save();
            }
        } else {
            $user = new User([
                'name' => $googleName !== '' ? $googleName : 'Pelanggan Galuh & Co.',
                'email' => $googleEmail,
                'google_id' => $googleId,
                'avatar' => $googleAvatar !== '' ? $googleAvatar : null,
                'role' => 'customer',
                'password' => null,
            ]);
            $user->forceFill([
                'email_verified_at' => Carbon::now(),
            ])->save();
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->intended(route('home'));
    }

    private function googleDriver(): Provider
    {
        $driver = Socialite::driver('google');

        if (app()->environment('local') && $driver instanceof AbstractProvider) {
            $driver->setHttpClient(new Client(['verify' => false]));
        }

        return $driver;
    }
}
