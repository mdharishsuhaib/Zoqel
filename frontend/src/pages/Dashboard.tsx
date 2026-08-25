import React, { useEffect, useState } from 'react';
import { fetchMetrics } from '../api/dashboard';
import { simulateTransaction } from '../api/transactions';
import { processRecovery } from '../api/recovery';
import { DashboardMetrics, FailureReason } from '../types';
import { formatLakhs, formatPercent } from '../utils/format';
import MetricCard from '../components/MetricCard';
import { TrendingUp, AlertTriangle, CheckCircle, Activity, RefreshCw, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

const FAILURE_REASONS: FailureReason[] = [
  'BANK_TIMEOUT', 'NETWORK_ERROR', 'INSUFFICIENT_FUNDS', 
  'EXPIRED_CARD', 'DUPLICATE_ATTEMPT', 'REPEATED_FAILURE', 'UNKNOWN'
];

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSimulate, setShowSimulate] = useState(false);

  const [simForm, setSimForm] = useState({
    customerId: 'CUST-1',
    amountPaise: 500000,
    failureReason: 'BANK_TIMEOUT',
    paymentMethod: 'UPI'
  });
  
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    setSimResult(null);
    try {
      const tx = await simulateTransaction(
        simForm.customerId,
        simForm.amountPaise,
        simForm.failureReason,
        simForm.paymentMethod
      );
      setSimResult(tx);
      loadMetrics();
    } catch (err: any) {
      alert('Simulation failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSimLoading(false);
    }
  };

  const handleProcessRecovery = async () => {
    if (!simResult) return;
    try {
      await processRecovery(simResult.id);
      alert('Recovery processing started for ' + simResult.id);
      loadMetrics();
    } catch (err: any) {
      alert('Recovery start failed: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading && !metrics) {
    return <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-blue-500 w-8 h-8" /></div>;
  }

  if (error && !metrics) {
    return (
      <div className="text-center py-20">
        <XCircle className="mx-auto text-red-500 w-12 h-12 mb-4" />
        <p className="text-red-600">{error}</p>
        <button onClick={loadMetrics} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Retry</button>
      </div>
    );
  }

  if (!metrics) return null;

  const chartData = [
    { name: 'Analyzed', value: metrics.totalTransactionsAnalyzed, fill: '#9CA3AF' },
    { name: 'Candidates', value: metrics.recoveryCandidates, fill: '#3B82F6' },
    { name: 'Executed', value: metrics.interventionsExecuted, fill: '#8B5CF6' },
    { name: 'Recovered', value: metrics.successfulRecoveries, fill: '#10B981' },
    { name: 'Escalated', value: metrics.humanEscalations, fill: '#F59E0B' },
    { name: 'Ignored', value: metrics.ignoredCases, fill: '#6B7280' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="text-blue-600" /> ZOQEL / AI Revenue Recovery Platform
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowSimulate(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
          >
            Simulate Transaction
          </button>
          <button 
            onClick={loadMetrics}
            className="p-2 bg-white text-gray-600 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Revenue at Risk" 
          value={formatLakhs(metrics.revenueAtRiskPaise)} 
          icon={<AlertTriangle />} 
          colorClass="text-orange-500"
        />
        <MetricCard 
          title="Recoverable Revenue" 
          value={formatLakhs(metrics.recoverableRevenuePaise)} 
          icon={<TrendingUp />} 
          colorClass="text-blue-500"
        />
        <MetricCard 
          title="Revenue Recovered" 
          value={formatLakhs(metrics.revenueRecoveredPaise)} 
          icon={<CheckCircle />} 
          colorClass="text-green-600"
        />
        <MetricCard 
          title="Recovery Rate" 
          value={formatPercent(metrics.recoveryRate)} 
          colorClass="text-green-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Analyzed" value={metrics.totalTransactionsAnalyzed} />
        <MetricCard title="Candidates" value={metrics.recoveryCandidates} />
        <MetricCard title="Interventions" value={metrics.interventionsExecuted} />
        <MetricCard title="Recoveries" value={metrics.successfulRecoveries} />
        <MetricCard title="Escalations" value={metrics.humanEscalations} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium mb-6">Recovery Funnel</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
              <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showSimulate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Simulate Transaction</h2>
              <button onClick={() => setShowSimulate(false)} className="text-gray-400 hover:text-gray-600"><XCircle /></button>
            </div>
            
            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                <input type="text" value={simForm.customerId} onChange={e => setSimForm({...simForm, customerId: e.target.value})} className="w-full border rounded p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Paise)</label>
                <input type="number" value={simForm.amountPaise} onChange={e => setSimForm({...simForm, amountPaise: parseInt(e.target.value)})} className="w-full border rounded p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Failure Reason</label>
                <select value={simForm.failureReason} onChange={e => setSimForm({...simForm, failureReason: e.target.value})} className="w-full border rounded p-2">
                  {FAILURE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select value={simForm.paymentMethod} onChange={e => setSimForm({...simForm, paymentMethod: e.target.value})} className="w-full border rounded p-2">
                  <option value="UPI">UPI</option>
                  <option value="CARD">CARD</option>
                  <option value="NETBANKING">NETBANKING</option>
                </select>
              </div>
              
              <button disabled={simLoading} type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                {simLoading ? 'Simulating...' : 'Simulate Failure'}
              </button>
            </form>

            {simResult && (
              <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
                <p className="text-green-600 font-medium flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4" /> Simulation Successful</p>
                <p className="text-sm mb-4">Transaction ID: <Link to={`/transactions/${simResult.id}`} className="text-blue-600 hover:underline">{simResult.id}</Link></p>
                <button onClick={handleProcessRecovery} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium">
                  Process Recovery
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
