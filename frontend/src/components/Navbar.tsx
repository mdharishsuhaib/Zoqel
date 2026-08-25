import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <Zap className="text-yellow-400" />
          <span>Zoqel</span>
        </Link>
        <div className="flex space-x-6 text-sm font-medium">
          <Link to="/" className="hover:text-blue-400 transition-colors">Dashboard</Link>
          <Link to="/transactions" className="hover:text-blue-400 transition-colors">Transactions</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
