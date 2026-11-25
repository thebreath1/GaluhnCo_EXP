<?php

use App\Models\User;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

test('guest is redirected to google oauth consent screen', function () {
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('redirect')
        ->once()
        ->andReturn(new SymfonyRedirectResponse('https://accounts.google.com/o/oauth2/auth'));

    Socialite::shouldReceive('driver')
        ->with('google')
        ->once()
        ->andReturn($provider);

    $this->get(route('auth.google.redirect'))
        ->assertRedirect('https://accounts.google.com/o/oauth2/auth');
});

test('new customer can sign up and login with google', function () {
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getId')->andReturn('google-uid-1001');
    $socialiteUser->shouldReceive('getEmail')->andReturn('sari.customer@example.com');
    $socialiteUser->shouldReceive('getName')->andReturn('Sari Permata');
    $socialiteUser->shouldReceive('getNickname')->andReturn(null);
    $socialiteUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/avatar-sari.jpg');

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->once()->andReturn($socialiteUser);

    Socialite::shouldReceive('driver')
        ->with('google')
        ->once()
        ->andReturn($provider);

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('home'));

    $this->assertAuthenticated();

    $user = User::query()->where('email', 'sari.customer@example.com')->firstOrFail();
    expect($user->google_id)->toBe('google-uid-1001');
    expect($user->avatar)->toBe('https://lh3.googleusercontent.com/avatar-sari.jpg');
    expect($user->role)->toBe('customer');
    expect($user->password)->toBeNull();
    expect($user->email_verified_at)->not->toBeNull();
});

test('existing customer matched by email updates google_id and avatar on login', function () {
    $existing = User::factory()->create([
        'email' => 'dimas@example.com',
        'role' => 'customer',
        'is_admin' => false,
        'google_id' => null,
        'avatar' => null,
    ]);

    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getId')->andReturn('google-uid-2002');
    $socialiteUser->shouldReceive('getEmail')->andReturn('dimas@example.com');
    $socialiteUser->shouldReceive('getName')->andReturn('Dimas Putra');
    $socialiteUser->shouldReceive('getNickname')->andReturn(null);
    $socialiteUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/avatar-dimas.jpg');

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->once()->andReturn($socialiteUser);

    Socialite::shouldReceive('driver')
        ->with('google')
        ->once()
        ->andReturn($provider);

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('home'));

    $this->assertAuthenticatedAs($existing);

    $existing->refresh();
    expect($existing->google_id)->toBe('google-uid-2002');
    expect($existing->avatar)->toBe('https://lh3.googleusercontent.com/avatar-dimas.jpg');
});

test('admin user cannot login via customer google oauth callback', function () {
    User::factory()->create([
        'email' => 'admin@galuhco.com',
        'role' => 'admin',
        'is_admin' => true,
    ]);

    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getId')->andReturn('google-uid-admin');
    $socialiteUser->shouldReceive('getEmail')->andReturn('admin@galuhco.com');
    $socialiteUser->shouldReceive('getName')->andReturn('Admin Galuh');
    $socialiteUser->shouldReceive('getNickname')->andReturn(null);
    $socialiteUser->shouldReceive('getAvatar')->andReturn(null);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->once()->andReturn($socialiteUser);

    Socialite::shouldReceive('driver')
        ->with('google')
        ->once()
        ->andReturn($provider);

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHas('error');

    $this->assertGuest();
});

test('google oauth cancellation or exception redirects gracefully to login', function () {
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')
        ->once()
        ->andThrow(new RuntimeException('Access denied'));

    Socialite::shouldReceive('driver')
        ->with('google')
        ->once()
        ->andReturn($provider);

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHas('error');

    $this->assertGuest();
});
