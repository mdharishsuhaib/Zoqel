import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Server } from 'lucide-react';

export function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <button onClick={() => navigate(-1)} className="mb-8 text-[#475467] font-semibold hover:text-[#101828] transition-colors flex items-center gap-2">
        <ArrowLeft size={18} /> Back
      </button>
      
      <div className="max-w-5xl mx-auto bg-white p-8 md:p-16 rounded-2xl border border-[#E4E7EC] shadow-sm">
        <div className="flex items-center gap-4 mb-8 border-b border-[#E4E7EC] pb-8">
          <div className="w-16 h-16 bg-[#F0F6FF] text-[#2B84EA] rounded-2xl flex items-center justify-center">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-[#101828]">Privacy & Data Security Policy</h1>
            <p className="text-lg text-[#667085] mt-2">How Zoqel protects your data and ensures compliance.</p>
          </div>
        </div>

        <div className="prose prose-blue max-w-none text-[#475467]">
          
          <p className="mb-8 font-semibold text-[#101828]">
            Effective Date: August 2026
          </p>

          <p className="mb-8">
            At Zoqel, trust is our most important metric. As an AI-powered revenue recovery platform handling payment signals, we operate under strict data minimization principles. This policy explains how we collect, use, and protect the data processed by our intelligence engine.
          </p>

          <h2 className="text-2xl font-bold text-[#101828] mt-10 mb-4 flex items-center gap-2">
            <EyeOff className="text-[#2B84EA]" /> Data We Do Not Collect
          </h2>
          <p className="mb-4">
            Zoqel acts as an intelligence layer on top of your existing payment gateway (like Razorpay). <strong>We never collect, store, or process raw Primary Account Numbers (PANs), full credit card details, or sensitive authentication data (CVV).</strong>
          </p>
          <p className="mb-6">
            All AI decisions are made using tokenized identifiers and metadata. Your customers' sensitive financial data remains securely within your PCI-DSS compliant payment gateway.
          </p>

          <h2 className="text-2xl font-bold text-[#101828] mt-10 mb-4 flex items-center gap-2">
            <Server className="text-[#2B84EA]" /> Information We Process
          </h2>
          <p className="mb-4">
            To provide autonomous recovery services, we process the following metadata via webhook events:
          </p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Transaction Metadata:</strong> Amount, currency, timestamp, and gateway-provided failure reasons (e.g., <code>INSUFFICIENT_FUNDS</code>).</li>
            <li><strong>Risk Signals:</strong> Device telemetry, network reliability scores, and historical recovery success rates.</li>
            <li><strong>Customer Identifiers:</strong> Anonymized customer IDs, encrypted email addresses (for automated recovery notifications), and aggregate Lifetime Value (LTV) categorizations.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#101828] mt-10 mb-4 flex items-center gap-2">
            <Lock className="text-[#2B84EA]" /> How We Use the Data
          </h2>
          <p className="mb-4">
            The data we process is used strictly for the following purposes:
          </p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Real-time Inference:</strong> Feeding contextual data into the Zoqel AI Agent to determine the statistically optimal recovery action.</li>
            <li><strong>Model Training:</strong> We use aggregated, de-identified outcomes (e.g., "Retry strategy X was successful for failure type Y") to continuously improve the intelligence engine. Client data is strictly isolated; your customer data is never used to train models for other tenants.</li>
            <li><strong>Audit Logging:</strong> Maintaining an immutable cryptographic ledger of every AI decision for your compliance and oversight.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#101828] mt-10 mb-4 flex items-center gap-2">
            <ShieldCheck className="text-[#2B84EA]" /> Security & Compliance
          </h2>
          <p className="mb-4">
            Zoqel infrastructure is built on enterprise-grade security protocols. All data in transit is encrypted via TLS 1.3, and data at rest is encrypted using AES-256. Access to the Zoqel Control Plane is protected by strict Role-Based Access Control (RBAC) and Multi-Factor Authentication (MFA).
          </p>

          <div className="bg-[#F0F6FF] border border-[#B2DDFF] p-6 rounded-xl mt-10">
            <h3 className="text-lg font-bold text-[#101828] mb-2">Buildathon Notice</h3>
            <p className="text-sm text-[#2B84EA]">
              This privacy policy is a demonstrative asset created for the Razorpay Buildathon (Track 03: AI Revenue Recovery). The Zoqel platform showcased here uses entirely synthetic, mock data for its demonstrations and AI inferences.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
