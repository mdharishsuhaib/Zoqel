import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCode2, Terminal, Shield, Zap, Code } from 'lucide-react';

export function DocsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <button onClick={() => navigate(-1)} className="mb-8 text-[#475467] font-semibold hover:text-[#101828] transition-colors flex items-center gap-2">
        <ArrowLeft size={18} /> Back
      </button>
      
      <div className="max-w-5xl mx-auto bg-white p-8 md:p-16 rounded-2xl border border-[#E4E7EC] shadow-sm">
        <div className="flex items-center gap-4 mb-8 border-b border-[#E4E7EC] pb-8">
          <div className="w-16 h-16 bg-[#F0F6FF] text-[#2B84EA] rounded-2xl flex items-center justify-center">
            <FileCode2 size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-[#101828]">Zoqel Documentation</h1>
            <p className="text-lg text-[#667085] mt-2">The complete guide to integrating the Autonomous Revenue Recovery agent.</p>
          </div>
        </div>

        <div className="prose prose-blue max-w-none text-[#475467]">
          
          <h2 className="text-2xl font-bold text-[#101828] mt-10 mb-4 flex items-center gap-2">
            <Zap className="text-[#2B84EA]" /> Introduction
          </h2>
          <p className="mb-4">
            Welcome to the Zoqel developer documentation. Zoqel is an autonomous intelligence layer designed to automatically recover lost revenue from failed payments. Unlike traditional systems that rely on static "Dunning" retry rules (e.g., retrying on day 3, 5, and 7), Zoqel uses a live AI Engine to predict the exact right time, channel, and method to recover a payment based on historical success metrics.
          </p>

          <h2 className="text-2xl font-bold text-[#101828] mt-10 mb-4 flex items-center gap-2">
            <Terminal className="text-[#2B84EA]" /> Getting Started
          </h2>
          <p className="mb-4">
            Zoqel integrates directly with your existing payment gateway (like Razorpay) via Webhooks. You do not need to change your frontend checkout code.
          </p>
          <div className="bg-[#111827] text-[#E5E7EB] p-6 rounded-xl font-mono text-sm mb-6 shadow-inner">
            <div className="text-[#9CA3AF] mb-2">// 1. For local testing, route your Razorpay Webhook to your local backend (via ngrok/localtunnel):</div>
            <div><span className="text-[#8B5CF6]">POST</span> http://localhost:8080/api/v1/webhooks/razorpay</div>
            <br />
            <div className="text-[#9CA3AF] mb-2">// 2. Subscribe to the following events in your Razorpay Sandbox:</div>
            <ul className="list-disc pl-5 text-[#6CE9A6]">
              <li>payment.failed</li>
              <li>subscription.charged.failed</li>
            </ul>
          </div>
          
          <h2 className="text-2xl font-bold text-[#101828] mt-10 mb-4 flex items-center gap-2">
            <Code className="text-[#2B84EA]" /> The Core Loop
          </h2>
          <p className="mb-4">
            Every transaction routed to Zoqel goes through our four-stage intelligence pipeline:
          </p>
          <ul className="space-y-4 mb-8 list-none pl-0">
            <li className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E4E7EC]">
              <strong className="text-[#101828]">Detect:</strong> Zoqel listens for failure events (e.g., <code>INSUFFICIENT_FUNDS</code>, <code>NETWORK_ERROR</code>) and instantly captures the transaction context.
            </li>
            <li className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E4E7EC]">
              <strong className="text-[#101828]">Diagnose:</strong> The Machine Learning engine calculates the statistical probability of recovery based on customer risk tier, transaction amount, and gateway failure reasons.
            </li>
            <li className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E4E7EC]">
              <strong className="text-[#101828]">Decide:</strong> The AI Agent selects the optimal intervention—whether it's a silent backend retry, an email reminder, or an escalation to a human agent.
            </li>
            <li className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E4E7EC]">
              <strong className="text-[#101828]">Recover:</strong> The action is executed via your gateway APIs, and the result is logged immutably in the Audit Trail.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-[#101828] mt-10 mb-4 flex items-center gap-2">
            <Shield className="text-[#2B84EA]" /> Policy Guardrails
          </h2>
          <p className="mb-4">
            Autonomy requires safety. Zoqel includes a strict Policy Engine that evaluates every AI decision before it is executed. If a decision violates a rule (e.g., "Amount exceeds INR 10,000 auto-limit" or "Repeated failure pattern"), the action is blocked and flagged in the Human Review queue.
          </p>
          
        </div>
      </div>
    </div>
  );
}
