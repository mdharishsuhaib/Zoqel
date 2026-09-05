import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatLakhsSymbol } from '../../utils/format';

export function ProofModePage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center p-8 text-white">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 max-w-3xl"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="/logo.png" alt="Zoqel Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-4xl font-bold tracking-widest">ZOQEL</span>
        </div>
        
        <div className="bg-[#1D2939]/50 border border-[#374151] rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <h2 className="text-[#3B82F6] font-semibold tracking-widest uppercase mb-4 text-sm">The Problem</h2>
          <p className="text-xl leading-relaxed text-[#D1D5DB] font-light">
            "Revenue loss rarely happens in one clean step. A payment degrades, a checkout gets abandoned, a subscription fails, or an invoice goes overdue. AI can now close the loop from detecting the problem to diagnosing it, choosing the right intervention, and recovering the money."
          </p>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="w-64 h-px bg-[#1D2939] mb-12" />

      {/* Key metrics */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 mb-12 text-center"
      >
        <div>
          <div className="text-5xl font-bold text-success tabular-nums mb-2">{formatLakhsSymbol(53971420)}</div>
          <div className="text-[#9CA3AF] text-xs uppercase tracking-widest">Revenue Recovered</div>
        </div>
        <div>
          <div className="text-5xl font-bold tabular-nums mb-2">10,000</div>
          <div className="text-[#9CA3AF] text-xs uppercase tracking-widest">Transactions</div>
        </div>
        <div>
          <div className="text-5xl font-bold text-[#2B84EA] tabular-nums mb-2">89.7%</div>
          <div className="text-[#9CA3AF] text-xs uppercase tracking-widest">Recovery Rate</div>
        </div>
      </motion.div>

      {/* Model metrics */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="flex gap-8 mb-12 text-center"
      >
        <div><div className="text-2xl font-bold tabular-nums">73.6%</div><div className="text-[#6B7280] text-xs mt-1">Precision</div></div>
        <div><div className="text-2xl font-bold tabular-nums">90.7%</div><div className="text-[#6B7280] text-xs mt-1">Recall</div></div>
        <div><div className="text-2xl font-bold tabular-nums">81.3%</div><div className="text-[#6B7280] text-xs mt-1">F1 Score</div></div>
        <div><div className="text-2xl font-bold tabular-nums">87.6%</div><div className="text-[#6B7280] text-xs mt-1">AUC-ROC</div></div>
      </motion.div>

      <div className="w-64 h-px bg-[#1D2939] mb-12" />

      {/* Two scenarios */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 w-full max-w-2xl"
      >
        {/* Scenario A */}
        <div className="border border-[#1D2939] rounded-xl p-6">
          <div className="text-[#2B84EA] text-xs font-semibold uppercase tracking-wide mb-4">Scenario A â€” Successful Recovery</div>
          <div className="text-sm text-[#9CA3AF] mb-3">TXN-91823 Â· INR 4,999 Â· BANK_TIMEOUT</div>
          <div className="space-y-1 text-sm">
            {['FAILED', 'AI DIAGNOSIS', 'POLICY APPROVED', 'RETRY', 'SUCCESS'].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className="w-px h-3 bg-[#374151] ml-2" />}
                <span className={i === 4 ? 'text-success font-semibold' : 'text-[#D1D5DB]'}>{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-success font-bold text-lg">INR 4,999 RECOVERED</div>
        </div>
        {/* Scenario B */}
        <div className="border border-[#1D2939] rounded-xl p-6">
          <div className="text-warning text-xs font-semibold uppercase tracking-wide mb-4">Scenario B â€” Graceful Block</div>
          <div className="text-sm text-[#9CA3AF] mb-3">TXN-82193 Â· INR 27,500 Â· REPEATED_FAILURE</div>
          <div className="space-y-1 text-sm">
            {['FAILED', 'AI DIAGNOSIS', 'POLICY BLOCKED', 'HUMAN REVIEW'].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className="w-px h-3 bg-[#374151] ml-2" />}
                <span className={i === 2 ? 'text-warning font-semibold' : i === 3 ? 'text-[#2B84EA]' : 'text-[#D1D5DB]'}>{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-warning text-sm">No automatic action â€” safe escalation</div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="fixed bottom-8 right-8 flex gap-4">
        <button onClick={() => navigate('/app/simulator')}
          className="px-6 py-3 bg-[#1F2937] hover:bg-[#374151] text-white font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg border border-[#374151]"
        >
          Run Simulator
        </button>
        <button onClick={() => navigate('/app')}
          className="px-6 py-2.5 border border-[#374151] text-[#D1D5DB] rounded-lg text-sm hover:border-[#6B7280] transition-colors"
        >
          Exit Proof Mode
        </button>
      </div>
    </div>
  );
}

