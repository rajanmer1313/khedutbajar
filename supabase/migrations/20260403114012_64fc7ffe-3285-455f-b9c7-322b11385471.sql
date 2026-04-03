
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.traders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  location_hi TEXT NOT NULL DEFAULT '',
  location_gu TEXT NOT NULL DEFAULT '',
  location_en TEXT NOT NULL DEFAULT '',
  mobile TEXT NOT NULL,
  rating NUMERIC NOT NULL DEFAULT 0,
  total_deals INTEGER NOT NULL DEFAULT 0,
  is_trusted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.traders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Traders are viewable by everyone" ON public.traders FOR SELECT USING (true);
CREATE POLICY "Traders can update own profile" ON public.traders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert traders" ON public.traders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_traders_updated_at BEFORE UPDATE ON public.traders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.crops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trader_id UUID NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
  name_hi TEXT NOT NULL DEFAULT '',
  name_gu TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '🌾',
  price_per_20kg NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Crops are viewable by everyone" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Traders can insert own crops" ON public.crops FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.traders WHERE id = trader_id AND user_id = auth.uid()));
CREATE POLICY "Traders can update own crops" ON public.crops FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.traders WHERE id = trader_id AND user_id = auth.uid()));
CREATE POLICY "Traders can delete own crops" ON public.crops FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.traders WHERE id = trader_id AND user_id = auth.uid()));

CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON public.crops
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trader_id UUID NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE traders;
ALTER PUBLICATION supabase_realtime ADD TABLE crops;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
