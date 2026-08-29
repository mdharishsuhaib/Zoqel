import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { getAuditEvents } from '../../services/auditService';

export function AuditPage() {
  const { data: rawEvents, isLoading } = useQuery({ 
    queryKey: ['auditEvents'], 
    queryFn: () => getAuditEvents() 
  });
  
  const events = Array.isArray(rawEvents) ? rawEvents : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" subtitle="Comprehensive history of all AI decisions and actions." />
      
      <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F9FAFB] text-[#667085]">
              <tr className="border-b border-[#E4E7EC]">
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Event Type</th>
                <th className="px-6 py-3 font-medium">Transaction</th>
                <th className="px-6 py-3 font-medium">Actor</th>
                <th className="px-6 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[#667085]">Loading logs...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[#667085]">No audit logs found</td></tr>
              ) : (
                events.map(e => (
                  <tr key={e.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4 text-[#475467]">{new Date(e.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={e.eventType} /></td>
                    <td className="px-6 py-4 font-medium text-[#101828]">{e.transactionId}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#667085]">{e.actor}</td>
                    <td className="px-6 py-4 text-[#475467]">{e.eventDetail}</td>
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
