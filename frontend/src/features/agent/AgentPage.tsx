import React, { useState } from 'react';
import { Activity, Shield, Brain, Zap, Key, Database, Globe, Lock, Filter } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatTime } from '../../utils/format';
import { useQuery } from '@tanstack/react-query';
import { getAuditEvents } from '../../services/auditService';

const TOOLS = [
  { id: 't1', name: 'Risk Scoring Engine', actorMatch: 'Risk Engine', description: 'Calculates real-time risk scores for incoming transactions.', icon: Shield, status: 'active' },
  { id: 't2', name: 'ML Prediction Model', actorMatch: 'ML Engine', description: 'Infers recovery probability based on historical patterns.', icon: Brain, status: 'active' },
  { id: 't3', name: 'Policy Validator', actorMatch: 'Policy Engine', description: 'Ensures AI actions strictly follow configured business rules.', icon: Lock, status: 'active' },
  { id: 't4', name: 'Mandate Retry Sequencer', actorMatch: null, description: 'Intelligently spaces out retry attempts to maximize success rates.', icon: Zap, status: 'planned' },
  { id: 't5', name: 'Hinglish Voice Recovery', actorMatch: null, description: 'Automated conversational voice bot for regional customer outreach.', icon: Globe, status: 'planned' },
  { id: 't6', name: 'B2B Receivables Chaser', actorMatch: null, description: 'Follow-up engine specifically tuned for overdue B2B invoices.', icon: Database, status: 'planned' },
  { id: 't7', name: 'Promise-to-Pay Tracker', actorMatch: null, description: 'Logs and monitors customer commitments to pay at a future date.', icon: Activity, status: 'planned' },
  { id: 't8', name: 'Decision Engine', actorMatch: 'AI Agent', description: 'Core LLM agent that synthesizes data to make recovery decisions.', icon: Key, status: 'active' },
];

function ActorBadge({ actor }: { actor: string }) {
  const colors: Record<string, string> = {
    'Risk Engine': 'bg-danger text-white',
    'ML Engine': 'bg-[#8B5CF6] text-white',
    'AI Agent': 'bg-[#2B84EA] text-white',
    'Policy Engine': 'bg-warning text-white',
    'Simulator': 'bg-success text-white',
    'Zoqel': 'bg-[#111827] text-white',
  };
  const cl = colors[actor] || 'bg-[#667085] text-white';
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${cl}`}>{actor}</span>;
}

export function AgentPage() {
  const { data: rawEvents, isLoading } = useQuery({ 
    queryKey: ['auditEvents'], 
    queryFn: () => getAuditEvents(),
    refetchInterval: 15000,
    refetchIntervalInBackground: true
  });
  
  const events = Array.isArray(rawEvents) ? rawEvents : [];
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  const selectedTool = TOOLS.find(t => t.id === selectedToolId);
  
  // Filter events based on selected tool
  const filteredEvents = selectedTool && selectedTool.actorMatch 
    ? events.filter(e => e.actor === selectedTool.actorMatch)
    : events;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#101828] leading-tight">Agent Control Center</h1>
          <p className="text-sm text-[#667085] mt-1">Monitor the internal operations and tool usage of the AI Agent</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-[#E4E7EC] rounded-lg px-4 py-2 text-center shadow-sm">
            <div className="text-xl font-bold text-[#101828] tabular-nums">327</div>
            <div className="text-[10px] uppercase font-semibold text-[#667085] tracking-wide">Actions Today</div>
          </div>
          <div className="bg-white border border-[#E4E7EC] rounded-lg px-4 py-2 text-center shadow-sm">
            <div className="text-xl font-bold text-success tabular-nums">194</div>
            <div className="text-[10px] uppercase font-semibold text-[#667085] tracking-wide">Recoveries</div>
          </div>
          <div className="bg-white border border-[#E4E7EC] rounded-lg px-4 py-2 text-center shadow-sm">
            <div className="text-xl font-bold text-warning tabular-nums">31</div>
            <div className="text-[10px] uppercase font-semibold text-[#667085] tracking-wide">Escalations</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="col-span-3 bg-white rounded-xl border border-[#E4E7EC] shadow-card flex flex-col h-[700px]">
          <div className="p-5 border-b border-[#E4E7EC] flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#101828] flex items-center gap-2">
              Agent Reasoning Feed
              {selectedTool && (
                <span className="bg-[#F2F4F7] text-[#475467] text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <Filter size={12} />
                  Filtered by: {selectedTool.name}
                  <button onClick={() => setSelectedToolId(null)} className="ml-1 hover:text-[#101828]">&times;</button>
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2 text-success text-xs font-semibold">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-success"/></span>
              LIVE
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F9FAFB]">
            {isLoading ? (
               <div className="text-center text-[#667085] py-8">Loading agent feed...</div>
            ) : filteredEvents.length === 0 ? (
               <div className="text-center text-[#667085] py-8">
                 {selectedTool?.status === 'planned' 
                   ? "This capability is on the v2 roadmap. No live events yet." 
                   : "Waiting for AI agent activity..."}
               </div>
            ) : [...filteredEvents].reverse().map(evt => (
              <div key={evt.id} className="bg-white p-4 rounded-lg border border-[#E4E7EC] shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <ActorBadge actor={evt.actor} />
                    <span className="text-xs font-semibold text-[#101828]">{evt.eventType}</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#667085]">{formatTime(evt.occurredAt)}</span>
                </div>
                <div className="text-sm text-[#475467]">{evt.eventDetail}</div>
                <div className="mt-2 text-[10px] font-mono text-[#9CA3AF]">TxID: {evt.transactionId}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 flex flex-col h-[700px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
          {TOOLS.map(t => {
            const isSelected = selectedToolId === t.id;
            return (
              <button 
                key={t.id} 
                onClick={() => setSelectedToolId(isSelected ? null : t.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 shadow-sm flex gap-4 items-start group
                  ${isSelected 
                    ? 'border-[#2B84EA] bg-[#2B84EA]/5 ring-1 ring-[#2B84EA]/20' 
                    : 'border-[#E4E7EC] bg-white hover:border-[#D0D5DD] hover:shadow-md'
                  }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors
                  ${isSelected ? 'bg-[#2B84EA] text-white' : 'bg-[#F9FAFB] border border-[#E4E7EC] text-[#667085] group-hover:text-[#344054]'}`}>
                  <t.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-semibold truncate transition-colors ${isSelected ? 'text-[#101828]' : 'text-[#344054] group-hover:text-[#101828]'}`}>
                      {t.name}
                    </h3>
                    {t.status === 'active' ? (
                      <span className="w-2 h-2 rounded-full bg-success shrink-0 shadow-[0_0_8px_rgba(23,178,106,0.4)]" title="Active" />
                    ) : (
                      <span className="text-[9px] font-bold bg-[#F2F4F7] text-[#475467] px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#E4E7EC]" title="v2 Roadmap">
                        Planned
                      </span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed transition-colors ${isSelected ? 'text-[#475467]' : 'text-[#667085]'}`}>
                    {t.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}




