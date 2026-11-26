export interface PublicPromotion {
    id: number;
    name: string;
    description: string | null;
    badge_text: string | null;
    apply_mode: 'auto' | 'code';
    code: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    discount_label: string;
    max_discount_amount: number | null;
    min_order_amount: number | null;
    scope: 'all' | 'category' | 'products';
    target_category: string | null;
    ends_at: string | null;
}

export interface ProductActivePromo {
    id: number;
    name: string;
    badge_text: string | null;
    discount_type: string;
    discount_value: number;
    discount_label: string;
    ends_at: string | null;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    category: string;
    event_category: string;
    season_tag: string | null;
    is_best_seller: boolean;
    short_description: string;
    contents: string[];
    price_from: number;
    discounted_price?: number;
    discount_percentage?: number | null;
    active_promo?: ProductActivePromo | null;
    image?: string | null;
    image_url: string | null;
    sort_order: number;
    is_active?: boolean;
}
