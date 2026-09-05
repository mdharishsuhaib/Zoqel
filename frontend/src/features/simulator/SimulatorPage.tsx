import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useSimulatorStore } from '../../stores/simulatorStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNavigate } from 'react-router-dom';

export function SimulatorPage() {
  const { scenario, status, steps, result, setScenario, start, reset } = useSimulatorStore();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader title="Recovery Simulator" subtitle="Test AI agent behavior in real-time execution" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Config Panel */}
        <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-card p-6 flex flex-col h-[600px]">
          <h2 className="text-lg font-semibold text-[#101828] mb-6">Select Scenario</h2>
          
          <div className="space-y-4 flex-1">
            <button onClick={() => { if (status !== 'running') { setScenario('success'); reset(); } }}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all ${scenario === 'success' ? 'border-[#2B84EA] bg-[#2B84EA]/5' : 'border-[#E4E7EC] hover:border-[#D0D5DD]'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-[#101828]">Scenario A - Successful Recovery</span>
                {scenario === 'success' && <CheckCircle2 className="text-[#2B84EA]" size={20} />}
              </div>
              <div className="text-sm text-[#667085] space-y-1">
                <div>TXN-91823 Â· INR 4,999</div>
                <div>BANK_TIMEOUT Â· Recovery Prob: 87%</div>
              </div>
            </button>

            <button onClick={() => { if (status !== 'running') { setScenario('blocked'); reset(); } }}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all ${scenario === 'blocked' ? 'border-warning bg-warning/5' : 'border-[#E4E7EC] hover:border-[#D0D5DD]'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-[#101828]">Scenario B - Graceful Block</span>
                {scenario === 'blocked' && <CheckCircle2 className="text-warning" size={20} />}
              </div>
              <div className="text-sm text-[#667085] space-y-1">
                <div>TXN-82193 Â· INR 27,500</div>
                <div>REPEATED_FAILURE Â· Recovery Prob: 42%</div>
              </div>
            </button>
          </div>

          <div className="pt-6 border-t border-[#E4E7EC] flex gap-4 mt-auto">
            <button onClick={start} disabled={status === 'running' || status === 'complete'}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#111827] text-white rounded-lg font-semibold hover:bg-[#1D2939] disabled:opacity-50 transition-colors"
            >
              <Play size={18} /> Run Recovery
            </button>
            <button onClick={reset} disabled={status === 'running' || status === 'idle'}
              className="px-6 py-3 border border-[#E4E7EC] text-[#344054] rounded-lg font-medium hover:bg-[#F9FAFB] disabled:opacity-50 transition-colors"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-[#111827] rounded-xl border border-[#1D2939] p-6 shadow-card flex flex-col h-[600px] text-white overflow-hidden relative">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            Execution Log
            {status === 'running' && <span className="flex h-2 w-2 relative ml-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-success"/></span>}
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4 pb-32">
            {status === 'idle' ? (
              <div className="h-full flex items-center justify-center text-[#4B5563]">Ready to simulate.</div>
            ) : (
              <AnimatePresence>
                {steps.map((step, idx) => (
                  <motion.div key={step.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 relative"
                  >
                    {idx !== steps.length - 1 && <div className="absolute top-6 bottom-0 left-[11px] w-px bg-[#1D2939]" />}
                    <div className="relative z-10 shrink-0 bg-[#111827] py-1">
                      {step.status === 'complete' ? <CheckCircle2 size={24} className="text-success fill-[#111827]" /> :
                       step.status === 'active' ? <div className="w-6 h-6 flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-[#3B82F6] animate-pulse" /></div> :
                       <div className="w-6 h-6 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#374151]" /></div>}
                    </div>
                    <div className="py-1">
                      <div className={`text-sm font-semibold mb-1 ${step.status === 'active' ? 'text-white' : step.status === 'complete' ? 'text-[#D1D5DB]' : 'text-[#6B7280]'}`}>{step.label}</div>
                      <div className={`text-xs ${step.status === 'active' ? 'text-[#D1D5DB]' : 'text-[#6B7280]'}`}>{step.detail}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <AnimatePresence>
            {status === 'complete' && result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`absolute bottom-6 left-6 right-6 z-20 p-5 rounded-xl border shadow-xl ${result.success ? 'bg-[#064E3B] border-[#059669]' : 'bg-[#78350F] border-[#D97706]'}`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? <CheckCircle2 size={24} className="text-[#34D399] mt-0.5 shrink-0" /> : <AlertTriangle size={24} className="text-[#FBBF24] mt-0.5 shrink-0" />}
                  <div className="flex-1">
                    <div className={`font-bold text-lg mb-1 ${result.success ? 'text-[#34D399]' : 'text-[#FBBF24]'}`}>{result.message}</div>
                    <div className={`text-sm mb-3 ${result.success ? 'text-[#A7F3D0]' : 'text-[#FDE68A]'}`}>{result.success ? 'Payment successfully settled automatically.' : 'Policy violations prevented automatic execution.'}</div>
                    <button onClick={() => navigate(result.success ? '/app/payments/TXN-91823' : '/app/review')}
                      className={`text-xs font-semibold px-4 py-2 rounded flex items-center gap-2 transition-colors ${result.success ? 'bg-[#047857] hover:bg-[#065F46] text-white' : 'bg-[#92400E] hover:bg-[#78350F] text-white'}`}
                    >
                      {result.success ? 'View Transaction' : 'View Human Review Queue'} <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

