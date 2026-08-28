import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Brain, Lock, Zap, CheckCircle2, AlertTriangle, ShieldCheck, BarChart3, Database, Cpu, Target, Radar, Waypoints } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#101828] font-sans selection:bg-[#2B84EA] selection:text-white">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-md border-b border-[#E4E7EC] sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <Logo variant="light" />
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#475467]">
              <a href="#pipeline" className="hover:text-[#2B84EA] transition-colors">How it Works</a>
              <a href="#ai-engine" className="hover:text-[#2B84EA] transition-colors">AI Engine</a>
              <a href="#comparison" className="hover:text-[#2B84EA] transition-colors">Why Zoqel</a>
              <a href="#razorpay" className="hover:text-[#2B84EA] transition-colors">Integration</a>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-[#475467] hover:text-[#101828] transition-colors">Sign in</button>
              <button onClick={() => navigate('/signup')} className="text-sm font-medium px-4 py-2 bg-[#2B84EA] text-white rounded-lg hover:bg-[#1A6DD0] transition-all shadow-sm hover:shadow">Get Started</button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white pt-20 pb-16">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[#2B84EA]/5 blur-[120px]" />
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#8B5CF6]/5 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>
            <h1 className="inline-block text-center text-5xl md:text-[72px] font-extrabold tracking-tight text-[#101828] mb-8 leading-[1.1]">
                <span className="block">
                  <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block mr-3 md:mr-4">Detect.</motion.span>
                  <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block mr-3 md:mr-4">Diagnose.</motion.span>
                  <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block">Decide.</motion.span>
                </span>
                <motion.span 
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} 
                  transition={{ delay: 0.6 }}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2B84EA] to-[#0E51AA] mt-1 md:mt-2"
                >
                  Recover.
                </motion.span>
              </h1>
            
            <motion.p 
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ delay: 1 }}
              className="mt-6 max-w-3xl text-xl text-[#475467] mx-auto mb-10 leading-relaxed font-light"
            >
              Stop relying on static retry logic. Zoqel is an autonomous intelligence layer that <span className="font-semibold text-[#101828]">automatically</span> recovers lost revenue from failed payments.
            </motion.p>
            
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ delay: 1.2 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => navigate('/demo')} 
                  className="px-8 py-4 text-lg font-bold rounded-xl text-white bg-[#2B84EA] hover:bg-[#1A6DD0] transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-3"
                >
                  Explore Live Demo <ArrowRight size={20} className="text-[#93C5FD]" />
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="px-8 py-4 text-lg font-bold rounded-xl text-[#101828] bg-white border-2 border-[#E4E7EC] hover:bg-[#F9FAFB] transition-all shadow-sm"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Product Dashboard Preview (CSS Mockup) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="rounded-2xl border border-[#E4E7EC] bg-white shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="h-12 bg-[#F9FAFB] border-b border-[#E4E7EC] flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#F04438]" />
              <div className="w-3 h-3 rounded-full bg-[#F79009]" />
              <div className="w-3 h-3 rounded-full bg-[#12B76A]" />
            </div>
            <div className="mx-auto bg-white border border-[#E4E7EC] text-xs text-[#98A2B3] px-32 py-1 rounded-md font-mono">
              zoqel.ai/dashboard
            </div>
          </div>
          <div className="p-8 bg-[#F7F8FA]">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#101828]">Zoqel Intelligence</h3>
                <p className="text-sm text-[#667085]">Live revenue recovery operations</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6] text-xs font-bold rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> LIVE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-5 rounded-xl border border-[#E4E7EC] shadow-sm">
                <div className="text-sm text-[#667085] mb-2">Revenue at Risk</div>
                <div className="text-2xl font-bold text-[#101828]">₹12.4L</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#E4E7EC] shadow-sm border-l-4 border-l-[#3B82F6]">
                <div className="text-sm text-[#667085] mb-2">Recovery Rate</div>
                <div className="text-2xl font-bold text-[#3B82F6]">84.7%</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#E4E7EC] shadow-sm border-l-4 border-l-success">
                <div className="text-sm text-[#667085] mb-2">Recovered Revenue</div>
                <div className="text-2xl font-bold text-success">₹8.7L</div>
              </div>
            </div>

            <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E4E7EC] bg-[#F9FAFB] font-semibold text-[#101828]">AI Recovery Queue</div>
              <div className="p-0">
                <table className="w-full text-left text-sm">
                  <thead className="text-[#667085] bg-[#F9FAFB] border-b border-[#E4E7EC]">
                    <tr><th className="px-4 py-2 font-medium">Payment ID</th><th className="px-4 py-2 font-medium">Risk Tier</th><th className="px-4 py-2 font-medium">AI Recommendation</th><th className="px-4 py-2 font-medium">Confidence</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#F2F4F7]">
                      <td className="px-4 py-3 font-mono font-medium text-[#2B84EA]">TXN-9821</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#FEF3F2] text-[#B42318] text-xs font-bold rounded">HIGH</span></td>
                      <td className="px-4 py-3 font-medium text-[#101828]">Smart Retry</td>
                      <td className="px-4 py-3 text-success font-bold">94%</td>
                    </tr>
                    <tr className="border-b border-[#F2F4F7]">
                      <td className="px-4 py-3 font-mono font-medium text-[#2B84EA]">TXN-9822</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#FFFAEB] text-[#B54708] text-xs font-bold rounded">MEDIUM</span></td>
                      <td className="px-4 py-3 font-medium text-[#101828]">Customer Reminder</td>
                      <td className="px-4 py-3 text-[#2B84EA] font-bold">81%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono font-medium text-[#2B84EA]">TXN-9823</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#FEF3F2] text-[#B42318] text-xs font-bold rounded">HIGH</span></td>
                      <td className="px-4 py-3 font-medium text-[#101828]">Escalate to Human</td>
                      <td className="px-4 py-3 text-[#667085] font-bold">42%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* The Intelligence Pipeline */}
      <div id="pipeline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-[#E4E7EC]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#101828] mb-4">From Payment Failure to Revenue Recovery</h2>
          <p className="text-lg text-[#667085] max-w-2xl mx-auto">Zoqel replaces static retry logic with a continuous intelligence pipeline.</p>
        </div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} 
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative"
        >
          {/* Connecting Lines for Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[#D0D5DD] via-[#2B84EA] to-[#12B76A] -z-10" />

          {[
            { step: '01', icon: Radar, title: 'Detect', desc: 'Monitors events and identifies revenue-risk signals before they drop off.' },
            { step: '02', icon: Brain, title: 'Diagnose', desc: 'AI agents analyze payment history, customer behavior, and failure patterns.' },
            { step: '03', icon: Waypoints, title: 'Decide', desc: 'The LLM decision engine selects the most statistically probable recovery action.' },
            { step: '04', icon: ShieldCheck, title: 'Recover', desc: 'Executes a policy-bounded workflow: retry, notify, escalate, or hold.' },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }} 
              whileHover={{ y: -8 }}
              className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-sm relative z-10 hover:shadow-xl hover:border-[#2B84EA]/30 hover:bg-[#F0F6FF]/20 transition-all duration-300 cursor-default"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#F0F6FF] text-[#2B84EA] rounded-xl flex items-center justify-center">
                  <item.icon size={24} />
                </div>
                <span className="text-3xl font-black text-[#F2F4F7]">{item.step}</span>
              </div>
              <h3 className="text-lg font-bold text-[#101828] mb-2">{item.title}</h3>
              <p className="text-[#475467] leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* AI Diagnosis Demo */}
      <div id="ai-engine" className="bg-[#111827] py-24 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzNzQxNTEiLz48L3N2Zz4=')] opacity-20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Zoqel Intelligence Engine</h2>
            <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto">Look inside the "black box". Every recovery decision is fully transparent, auditable, and bounded by your business rules.</p>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.5 } } }}
            className="flex flex-col items-center max-w-lg mx-auto"
          >
            {/* Failure Signal */}
            <motion.div variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }} className="bg-[#F04438]/20 border border-[#F04438]/50 px-6 py-3 rounded-lg text-[#FEE2E2] font-mono text-sm shadow-[0_0_15px_rgba(240,68,56,0.2)]">
              EVENT: INSUFFICIENT_FUNDS
            </motion.div>
            <motion.div variants={{ hidden: { height: 0, opacity: 0 }, visible: { height: 32, opacity: 1 } }} className="border-l-2 border-dashed border-[#374151] my-2" />
            
            {/* AI Diagnosis */}
            <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} className="bg-[#1D2939] border border-[#374151] rounded-xl w-full p-6 shadow-2xl relative">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#8B5CF6] rounded-lg flex items-center justify-center shadow-lg">
                <Cpu size={16} className="text-white" />
              </div>
              <h4 className="text-[#8B5CF6] font-bold text-xs uppercase tracking-widest mb-4">AI Diagnosis</h4>
              <div className="space-y-3 font-mono text-sm text-[#D1D5DB]">
                <div className="flex justify-between border-b border-[#374151] pb-2"><span>Failure Type:</span><span className="text-white">Soft Decline</span></div>
                <div className="flex justify-between border-b border-[#374151] pb-2"><span>Customer Risk:</span><span className="text-success">Low (LTV: ₹1.2L)</span></div>
                <div className="flex justify-between border-b border-[#374151] pb-2"><span>Historical Success:</span><span className="text-white">High on day 3</span></div>
                <div className="flex justify-between pt-1"><span>Probability:</span><span className="text-[#2B84EA] font-bold text-lg">87%</span></div>
              </div>
            </motion.div>
            
            <motion.div variants={{ hidden: { height: 0, opacity: 0 }, visible: { height: 32, opacity: 1 } }} className="border-l-2 border-dashed border-[#374151] my-2" />
            
            {/* Action */}
            <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} className="bg-[#1D2939] border border-[#374151] rounded-xl w-full p-6 shadow-2xl relative">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#2B84EA] rounded-lg flex items-center justify-center shadow-lg">
                <Target size={16} className="text-white" />
              </div>
              <h4 className="text-[#2B84EA] font-bold text-xs uppercase tracking-widest mb-4">Recommended Action</h4>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-white">Smart Retry Sequence</div>
                <div className="text-[#9CA3AF] text-sm">Schedule 3 attempts over 72 hours.</div>
                <div className="inline-block mt-2 px-3 py-1 bg-[#12B76A]/20 border border-[#12B76A]/30 text-[#6CE9A6] rounded text-xs font-bold">
                  ✓ POLICY APPROVED
                </div>
              </div>
            </motion.div>

            <motion.div variants={{ hidden: { height: 0, opacity: 0 }, visible: { height: 32, opacity: 1 } }} className="border-l-2 border-solid border-[#12B76A] my-2" />

            {/* Success */}
            <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }} transition={{ type: "spring", bounce: 0.5 }} className="bg-[#12B76A] border border-[#027A48] px-8 py-4 rounded-xl text-white font-bold shadow-[0_0_30px_rgba(18,183,106,0.3)] flex items-center gap-3">
              <CheckCircle2 size={24} /> REVENUE RECOVERED
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Why Zoqel Comparison */}
      <div id="comparison" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#101828] mb-4">Why Zoqel?</h2>
          <p className="text-lg text-[#667085]">Static rules leave money on the table. Autonomous agents recover it.</p>
        </div>
        
        <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E4E7EC]">
                <th className="px-6 py-4 font-semibold text-[#667085]">Capability</th>
                <th className="px-6 py-4 font-semibold text-[#667085]">Traditional Systems</th>
                <th className="px-6 py-4 font-bold text-[#2B84EA] text-lg bg-[#F0F6FF]">Zoqel AI</th>
              </tr>
            </thead>
            <motion.tbody 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="divide-y divide-[#E4E7EC]"
            >
              {[
                { cap: 'Detection', old: 'Detects failure after the fact', new: 'Detects risk before revenue loss' },
                { cap: 'Intervention', old: 'Fixed Dunning rules (e.g. retry day 3, 5, 7)', new: 'AI-selected interventions (Retry, Notify, Escalate)' },
                { cap: 'Analysis', old: 'Manual investigation required', new: 'LLM root-cause diagnosis in ms' },
                { cap: 'Autonomy', old: 'Reactive scripts', new: 'Predictive & Autonomous agents' },
                { cap: 'Safety', old: 'Blindly retries everything', new: 'Strict Policy-bounded Guardrails' },
              ].map((row, i) => (
                <motion.tr key={i} variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 font-medium text-[#101828]">{row.cap}</td>
                  <td className="px-6 py-4 text-[#667085]">{row.old}</td>
                  <td className="px-6 py-4 font-semibold text-[#101828] bg-[#F0F6FF]/30 flex items-center gap-2">
                    <motion.div variants={{ hidden: { scale: 0 }, visible: { scale: 1 } }} transition={{ type: "spring" }}>
                      <CheckCircle2 size={16} className="text-[#2B84EA]" />
                    </motion.div> {row.new}
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Razorpay Integration */}
      <div id="razorpay" className="bg-[#F0F6FF] border-y border-[#B2DDFF] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 border border-[#B2DDFF]">
            <Database size={32} className="text-[#2B84EA]" />
          </motion.div>
          <h2 className="text-3xl font-bold text-[#101828] mb-4">Built for Modern Payment Ecosystems</h2>
          <p className="text-lg text-[#475467] max-w-3xl mx-auto mb-10">
            Zoqel ingests webhooks and events directly from payment gateways like Razorpay, instantly wrapping your existing payment infrastructure in a layer of autonomous AI recovery intelligence.
          </p>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm font-bold text-[#101828]"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="px-6 py-3 bg-white border border-[#D0D5DD] rounded-lg shadow-sm">Razorpay Webhooks</motion.div>
            <motion.div variants={{ hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } }}><ArrowRight className="text-[#98A2B3] rotate-90 md:rotate-0" /></motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="px-6 py-3 bg-[#2B84EA] text-white border border-[#1A6DD0] rounded-lg shadow-md">Zoqel Intelligence Engine</motion.div>
            <motion.div variants={{ hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } }}><ArrowRight className="text-[#98A2B3] rotate-90 md:rotate-0" /></motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="px-6 py-3 bg-white border border-[#D0D5DD] rounded-lg shadow-sm">Revenue Recovered</motion.div>
          </motion.div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-b from-white to-[#F0F6FF] py-20 text-center border-t border-[#E4E7EC] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#2B84EA]/5 blur-[100px]" />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto px-4"
        >
          <h2 className="text-4xl font-extrabold text-[#101828] mb-6">Ready to stop losing revenue?</h2>
          <p className="text-xl text-[#667085] max-w-2xl mx-auto mb-10">Start recovering lost revenue today — no complex setup, no static retry rules, just autonomous recovery from day one.</p>
          <button onClick={() => navigate('/signup')} className="px-10 py-4 text-lg font-bold rounded-xl text-white bg-[#2B84EA] hover:bg-[#1A6DD0] transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-3">
            Get Started <ArrowRight size={20} className="text-[#93C5FD]" />
          </button>
        </motion.div>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#111827] text-[#9CA3AF] border-t border-[#1D2939] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
            <div>
              <Logo variant="dark" />
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-[#9CA3AF]">
              <button onClick={() => navigate('/docs')} className="hover:text-white transition-colors">Documentation</button>
              <a href="https://github.com/mdharishsuhaib/Zoqel" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a>
              <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
            </div>
          </div>
          <div className="text-center text-sm border-t border-[#374151] pt-8 opacity-75">
            Built for the Razorpay Buildathon • Track 03: AI Revenue Recovery
          </div>
        </div>
      </footer>
    </div>
  );
}
