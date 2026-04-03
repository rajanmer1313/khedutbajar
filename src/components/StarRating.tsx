import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating = ({ rating, size = 18, interactive = false, onChange }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={interactive ? 'cursor-pointer touch-target flex items-center justify-center' : 'cursor-default'}
        >
          <Star
            size={size}
            className={
              star <= Math.round(rating)
                ? 'fill-warning text-warning'
                : 'text-muted-foreground/30'
            }
          />
        </button>
      ))}
      <span className="ml-1 text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
    </div>
  );
};

export default StarRating;
