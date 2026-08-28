import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../services/apiClient';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from './AuthContext';
import { ArrowLeft, Loader2, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'signup';
}

export function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await apiClient.post('/auth/login', { email, password });
        login(response.data, response.data.token || "mock_jwt_for_hackathon");
        navigate('/app');
      } else {
        const response = await apiClient.post('/auth/register', { fullName, email, password });
        login(response.data, response.data.token || "mock_jwt_for_hackathon");
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Authentication failed. Please check your credentials and ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative bg-white">
        
        <Link to="/" className="absolute top-8 left-8 text-[#667085] hover:text-[#101828] font-medium flex items-center gap-2 transition-colors text-sm">
          <ArrowLeft size={16} /> Back
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto lg:w-96"
        >
          <div className="mb-8">
            <Logo variant="light" />
            <h2 className="mt-8 text-3xl font-extrabold text-[#101828]">
              {isLogin ? 'Welcome back' : 'Create your Zoqel account'}
            </h2>
            <p className="mt-2 text-sm text-[#475467]">
              {isLogin ? 'Sign in to your revenue intelligence workspace.' : 'Start recovering lost revenue today.'}
            </p>
          </div>

          <div className="mt-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label htmlFor="fullName" className="block text-sm font-medium text-[#344054]">Business Name</label>
                  <div className="mt-1">
                    <input id="fullName" name="fullName" autoComplete="organization" type="text" required value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2.5 border border-[#D0D5DD] rounded-lg shadow-sm placeholder-[#98A2B3] focus:outline-none focus:ring-[#2B84EA] focus:border-[#2B84EA] sm:text-sm transition-colors"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#344054]">Email address</label>
                <div className="mt-1">
                  <input id="email" name="email" autoComplete="email" type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2.5 border border-[#D0D5DD] rounded-lg shadow-sm placeholder-[#98A2B3] focus:outline-none focus:ring-[#2B84EA] focus:border-[#2B84EA] sm:text-sm transition-colors"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#344054]">Password</label>
                <div className="mt-1">
                  <input id="password" name="password" autoComplete={isLogin ? "current-password" : "new-password"} type="password" required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2.5 border border-[#D0D5DD] rounded-lg shadow-sm placeholder-[#98A2B3] focus:outline-none focus:ring-[#2B84EA] focus:border-[#2B84EA] sm:text-sm transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#344054]">Confirm Password</label>
                  <div className="mt-1">
                    <input id="confirmPassword" name="confirmPassword" autoComplete="new-password" type="password" required value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2.5 border border-[#D0D5DD] rounded-lg shadow-sm placeholder-[#98A2B3] focus:outline-none focus:ring-[#2B84EA] focus:border-[#2B84EA] sm:text-sm transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </motion.div>
              )}
              
              {!isLogin && (
                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-[#2B84EA] focus:ring-[#2B84EA] border-[#D0D5DD] rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-[#475467]">
                    I agree to the Terms of Service
                  </label>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2B84EA] hover:bg-[#1A6DD0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B84EA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E4E7EC]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-[#667085]">OR</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/demo"
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-[#E4E7EC] rounded-lg shadow-sm text-sm font-semibold text-[#101828] bg-white hover:bg-[#F9FAFB] transition-colors"
                >
                  Explore Live Demo <ArrowRight size={16} className="text-[#667085]" />
                </Link>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-[#475467]">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-semibold text-[#2B84EA] hover:text-[#1A6DD0]">
                    Create one
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-[#2B84EA] hover:text-[#1A6DD0]">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Image/Gradient */}
      <div className="hidden lg:block relative w-0 flex-1 bg-[#101828] overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-center px-16 z-10 text-white">
          <h3 className="text-4xl font-bold mb-6">Stop losing 30% of your revenue to false declines.</h3>
          <p className="text-lg text-[#9CA3AF] max-w-lg leading-relaxed">
            Zoqel uses AI to automatically detect, diagnose, and recover failed payments before your customers even notice.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 text-[#D1D5DB]">
              <div className="w-12 h-12 rounded-full bg-[#1F2937] flex items-center justify-center text-[#2B84EA] font-bold">1</div>
              <div>Detect revenue at risk instantly</div>
            </div>
            <div className="flex items-center gap-4 text-[#D1D5DB]">
              <div className="w-12 h-12 rounded-full bg-[#1F2937] flex items-center justify-center text-[#2B84EA] font-bold">2</div>
              <div>AI selects the optimal recovery path</div>
            </div>
            <div className="flex items-center gap-4 text-[#D1D5DB]">
              <div className="w-12 h-12 rounded-full bg-[#1F2937] flex items-center justify-center text-[#2B84EA] font-bold">3</div>
              <div>Recover money within policy bounds</div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#101828] via-[#1A2333] to-[#2B84EA]/20 opacity-80 mix-blend-multiply" />
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[#2B84EA]/20 blur-[120px]" />
        <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#8B5CF6]/20 blur-[100px]" />
      </div>
    </div>
  );
}

