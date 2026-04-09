-- Government Schemes Registry
CREATE TABLE IF NOT EXISTS public.government_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    key TEXT UNIQUE,
    category TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_hi TEXT,
    title_kn TEXT,
    subtitle_en TEXT NOT NULL,
    subtitle_hi TEXT,
    subtitle_kn TEXT,
    official_link TEXT NOT NULL,
    benefit_en TEXT,
    target_en TEXT,
    funding_en TEXT,
    tenure_en TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0
);

-- RLS
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to schemes" ON public.government_schemes
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated admins to manage schemes" ON public.government_schemes
    USING (auth.uid() IN (SELECT id FROM public.app_users WHERE portal = 'admin'));

-- Seed some initial data
INSERT INTO public.government_schemes (key, category, title_en, subtitle_en, official_link, benefit_en, target_en, funding_en, tenure_en)
VALUES 
('pmkisan', 'Subsidies', 'PM-KISAN Samman Nidhi', 'Income support of ₹6,000/year to all landholding farmer families.', 'https://pmkisan.gov.in/', '₹6,000 / Year', 'Landholding Farmers', 'Direct Benefit Transfer', 'Indefinite'),
('pmfby', 'Insurance', 'PM Fasal Bima Yojana', 'Comprehensive crop insurance against non-preventable natural risks.', 'https://pmfby.gov.in/', 'Crop Damage Cover', 'All Farmers', 'Insurance Model', 'Seasonal'),
('enam', 'Markets', 'e-NAM (National Agri Market)', 'Pan-India electronic trading portal which networks APMCs.', 'https://enam.gov.in/', 'Direct Online Selling', 'Producers & Traders', 'Market Ecosystem', 'Lifetime');
