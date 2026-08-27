import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { MOCK_AUDIT_EVENTS } from '../../data/audit';
import { formatDateTime, formatTxnId } from '../../utils/format';
import apiClient from '../../services/apiClient';
import type { AuditEvent } from '../../types';

function deriveActor(eventType: string): string {
  if (eventType === 'RISK_DETECTED') return 'Risk Engine';
  if (eventType === 'PROBABILITY_CALCULATED') return 'ML Engine';
  if (eventType === 'AGENT_DECISION') return 'AI Agent';
  if (eventType.includes('POLICY')) return 'Policy Engine';
  if (eventType === 'OUTCOME_RECORDED') return 'Simulator';
  return 'Zoqel';
}

async function getLiveAuditLog(): Promise<AuditEvent[]> {
  try {
    const res = await apiClient.get('/audit?size=200&sort=occurredAt,desc');
    return res.data.content.map((e: any) => ({
      ...e,
      actor: e.actor || deriveActor(e.eventType)
    }));
  } catch {
    return MOCK_AUDIT_EVENTS;
  }
}

export function AuditPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState('All Actors');
  const [eventFilter, setEventFilter] = useState('All Event Types');

  const { data: rawEvents = MOCK_AUDIT_EVENTS, isLoading } = useQuery({
    queryKey: ['audit_log'],
    queryFn: getLiveAuditLog,
    refetchInterval: 5000
  });

  const uniqueActors = useMemo(() => Array.from(new Set(rawEvents.map(e => e.actor))).sort(), [rawEvents]);
  const uniqueEvents = useMemo(() => Array.from(new Set(rawEvents.map(e => e.eventType))).sort(), [rawEvents]);

  const filteredEvents = useMemo(() => {
    let events = [...rawEvents];
    
    // Sort descending by time
    events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    if (actorFilter !== 'All Actors') {
      events = events.filter(e => e.actor === actorFilter);
    }
    
    if (eventFilter !== 'All Event Types') {
      events = events.filter(e => e.eventType === eventFilter);
    }
    
    if (search) {
      const q = search.toLowerCase();
      events = events.filter(e => 
        (e.transactionId && e.transactionId.toLowerCase().includes(q)) ||
        (e.eventDetail && e.eventDetail.toLowerCase().includes(q))
      );
    }
    
    return events;
  }, [rawEvents, search, actorFilter, eventFilter]);

  return (
    <div className="space-y-6">
      <PageHeader title="System Audit Log" subtitle="Cryptographically verified, immutable record of all system actions" />

      <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#E4E7EC] flex gap-4 bg-[#F9FAFB]">
          <input 
            type="text" 
            placeholder="Transaction ID..." 
            className="px-3 py-1.5 border border-[#E4E7EC] rounded-lg text-sm bg-white min-w-[250px]" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="px-3 py-1.5 border border-[#E4E7EC] rounded-lg text-sm bg-white"
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
          >
            <option>All Actors</option>
            {uniqueActors.map(actor => (
              <option key={actor} value={actor}>{actor}</option>
            ))}
          </select>
          <select 
            className="px-3 py-1.5 border border-[#E4E7EC] rounded-lg text-sm bg-white"
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
          >
            <option>All Event Types</option>
            {uniqueEvents.map(type => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-[#667085]">
              <tr className="border-b border-[#E4E7EC]">
                <th className="px-6 py-3 font-medium w-48">Time</th>
                <th className="px-6 py-3 font-medium w-40">Actor</th>
                <th className="px-6 py-3 font-medium w-40">Transaction</th>
                <th className="px-6 py-3 font-medium w-56">Event</th>
                <th className="px-6 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[#98A2B3]">Loading...</td></tr>
              ) : filteredEvents.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[#98A2B3]">No matching audit events found.</td></tr>
              ) : (
                filteredEvents.map(evt => (
                  <tr key={evt.id} onClick={() => navigate(`/app/payments/${evt.transactionId}`)} className="hover:bg-[#F9FAFB] cursor-pointer transition-colors">
                    <td className="px-6 py-3 text-[#667085] whitespace-nowrap">{formatDateTime(evt.occurredAt)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase text-white ${evt.actor === 'Risk Engine' ? 'bg-danger' : evt.actor === 'AI Agent' ? 'bg-[#2B84EA]' : evt.actor === 'Policy Engine' ? 'bg-warning' : evt.actor === 'Simulator' ? 'bg-success' : evt.actor === 'ML Engine' ? 'bg-[#8B5CF6]' : 'bg-[#111827]'}`}>{evt.actor}</span>
                    </td>
                    <td className="px-6 py-3 font-medium text-[#2B84EA]">{formatTxnId(evt.transactionId)}</td>
                    <td className="px-6 py-3 font-semibold text-[#101828]">{evt.eventType}</td>
                    <td className="px-6 py-3 text-[#475467] font-mono text-xs">{evt.eventDetail}</td>
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
