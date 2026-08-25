import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TransactionExplorer from './pages/TransactionExplorer';
import TransactionDetail from './pages/TransactionDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionExplorer />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
