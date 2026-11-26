<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('promotion_id')->nullable()->after('user_id')->constrained('promotions')->nullOnDelete();
            $table->string('promo_code', 50)->nullable()->after('promotion_id');
            $table->string('promo_name')->nullable()->after('promo_code');
            $table->decimal('subtotal_amount', 15, 2)->nullable()->after('address_snapshot');
            $table->decimal('discount_amount', 15, 2)->default(0)->after('subtotal_amount');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('original_unit_price', 15, 2)->nullable()->after('quantity');
            $table->decimal('discount_amount', 15, 2)->default(0)->after('unit_price');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['original_unit_price', 'discount_amount']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('promotion_id');
            $table->dropColumn(['promo_code', 'promo_name', 'subtotal_amount', 'discount_amount']);
        });
    }
};
