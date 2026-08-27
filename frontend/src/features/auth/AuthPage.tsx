import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../services/apiClient';
import { Logo } from '../../components/ui/Logo';

export function AuthPage() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(!location.state?.isSignup);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await apiClient.post('/auth/login', { email, password });
        localStorage.setItem('zoqel_user', JSON.stringify(response.data));
        navigate('/app');
      } else {
        const response = await apiClient.post('/auth/register', { fullName, email, password });
        localStorage.setItem('zoqel_user', JSON.stringify(response.data));
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.response?.data || 'Authentication failed. Please check your credentials and ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative">
        
        <button onClick={() => navigate('/')} className="absolute top-8 left-8 text-[#667085] hover:text-[#101828] font-medium flex items-center gap-2 transition-colors text-sm">
          &larr; Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-sm lg:w-96 mt-8"
        >
          <div className="mb-10">
            <Logo variant="light" />
          </div>

          <h2 className="mt-8 text-3xl font-extrabold text-[#101828]">
            {isLogin ? 'Sign in to Zoqel' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-[#475467]">
            {isLogin ? 'Or ' : 'Already have an account? '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-medium text-[#2B84EA] hover:text-[#1A6DD0]">
              {isLogin ? 'create a new account' : 'sign in to your account'}
            </button>
          </p>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg overflow-hidden">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.3 }}
                  >
                    <label htmlFor="name" className="block text-sm font-medium text-[#344054] mb-1">Full name</label>
                    <input id="name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required={!isLogin} className="appearance-none block w-full px-3 py-2 border border-[#D0D5DD] rounded-lg shadow-sm placeholder-[#98A2B3] focus:outline-none focus:ring-[#2B84EA] focus:border-[#2B84EA] sm:text-sm" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#344054]">Email address</label>
                <div className="mt-1">
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-[#D0D5DD] rounded-lg shadow-sm placeholder-[#98A2B3] focus:outline-none focus:ring-[#2B84EA] focus:border-[#2B84EA] sm:text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#344054]">Password</label>
                <div className="mt-1">
                  <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-[#D0D5DD] rounded-lg shadow-sm placeholder-[#98A2B3] focus:outline-none focus:ring-[#2B84EA] focus:border-[#2B84EA] sm:text-sm" />
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input id="remember-me" type="checkbox" className="h-4 w-4 text-[#2B84EA] focus:ring-[#2B84EA] border-[#D0D5DD] rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-[#344054]">Remember me</label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-[#2B84EA] hover:text-[#1A6DD0]">Forgot your password?</a>
                  </div>
                </div>
              )}

              <div>
                <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2B84EA] hover:bg-[#1A6DD0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B84EA] transition-colors">
                  {isLogin ? 'Sign in' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Right side - Abstract Visual */}
      <div className="hidden lg:block relative w-0 flex-1 bg-[#111827] overflow-hidden">
        <div className="absolute inset-0 h-full w-full object-cover bg-gradient-to-br from-[#111827] via-[#1D2939] to-[#031124]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2B84EA] via-transparent to-transparent"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="max-w-xl text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              {isLogin ? 'Welcome back.' : 'Stop losing revenue to failed payments.'}
            </h2>
            <p className="text-lg text-[#9CA3AF] leading-relaxed">
              {isLogin 
                ? 'Your autonomous AI recovery pipeline has been actively securing revenue while you were away.' 
                : 'Zoqel uses an autonomous AI agent to detect revenue at risk, determine the right intervention, and execute bounded recovery workflows safely and securely.'}
            </p>
            {!isLogin ? (
              <div className="mt-12 p-6 bg-[#1D2939]/50 border border-[#374151] rounded-2xl backdrop-blur-sm text-left">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-white">Live Simulation</span>
                  <span className="flex items-center gap-2 text-xs font-medium text-success"><span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>Active</span>
                </div>
                <div className="space-y-5">
                  {[
                    { label: "Intercepting failure event...", width: "w-full", delay: 0, duration: 2 },
                    { label: "Running ML Risk Model...", width: "w-3/4", delay: 0.5, duration: 2.5 },
                    { label: "Evaluating Recovery Policy...", width: "w-5/6", delay: 1, duration: 2.2 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="text-xs text-[#9CA3AF] font-mono">{item.label}</div>
                      <div className={`h-1.5 ${item.width} bg-[#111827] rounded-full overflow-hidden relative`}>
                        <motion.div 
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-[#2B84EA] to-transparent" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-12 grid grid-cols-2 gap-4">
                <div className="p-6 bg-[#1D2939]/50 border border-[#374151] rounded-2xl backdrop-blur-sm text-left shadow-lg">
                  <div className="text-sm font-semibold text-[#9CA3AF] mb-2">Recovered this month</div>
                  <div className="text-3xl font-bold text-white">₹12.4L</div>
                  <div className="text-xs text-success mt-2 font-medium">↑ 14% vs last month</div>
                </div>
                <div className="p-6 bg-[#1D2939]/50 border border-[#374151] rounded-2xl backdrop-blur-sm text-left shadow-lg">
                  <div className="text-sm font-semibold text-[#9CA3AF] mb-2">Recent Recoveries</div>
                  <div className="text-3xl font-bold text-white">43</div>
                  <div className="text-xs text-[#9CA3AF] mt-2 font-medium">Completed while offline</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
