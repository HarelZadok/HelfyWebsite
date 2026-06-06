import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Footer: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
  <footer className="bg-gray-950 text-gray-400 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl text-white">Lumina</span>
          </div>
          <p className="text-sm leading-relaxed">Premium tech & lifestyle products curated for the discerning professional.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link to="/products?category=1" className="hover:text-white transition-colors">Electronics</Link></li>
            <li><Link to="/products?category=2" className="hover:text-white transition-colors">Audio</Link></li>
            <li><Link to="/products?category=3" className="hover:text-white transition-colors">Wearables</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
          <ul className="space-y-2 text-sm">
            {!isAuthenticated && (
              <>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              </>
            )}
            {isAuthenticated && (
              <>
                <li><Link to="/account/orders" className="hover:text-white transition-colors">Orders</Link></li>
                <li><Link to="/account/profile" className="hover:text-white transition-colors">Profile</Link></li>
              </>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="cursor-default">Privacy Policy</span></li>
            <li><span className="cursor-default">Terms of Service</span></li>
            <li><span className="cursor-default">Cookie Policy</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs">© {new Date().getFullYear()} Lumina Store. All rights reserved.</p>
        <p className="text-xs">Built with React, Node.js & MySQL</p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
