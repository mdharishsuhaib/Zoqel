import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskIndicator } from '../../components/ui/RiskIndicator';
import { formatLakhsSymbol, formatTimeAgo, formatTxnId } from '../../utils/format';
import { getTransactions, processRecovery } from '../../services/recoveryService';

const TABS = ['All', 'Open', 'Recovered', 'Escalated', 'Ignored'];

export function RecoveryQueuePage() {
  const [activeTab, setActiveTab] = useState('All');
  const navigate = useNavigate();
  
  const { data: page, isLoading } = useQuery({ 
    queryKey: ['transactions', activeTab],
    queryFn: () => {
      let statusParam: string | undefined = undefined;
      if (activeTab === 'Open') statusParam = 'FAILED';
      else if (activeTab !== 'All') statusParam = activeTab.toUpperCase();
      return getTransactions(0, 50, statusParam);
    }
  });

  const handleProcess = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await processRecovery(id);
    navigate(`/app/payments/${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Recovery Queue" subtitle="Manage and monitor AI revenue recovery actions" />
      
      <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-card overflow-hidden">
        <div className="flex border-b border-[#E4E7EC] px-4">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-[#2B84EA] text-[#2B84EA]' : 'border-transparent text-[#667085] hover:text-[#101828]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F9FAFB] text-[#667085]">
              <tr>
                <th className="px-6 py-3 font-medium">Transaction ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Risk</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[#98A2B3]">Loading...</td></tr>
              ) : page?.content.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[#98A2B3]">No cases found.</td></tr>
              ) : (
                page?.content.map(t => (
                  <tr key={t.id} onClick={() => navigate(`/app/payments/${t.id}`)} className="hover:bg-[#F9FAFB] cursor-pointer transition-colors">
                    <td className="px-6 py-4 font-medium text-[#101828]">{formatTxnId(t.id)}</td>
                    <td className="px-6 py-4">
                      <div className="text-[#101828] font-medium">{t.customer.name}</div>
                      <div className="text-xs text-[#667085]">{t.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-[#475467]">{formatLakhsSymbol(t.amountPaise)}</td>
                    <td className="px-6 py-4 w-40"><RiskIndicator score={t.id === 'TXN-91823' ? 87 : t.id === 'TXN-82193' ? 42 : 15} showLabel={false} /></td>
                    <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                    <td className="px-6 py-4">
                      {t.status === 'FAILED' ? (
                        <button onClick={e => handleProcess(e, t.id)} className="px-3 py-1.5 text-xs font-semibold bg-[#2B84EA] text-white rounded-lg hover:bg-[#1A6DD0] transition-colors">Process</button>
                      ) : (
                        <span className="text-[#98A2B3] text-xs">Automated</span>
                      )}
                    </td>
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
