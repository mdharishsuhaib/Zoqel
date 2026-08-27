import { PageHeader } from '../../components/ui/PageHeader';
import { MOCK_TRANSACTIONS, MOCK_CUSTOMER_HISTORY } from '../../data/transactions';
import { formatLakhsSymbol } from '../../utils/format';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function CustomersPage() {
  const uniqueCustomers = Array.from(new Map(MOCK_TRANSACTIONS.map(t => [t.customer.id, t.customer])).values());

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
              {uniqueCustomers.map(c => {
                const history = MOCK_CUSTOMER_HISTORY[c.id];
                return (
                  <tr key={c.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#101828]">{c.name}</div>
                      <div className="text-xs text-[#667085]">{c.email}</div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={c.riskTier} /></td>
                    <td className="px-6 py-4 text-[#475467] font-medium">{formatLakhsSymbol(c.lifetimeValuePaise)}</td>
                    <td className="px-6 py-4 text-[#475467]">{history?.successfulPayments + history?.failedPayments || 0}</td>
                    <td className="px-6 py-4 text-[#475467]">{((history?.successRate || 0) * 100).toFixed(0)}%</td>
                    <td className="px-6 py-4 text-right text-danger font-medium">{history?.failedPayments || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
