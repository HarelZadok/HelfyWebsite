import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IProduct } from '../../types';
import StarRating from '../ui/StarRating';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: IProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, isLoading } = useCart();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.comparePrice && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            SALE
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Low Stock
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 right-3 bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Sold Out
          </span>
        )}
      </Link>

      <div className="p-4">
        <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-1">{product.categoryName}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through ml-2">${product.comparePrice.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={() => addItem(product.id, 1)}
            disabled={product.stock === 0 || isLoading}
            className="p-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
