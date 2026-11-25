export type User = {
    id: number;
    name: string;
    email: string;
    role?: 'admin' | 'customer' | 'b2b' | (string & {});
    phone?: string | null;
    company_name?: string | null;
    is_admin?: boolean;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type SeasonalRibbonProps = {
    active: boolean;
    text: string;
    link: string;
};

export type SharedPageProps = {
    name: string;
    auth: {
        user: User | null;
    };
    cartCount: number;
    sidebarOpen: boolean;
    whatsapp_number?: string | null;
    seasonalRibbon?: SeasonalRibbonProps;
    flash?: {
        error?: string | null;
        success?: string | null;
    };
    errors?: Record<string, string>;
};
