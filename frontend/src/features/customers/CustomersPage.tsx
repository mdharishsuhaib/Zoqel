import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../components/ui/PageHeader';
import { getCustomers, getCustomerHistory } from '../../services/customerService';
import { formatLakhsSymbol } from '../../utils/format';
import { StatusBadge } from '../../components/ui/StatusBadge';

function CustomerRow({ c }: { c: any }) {
  const { data: history } = useQuery({ 
    queryKey: ['customerHistory', c.id], 
    queryFn: () => getCustomerHistory(c.id) 
  });
  return (
    <tr className="hover:bg-[#F9FAFB]">
      <td className="px-6 py-4">
        <div className="font-medium text-[#101828]">{c.name}</div>
        <div className="text-xs text-[#667085]">{c.email}</div>
      </td>
      <td className="px-6 py-4"><StatusBadge status={c.riskTier} /></td>
      <td className="px-6 py-4 text-[#475467] font-medium">{formatLakhsSymbol(history?.totalAmountPaise || 0)}</td>
      <td className="px-6 py-4 text-[#475467]">{((history?.successfulPayments || 0) + (history?.failedPayments || 0))}</td>
      <td className="px-6 py-4 text-[#475467]">{((history?.successRate || 0) * 100).toFixed(0)}%</td>
      <td className="px-6 py-4 text-right text-danger font-medium">{history?.failedPayments || 0}</td>
    </tr>
  );
}

export function CustomersPage() {
  const { data: customersData, isLoading } = useQuery({ 
    queryKey: ['customers'], 
    queryFn: () => getCustomers(0, 50) 
  });
  
  const customers = customersData?.content || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" subtitle="Customer risk profiles and payment history" />
      
      <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F9FAFB] text-[#667085]">
              <tr className="border-b border-[#E4E7EC]">
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Risk Tier</th>
                <th className="px-6 py-3 font-medium">Lifetime Value</th>
                <th className="px-6 py-3 font-medium">Transactions</th>
                <th className="px-6 py-3 font-medium">Success Rate</th>
                <th className="px-6 py-3 font-medium text-right">Failed Payments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[#667085]">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[#667085]">No customers found</td></tr>
              ) : (
                customers.map(c => <CustomerRow key={c.id} c={c} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
