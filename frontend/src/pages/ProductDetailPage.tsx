import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IProduct } from '../types';
import { productsApi } from '../api/products';
import { useCart } from '../context/CartContext';
import StarRating from '../components/ui/StarRating';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import QuantityStepper from '../components/ui/QuantityStepper';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem, isLoading } = useCart();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productsApi.getById(Number(id))
      .then((res) => setProduct(res.data.data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addItem(product.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-24" />
          <Skeleton className="h-12" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product not found</h2>
        <Link to="/products" className="text-brand-600 hover:underline">Back to products</Link>
      </div>
    );
  }

  const images = product.images;
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-gray-700 dark:hover:text-gray-300">Products</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800"
          >
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-brand-600' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <Link to={`/products?categoryId=${product.categoryId}`} className="text-sm text-brand-600 dark:text-brand-400 font-medium">
              {product.categoryName}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{product.name}</h1>
          </div>

          <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />

          <div className="flex items-center gap-4">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <>
                <span className="text-xl text-gray-400 line-through">${product.comparePrice.toFixed(2)}</span>
                <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-bold px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <QuantityStepper
                value={quantity}
                min={1}
                max={product.stock}
                onChange={setQuantity}
              />
              <Button onClick={handleAddToCart} loading={isLoading} size="lg" className="flex-1">
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
