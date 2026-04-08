
-- Re-create triggers that were missing from the database

-- Trigger for auto-creating profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for recalculating trader rating on review changes
DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_trader_rating();

-- Trigger for updating updated_at on traders
DROP TRIGGER IF EXISTS update_traders_updated_at ON public.traders;
CREATE TRIGGER update_traders_updated_at
  BEFORE UPDATE ON public.traders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updating updated_at on crops
DROP TRIGGER IF EXISTS update_crops_updated_at ON public.crops;
CREATE TRIGGER update_crops_updated_at
  BEFORE UPDATE ON public.crops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
