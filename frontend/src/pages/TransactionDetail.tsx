import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTransaction } from '../api/transactions';
import { fetchRiskScore } from '../api/risk';
import { fetchAuditTimeline } from '../api/audit';
import { fetchRecoveryCaseByTransaction, processRecovery } from '../api/recovery';
import { Transaction, RiskScore, AuditEvent, RecoveryCase } from '../types';
import { formatRupees, formatDateTime, formatPercent } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import AuditTimeline from '../components/AuditTimeline';
import { ArrowLeft, AlertTriangle, ShieldCheck, RefreshCw, Zap } from 'lucide-react';

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  
  const [tx, setTx] = useState<Transaction | null>(null);
  const [risk, setRisk] = useState<RiskScore | null>(null);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [recoveryCase, setRecoveryCase] = useState<RecoveryCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const txData = await fetchTransaction(id);
      setTx(txData);
      
      const [riskData, auditData] = await Promise.all([
        fetchRiskScore(id).catch(() => null),
        fetchAuditTimeline(id).catch(() => []),
      ]);
      setRisk(riskData);
      setAudit(auditData);

      try {
        const rcData = await fetchRecoveryCaseByTransaction(id);
        setRecoveryCase(rcData);
      } catch {
        setRecoveryCase(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStartRecovery = async () => {
    if (!id) return;
    try {
      await processRecovery(id);
      loadData();
    } catch (err) {
      alert('Failed to start recovery');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-blue-500 w-8 h-8" /></div>;
  if (error || !tx) return <div className="text-red-500 py-20 text-center">{error || 'Not found'}</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link to="/transactions" className="inline-flex items-center text-sm text-blue-600 hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Transactions
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              {formatRupees(tx.amountPaise)}
              <StatusBadge status={tx.status} />
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">TX: {tx.id}</p>
          </div>
          {tx.status === 'FAILED' && !recoveryCase && (
            <button 
              onClick={handleStartRecovery}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm font-medium"
            >
              <Zap className="w-4 h-4" /> Process Recovery
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium border-b pb-4 mb-4">Transaction Details</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Customer</p>
                <p className="font-medium text-gray-900">{tx.customer.name}</p>
                <p className="text-gray-400 font-mono text-xs mt-0.5">{tx.customer.id}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium text-gray-900">{tx.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Initiated At</p>
                <p className="font-medium text-gray-900">{formatDateTime(tx.initiatedAt)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Failure Reason</p>
                <p className="font-medium text-red-600">{tx.failureReason || 'N/A'}</p>
              </div>
            </div>
          </div>

          {recoveryCase && (
            <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-6">
              <div className="flex justify-between items-center border-b border-blue-200 pb-4 mb-4">
                <h2 className="text-lg font-medium text-blue-900">Recovery Case</h2>
                <StatusBadge status={recoveryCase.status} />
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <p className="text-blue-700 mb-1">Agent Decision</p>
                  <p className="font-medium text-blue-900">{recoveryCase.agentDecision || 'Pending'}</p>
                  {recoveryCase.agentConfidence && (
                    <p className="text-blue-600 text-xs mt-0.5">Confidence: {formatPercent(recoveryCase.agentConfidence * 100)}</p>
                  )}
                </div>
                <div>
                  <p className="text-blue-700 mb-1">Policy Enforcement</p>
                  <p className="font-medium text-blue-900">{recoveryCase.policyDecision || 'Pending'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-blue-700 mb-1">Reasoning</p>
                  <p className="text-blue-900">{recoveryCase.agentReason || recoveryCase.policyReason || 'No reasoning available.'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium border-b pb-4 mb-4">Audit Trail</h2>
            <AuditTimeline events={audit} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium border-b pb-4 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-green-500 w-5 h-5" /> Risk Assessment
            </h2>
            {risk ? (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Risk Score</span>
                    <span className="font-medium">{risk.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${risk.score > 70 ? 'bg-red-500' : risk.score > 30 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, Math.max(0, risk.score))}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-y border-gray-50">
                  <span className="text-gray-500">Risk Level</span>
                  <StatusBadge status={risk.riskLevel} />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">Recovery Prob.</span>
                  <span className="font-medium">{formatPercent(risk.estimatedRecoveryProbability * 100)}</span>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Primary Reason</p>
                  <p className="text-gray-900">{risk.primaryReason}</p>
                </div>
                {risk.atRisk && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md flex gap-2 items-start text-xs mt-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Transaction flagged as high risk for permanent failure.</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No risk score available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
