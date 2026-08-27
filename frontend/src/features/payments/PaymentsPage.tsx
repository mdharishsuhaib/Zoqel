import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatLakhsSymbol, formatDateTime, getFailureReasonLabel, formatTxnId } from '../../utils/format';
import { getTransactions } from '../../services/recoveryService';

export function PaymentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Fetch from the live backend
  const { data: page, isLoading } = useQuery({
    queryKey: ['payments_transactions', statusFilter],
    queryFn: () => getTransactions(0, 100, statusFilter === 'All Status' ? undefined : statusFilter),
    refetchInterval: 5000 // poll for new simulated transactions
  });

  // Client-side text filtering on the fetched page
  const filteredTransactions = useMemo(() => {
    if (!page?.content) return [];
    
    const query = search.toLowerCase();
    return page.content.filter(t => 
      !query || 
      t.id.toLowerCase().includes(query) ||
      t.customer.name.toLowerCase().includes(query) ||
      t.customer.email.toLowerCase().includes(query) ||
      t.amountPaise.toString().includes(query)
    );
  }, [page?.content, search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" subtitle="All transaction history" />
      
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Total Volume" value="10,000" accent="black" />
        <MetricCard title="Successful" value="8,500" accent="success" />
        <MetricCard title="Failed" value="1,500" accent="danger" />
        <MetricCard title="Recovery Candidates" value="613" accent="violet" />
      </div>

      <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#E4E7EC] flex items-center justify-between">
          <input 
            type="text" 
            placeholder="Search by ID, customer, amount..." 
            className="w-80 px-3 py-2 border border-[#E4E7EC] rounded-lg text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="px-3 py-2 border border-[#E4E7EC] rounded-lg text-sm bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>FAILED</option>
            <option>RECOVERED</option>
            <option>ESCALATED</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F9FAFB] text-[#667085]">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Method</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Failure Reason</th>
                <th className="px-6 py-3 font-medium">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-[#98A2B3]">Loading...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-[#98A2B3]">No transactions found matching your criteria.</td></tr>
              ) : (
                filteredTransactions.map(t => (
                  <tr key={t.id} onClick={() => navigate(`/app/payments/${t.id}`)} className="hover:bg-[#F9FAFB] cursor-pointer transition-colors">
                    <td className="px-6 py-4 font-medium text-[#101828]">{formatTxnId(t.id)}</td>
                    <td className="px-6 py-4 text-[#475467]">{formatLakhsSymbol(t.amountPaise)}</td>
                    <td className="px-6 py-4">{t.customer.name}</td>
                    <td className="px-6 py-4">{t.paymentMethod}</td>
                    <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                    <td className="px-6 py-4 text-[#667085]">{t.failureReason ? getFailureReasonLabel(t.failureReason) : '—'}</td>
                    <td className="px-6 py-4 text-[#667085]">{formatDateTime(t.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
