import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getDashboardMetrics, getChartData, getTransactions } from '../../services/recoveryService';
import { MetricCard } from '../../components/ui/MetricCard';
import { MetricCardSkeleton } from '../../components/ui/LoadingSkeleton';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatLakhsSymbol } from '../../utils/format';
import { getAuditEvents } from '../../services/auditService';

import { StatusBadge } from '../../components/ui/StatusBadge';
import { PipelineVisual } from '../../components/recovery/PipelineVisual';
import { motion, AnimatePresence } from 'framer-motion';

export function OverviewPage() {
  const [timeRange, setTimeRange] = useState<'30D' | '7D'>('30D');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const { data: metrics, isLoading: isMetricsLoading, isError: isMetricsError } = useQuery({ queryKey: ['metrics'], queryFn: getDashboardMetrics, refetchInterval: 8000, retry: 3 });
  const { data: chartData, isLoading: isChartLoading } = useQuery({ queryKey: ['chart'], queryFn: getChartData, refetchInterval: 8000 });
  const { data: txData } = useQuery({ queryKey: ['transactions', 0, 5], queryFn: () => getTransactions(0, 5), refetchInterval: 8000 });
  const { data: auditEvents } = useQuery({ queryKey: ['auditEvents'], queryFn: () => getAuditEvents(), refetchInterval: 8000 });
  const recentTx = txData?.content || [];

  const filteredChartData = useMemo(() => {
    if (!chartData) return [];
    return timeRange === '7D' ? chartData.slice(-7) : chartData;
  }, [chartData, timeRange]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Overview" 
        subtitle="Closing the loop: from detecting payment degrades and abandoned checkouts, to diagnosing failed subscriptions and recovering overdue receivables." 
      />
      
      <div className="grid grid-cols-4 gap-4">
        {isMetricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : isMetricsError ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E4E7EC] p-6 shadow-card flex flex-col items-center justify-center gap-2 text-center h-[110px]">
              <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
              <p className="text-xs text-[#667085]">Reconnecting to server...</p>
            </div>
          ))
        ) : (
          <>
            <MetricCard title="Revenue at Risk" value={formatLakhsSymbol(metrics.revenueAtRiskPaise)} accent="danger" subtitle={`Last ${timeRange}`} />
            <MetricCard title="Recoverable Revenue" value={formatLakhsSymbol(metrics.recoverableRevenuePaise)} accent="blue" subtitle="Estimated by Zoqel" />
            <MetricCard title="Revenue Recovered" value={formatLakhsSymbol(metrics.revenueRecoveredPaise)} accent="success" subtitle="Successfully completed" />
            <MetricCard title="Recovery Rate" value={`${Number(metrics.recoveryRate).toFixed(1)}%`} accent="violet" subtitle="Of recoverable revenue" trend={{ value: '+2.1%', positive: true }} />
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E4E7EC] p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#101828]">Recovery Performance</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setTimeRange('30D')}
              className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${timeRange === '30D' ? 'bg-[#F2F4F7] text-[#101828]' : 'text-[#667085] hover:bg-[#F9FAFB]'}`}
            >
              30D
            </button>
            <button 
              onClick={() => setTimeRange('7D')}
              className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${timeRange === '7D' ? 'bg-[#F2F4F7] text-[#101828]' : 'text-[#667085] hover:bg-[#F9FAFB]'}`}
            >
              7D
            </button>
          </div>
        </div>
        <div className="h-80">
          {isChartLoading || !chartData ? (
            <div className="h-full flex items-center justify-center text-[#98A2B3]">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#667085' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#667085' }} tickFormatter={(val) => formatLakhsSymbol(val * 100)} dx={-10} />
                <Tooltip 
                  formatter={(value: number) => formatLakhsSymbol(value * 100)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E4E7EC', boxShadow: '0 4px 6px -2px rgba(16,24,40,0.03)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                <Line type="monotone" name="At Risk" dataKey="atRisk" stroke="#F04438" strokeWidth={2} dot={false} activeDot={{ r: 6 }} className="live-line" isAnimationActive={false} />
                <Line type="monotone" name="Recoverable" dataKey="recoverable" stroke="#3B82F6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} className="live-line" isAnimationActive={false} />
                <Line type="monotone" name="Recovered" dataKey="recovered" stroke="#12B76A" strokeWidth={3} dot={false} activeDot={{ r: 6 }} className="live-line" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E4E7EC] p-6 shadow-card">
          <h2 className="text-lg font-semibold text-[#101828] mb-4">Recent Recovery Queue</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#E4E7EC] text-[#667085]">
                  <th className="pb-3 font-medium">Transaction</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map(t => (
                  <React.Fragment key={t.id}>
                    <tr 
                      onClick={() => setExpandedRow(expandedRow === t.id ? null : t.id)}
                      className="border-b border-[#F2F4F7] last:border-0 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="py-3 text-[#101828] font-medium flex items-center gap-2">
                        {expandedRow === t.id ? <ChevronUp size={16} className="text-[#98A2B3]" /> : <ChevronDown size={16} className="text-[#98A2B3]" />}
                        {t.id}
                      </td>
                      <td className="py-3 text-[#475467]">{formatLakhsSymbol(t.amountPaise)}</td>
                      <td className="py-3"><StatusBadge status={t.status} /></td>
                    </tr>
                    <AnimatePresence>
                      {expandedRow === t.id && (
                        <tr>
                          <td colSpan={3} className="p-0 border-b border-[#F2F4F7]">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-[#F9FAFB]"
                            >
                              <PipelineVisual />
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl border border-[#1D2939] p-6 shadow-card text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#2B84EA] animate-pulse" />
            <h2 className="text-lg font-semibold">Zoqel Intelligence</h2>
          </div>
          <div className="space-y-4">
            {(auditEvents || []).filter(e => e.transactionId === 'TXN-91823').slice(-3).map((e: any) => (
              <div key={e.id} className="border-l-2 border-[#374151] pl-4 py-1">
                <div className="text-xs text-[#9CA3AF] mb-1 font-mono">{e.actor}</div>
                <div className="text-sm">{e.eventDetail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




