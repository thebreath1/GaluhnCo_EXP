<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LandingContentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/landing-content', [
            'contents' => LandingContent::getGroupedContents(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'contents' => ['nullable', 'array'],
            'contents.*.section' => ['required', 'string', 'max:100'],
            'contents.*.key' => ['required', 'string', 'max:100'],
            'contents.*.value' => ['nullable', 'string'],
            'contents.*.type' => ['nullable', 'string', 'max:50'],
            'hero_image_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'remove_hero_image' => ['nullable', 'boolean'],
        ]);

        /** @var array<int, array{section: string, key: string, value?: string|null, type?: string|null}> $entries */
        $entries = $validated['contents'] ?? [];

        foreach ($entries as $entry) {
            if ($entry['section'] === 'hero' && $entry['key'] === 'hero_image') {
                continue;
            }

            LandingContent::updateOrCreate(
                [
                    'section' => $entry['section'],
                    'key' => $entry['key'],
                ],
                [
                    'value' => $entry['value'] ?? null,
                    'type' => $entry['type'] ?? 'text',
                ],
            );
        }

        $existingHeroImage = LandingContent::query()
            ->where('section', 'hero')
            ->where('key', 'hero_image')
            ->first();

        $oldPath = $existingHeroImage?->value;
        $isLocalOldPath = is_string($oldPath)
            && $oldPath !== ''
            && ! str_starts_with($oldPath, 'http://')
            && ! str_starts_with($oldPath, 'https://')
            && ! str_starts_with($oldPath, '/');

        $uploadedFile = $request->file('hero_image_file');

        if ($uploadedFile instanceof UploadedFile) {
            if ($isLocalOldPath) {
                Storage::disk('public')->delete($oldPath);
            }

            $storedPath = $uploadedFile->store('landing', 'public');

            LandingContent::updateOrCreate(
                ['section' => 'hero', 'key' => 'hero_image'],
                ['value' => $storedPath !== false ? $storedPath : null, 'type' => 'image'],
            );
        } elseif ($request->boolean('remove_hero_image')) {
            if ($isLocalOldPath) {
                Storage::disk('public')->delete($oldPath);
            }

            LandingContent::updateOrCreate(
                ['section' => 'hero', 'key' => 'hero_image'],
                ['value' => null, 'type' => 'image'],
            );
        }

        return back()->with('success', 'Konten landing page berhasil diperbarui.');
    }
}
