import { Activity, Shield, Brain, Zap, Key, Database, Globe, Lock } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatTime } from '../../utils/format';
import { useQuery } from '@tanstack/react-query';
import { getAuditEvents } from '../../services/auditService';

const TOOLS = [
  { id: 't1', name: 'Risk Scoring Engine', description: 'Calculates real-time risk scores for incoming transactions.', icon: Shield, status: 'active' },
  { id: 't2', name: 'ML Prediction Model', description: 'Infers recovery probability based on historical patterns.', icon: Brain, status: 'active' },
  { id: 't3', name: 'Policy Validator', description: 'Ensures AI actions strictly follow configured business rules.', icon: Lock, status: 'active' },
  { id: 't4', name: 'Mandate Retry Sequencer', description: 'Intelligently spaces out retry attempts to maximize success rates.', icon: Zap, status: 'active' },
  { id: 't5', name: 'Hinglish Voice Recovery', description: 'Automated conversational voice bot for regional customer outreach.', icon: Globe, status: 'active' },
  { id: 't6', name: 'B2B Receivables Chaser', description: 'Follow-up engine specifically tuned for overdue B2B invoices.', icon: Database, status: 'active' },
  { id: 't7', name: 'Promise-to-Pay Tracker', description: 'Logs and monitors customer commitments to pay at a future date.', icon: Activity, status: 'active' },
  { id: 't8', name: 'Decision Engine', description: 'Core LLM agent that synthesizes data to make recovery decisions.', icon: Key, status: 'active' },
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
  return <span className={\px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase \\}>{actor}</span>;
}

export function AgentPage() {
  const { data: rawEvents, isLoading } = useQuery({ 
    queryKey: ['auditEvents'], 
    queryFn: () => getAuditEvents() 
  });
  
  const events = Array.isArray(rawEvents) ? rawEvents : [];

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

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 bg-white rounded-xl border border-[#E4E7EC] shadow-card flex flex-col h-[700px]">
          <div className="p-5 border-b border-[#E4E7EC] flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#101828]">Agent Reasoning Feed</h2>
            <div className="flex items-center gap-2 text-success text-xs font-semibold">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-success"/></span>
              LIVE
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F9FAFB]">
            {isLoading ? (
               <div className="text-center text-[#667085] py-8">Loading agent feed...</div>
            ) : events.length === 0 ? (
               <div className="text-center text-[#667085] py-8">Waiting for AI agent activity...</div>
            ) : [...events].reverse().map(evt => (
              <div key={evt.id} className="bg-white p-4 rounded-lg border border-[#E4E7EC] shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <ActorBadge actor={evt.actor} />
                    <span className="text-xs font-semibold text-[#101828]">{evt.eventType}</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#667085]">{formatTime(evt.timestamp)}</span>
                </div>
                <div className="text-sm text-[#475467]">{evt.eventDetail}</div>
                <div className="mt-2 text-[10px] font-mono text-[#9CA3AF]">TxID: {evt.transactionId}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          {TOOLS.map(t => (
            <div key={t.id} className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-[#F9FAFB] border border-[#E4E7EC] flex items-center justify-center shrink-0">
                <t.icon size={20} className="text-[#667085]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-[#101828] truncate">{t.name}</h3>
                  <span className="w-2 h-2 rounded-full bg-success shrink-0" title="Active" />
                </div>
                <p className="text-xs text-[#667085] leading-relaxed">{t.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
