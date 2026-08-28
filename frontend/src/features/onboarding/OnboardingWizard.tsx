import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CreditCard, Shield, CheckCircle2, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useAuth } from '../auth/AuthContext';
import { Logo } from '../../components/ui/Logo';

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  // Step 1 State
  const [workspaceName, setWorkspaceName] = useState('');
  const [businessType, setBusinessType] = useState('SaaS');

  // Step 2 State
  const [razorpayConnected, setRazorpayConnected] = useState(false);

  // Step 3 State
  const [autoRecovery, setAutoRecovery] = useState(true);
  const [maxRetries, setMaxRetries] = useState(2);
  const [minConfidence, setMinConfidence] = useState(80);
  const [maxAmount, setMaxAmount] = useState(10000); // UI holds rupees, API needs paise. Wait, I will use maxAmount direct. Let's make it hold Rupees.
  const [humanReview, setHumanReview] = useState(true);

  const handleNext = async () => {
    setError('');
    
    if (step === 1) {
      if (!workspaceName) {
        setError('Workspace name is required');
        return;
      }
      setIsLoading(true);
      try {
        await apiClient.post('/workspaces', { name: workspaceName, businessType });
        setStep(2);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to create workspace');
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      if (!razorpayConnected) {
        setError('Please connect your Razorpay sandbox account');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setIsLoading(true);
      try {
        // Save policies (maxAmount is in Rupees, backend needs paise)
        await Promise.all([
          apiClient.put('/policy/max_retries_per_transaction', { value: maxRetries.toString() }),
          apiClient.put('/policy/min_recovery_confidence', { value: (minConfidence / 100).toString() }),
          apiClient.put('/policy/max_auto_amount_paise', { value: (maxAmount * 100).toString() }),
          apiClient.put('/policy/require_human_for_repeated_failure', { value: humanReview.toString() })
        ]);
        
        completeOnboarding();
        navigate('/app');
      } catch (err: any) {
        setError('Failed to save policy settings');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-[#EAECF0]">
        
        {/* Header */}
        <div className="bg-[#101828] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#101828] via-[#1A2333] to-[#2B84EA]/20 opacity-80" />
          <div className="relative z-10 flex flex-col items-center">
            <Logo />
            <h2 className="mt-6 text-2xl font-bold">Connect &rarr; Configure &rarr; Recover</h2>
            <p className="mt-2 text-[#9CA3AF]">Set up your autonomous recovery engine.</p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="px-8 py-6 border-b border-[#EAECF0]">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[#F2F4F7]" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#2B84EA] transition-all duration-300" style={{ width: step === 1 ? '10%' : step === 2 ? '50%' : '100%' }} />
            
            {[
              { num: 1, label: 'Workspace', icon: Building2 },
              { num: 2, label: 'Payment Source', icon: CreditCard },
              { num: 3, label: 'Recovery Policy', icon: Shield }
            ].map((s) => {
              const active = step >= s.num;
              const Icon = s.icon;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${active ? 'bg-[#2B84EA] border-[#2B84EA] text-white' : 'bg-white border-[#D0D5DD] text-[#98A2B3]'}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-xs font-medium ${active ? 'text-[#101828]' : 'text-[#98A2B3]'}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-xl font-bold text-[#101828] mb-6">Create your workspace</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#344054] mb-2">Company Name</label>
                    <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full px-4 py-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#2B84EA] focus:border-[#2B84EA] outline-none transition-shadow" placeholder="Acme Inc." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#344054] mb-2">Business Type</label>
                    <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-4 py-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#2B84EA] focus:border-[#2B84EA] outline-none">
                      <option value="SaaS">SaaS / Subscription</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="EdTech">EdTech</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-xl font-bold text-[#101828] mb-2">Connect Payment Source</h3>
                <p className="text-[#475467] text-sm mb-6">Link your payment gateway to allow Zoqel to monitor and recover failed transactions.</p>
                
                <div className={`p-6 border-2 rounded-xl transition-all ${razorpayConnected ? 'border-[#34D399] bg-[#ECFDF5]' : 'border-[#D0D5DD] hover:border-[#2B84EA]'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-[#EAECF0] flex items-center justify-center p-2">
                        {/* Fake Razorpay Logo */}
                        <div className="w-full h-full bg-[#02042B] rounded text-white flex items-center justify-center font-bold text-xs">RZP</div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#101828]">Razorpay Sandbox</h4>
                        <p className="text-xs text-[#475467]">Test environment connection</p>
                      </div>
                    </div>
                    {razorpayConnected ? (
                      <div className="flex items-center gap-2 text-[#059669] font-medium text-sm">
                        <CheckCircle2 size={18} /> Connected
                      </div>
                    ) : (
                      <button onClick={() => setRazorpayConnected(true)} className="px-4 py-2 bg-[#02042B] text-white text-sm font-medium rounded-lg hover:bg-[#11133C] transition-colors">
                        Connect Sandbox
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-xl font-bold text-[#101828] mb-2">Configure Recovery Policy</h3>
                <p className="text-[#475467] text-sm mb-6">Set the boundaries for your AI agent. You can change these later.</p>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg border border-[#EAECF0]">
                    <div>
                      <h4 className="font-medium text-[#101828]">Autonomous Recovery</h4>
                      <p className="text-xs text-[#475467]">Allow AI to automatically retry transactions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={autoRecovery} onChange={(e) => setAutoRecovery(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2B84EA]"></div>
                    </label>
                  </div>

                  <div className={autoRecovery ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <label className="font-medium text-[#344054]">Maximum automatic retries per transaction</label>
                          <span className="text-[#2B84EA] font-semibold">{maxRetries}</span>
                        </div>
                        <input type="range" min="1" max="5" value={maxRetries} onChange={(e) => setMaxRetries(parseInt(e.target.value))} className="w-full accent-[#2B84EA]" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <label className="font-medium text-[#344054]">Minimum AI confidence required to act</label>
                          <span className="text-[#2B84EA] font-semibold">{minConfidence}%</span>
                        </div>
                        <input type="range" min="50" max="99" value={minConfidence} onChange={(e) => setMinConfidence(parseInt(e.target.value))} className="w-full accent-[#2B84EA]" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#344054] mb-2">Max transaction value for auto-recovery (INR)</label>
                        <input type="number" value={maxAmount} onChange={(e) => setMaxAmount(parseInt(e.target.value))} className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md focus:ring-1 focus:ring-[#2B84EA]" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#F9FAFB] border-t border-[#EAECF0] flex justify-between items-center">
          <button 
            onClick={() => setStep(step - 1)} 
            disabled={step === 1 || isLoading}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${step === 1 ? 'text-transparent cursor-default' : 'text-[#475467] hover:bg-[#F2F4F7]'}`}
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <button 
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2B84EA] hover:bg-[#1A6DD0] text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : step === 3 ? 'Complete Setup' : 'Continue'}
            {!isLoading && step !== 3 && <ArrowRight size={16} />}
          </button>
        </div>

      </div>
    </div>
  );
}
