DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'crops_trader_id_fkey'
      AND conrelid = 'public.crops'::regclass
  ) THEN
    ALTER TABLE public.crops
    ADD CONSTRAINT crops_trader_id_fkey
    FOREIGN KEY (trader_id)
    REFERENCES public.traders(id)
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_trader_id_fkey'
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_trader_id_fkey
    FOREIGN KEY (trader_id)
    REFERENCES public.traders(id)
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_user_id_fkey'
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE SET NULL;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS traders_user_id_unique_idx
ON public.traders (user_id)
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS crops_trader_name_unique_idx
ON public.crops (trader_id, lower(name_en));

CREATE OR REPLACE FUNCTION public.recalculate_trader_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  target_trader_id uuid;
BEGIN
  target_trader_id := COALESCE(NEW.trader_id, OLD.trader_id);

  UPDATE public.traders
  SET rating = COALESCE(
    (
      SELECT ROUND(AVG(r.rating)::numeric, 2)
      FROM public.reviews r
      WHERE r.trader_id = target_trader_id
    ),
    0
  )
  WHERE id = target_trader_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS recalculate_trader_rating_on_reviews ON public.reviews;

CREATE TRIGGER recalculate_trader_rating_on_reviews
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_trader_rating();

UPDATE public.traders t
SET rating = COALESCE(review_totals.avg_rating, 0)
FROM (
  SELECT trader_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating
  FROM public.reviews
  GROUP BY trader_id
) AS review_totals
WHERE t.id = review_totals.trader_id;

UPDATE public.traders
SET rating = 0
WHERE id NOT IN (
  SELECT DISTINCT trader_id FROM public.reviews
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'traders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.traders;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'crops'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.crops;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
  END IF;
END
$$;