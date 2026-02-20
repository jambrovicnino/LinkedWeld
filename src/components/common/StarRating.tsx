import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
interface StarRatingProps { rating: number; max?: number; size?: 'sm' | 'md'; onChange?: (value: number) => void; }
export function StarRating({ rating, max = 5, size = 'md', onChange }: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-5 w-5';
  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(sizeClass, i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500', onChange && 'cursor-pointer')}
          onClick={() => onChange?.(i + 1)}
        />
      ))}
    </div>
  );
}
