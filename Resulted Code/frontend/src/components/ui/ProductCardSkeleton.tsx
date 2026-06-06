import React from 'react';
import Skeleton from './Skeleton';

const ProductCardSkeleton: React.FC = () => (
  <div className="rounded-2xl overflow-hidden">
    <Skeleton className="aspect-square" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export default ProductCardSkeleton;
