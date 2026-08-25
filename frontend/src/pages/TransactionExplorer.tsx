import React, { useEffect, useState } from 'react';
import { fetchTransactions } from '../api/transactions';
import { processRecovery } from '../api/recovery';
import { PagedResponse, Transaction } from '../types';
import { formatRupees, formatDateTime } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { ChevronRight, RefreshCw } from 'lucide-react';

export default function TransactionExplorer() {
  const [data, setData] = useState<PagedResponse<Transaction> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchTransactions(page, 20, statusFilter);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  const handleRecovery = async (id: string) => {
    try {
      await processRecovery(id);
      loadData();
    } catch (err) {
      alert('Failed to start recovery');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="flex gap-4">
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="border-gray-300 rounded-md shadow-sm text-sm p-2 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="FAILED">FAILED</option>
            <option value="RECOVERED">RECOVERED</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="IGNORED">IGNORED</option>
            <option value="SUCCESS">SUCCESS</option>
          </select>
          <button onClick={loadData} className="p-2 bg-white text-gray-600 rounded-md border hover:bg-gray-50">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.content.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link to={`/transactions/${tx.id}`} className="hover:text-blue-600">{tx.id.substring(0, 8)}...</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{tx.customer.name}</div>
                    <div className="text-xs text-gray-400">{tx.customer.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatRupees(tx.amountPaise)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.failureReason || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(tx.initiatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3 items-center">
                      {tx.status === 'FAILED' && (
                        <button 
                          onClick={() => handleRecovery(tx.id)}
                          className="text-green-600 hover:text-green-900 text-xs font-medium px-2 py-1 bg-green-50 rounded"
                        >
                          Recover
                        </button>
                      )}
                      <Link to={`/transactions/${tx.id}`} className="text-blue-600 hover:text-blue-900 flex items-center">
                        View <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {data?.content.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {data && data.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <span className="text-sm text-gray-700">
              Showing page <span className="font-medium">{data.number + 1}</span> of <span className="font-medium">{data.totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border rounded bg-white text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <button 
                disabled={page >= data.totalPages - 1} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded bg-white text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
