import { create } from 'zustand';
import type { SimulatorStep } from '../types';

type Scenario = 'success' | 'blocked';
type Status = 'idle' | 'running' | 'complete';

interface SimulatorState {
  scenario: Scenario;
  status: Status;
  steps: SimulatorStep[];
  result: { success: boolean; message: string; amountPaise?: number } | null;
  setScenario: (s: Scenario) => void;
  start: () => void;
  reset: () => void;
}

const SUCCESS_STEPS: Omit<SimulatorStep, 'status'>[] = [
  { id: 'detect', label: 'Detecting', detail: 'Payment failure detected — TXN-91823 — INR 4,999 via UPI', durationMs: 600 },
  { id: 'analyze', label: 'Analyzing', detail: 'Retrieving transaction context and customer history (8 previous payments, 0 failures)', durationMs: 700 },
  { id: 'predict', label: 'Predicting', detail: 'ML model: Recovery probability 87% — BANK_TIMEOUT with excellent payment history', durationMs: 800 },
  { id: 'decide', label: 'Deciding', detail: 'AI Agent recommendation: RETRY with 87% confidence', durationMs: 500 },
  { id: 'policy', label: 'Policy Check', detail: 'Policy engine: 4/4 checks passed — Amount OK, Retries OK, Confidence OK, Failure type OK', durationMs: 500 },
  { id: 'execute', label: 'Executing', detail: 'Retry attempt #1 initiated via payment simulator (seed: 42819)', durationMs: 900 },
  { id: 'verify', label: 'Verifying', detail: 'Payment simulator: SUCCESS — payment confirmed', durationMs: 500 },
];

const BLOCKED_STEPS: Omit<SimulatorStep, 'status'>[] = [
  { id: 'detect', label: 'Detecting', detail: 'Payment failure detected — TXN-82193 — INR 27,500 via NetBanking', durationMs: 600 },
  { id: 'analyze', label: 'Analyzing', detail: 'Retrieving context — 3 previous failures, HIGH risk customer, REPEATED_FAILURE pattern', durationMs: 700 },
  { id: 'predict', label: 'Predicting', detail: 'ML model: Recovery probability 42% — REPEATED_FAILURE, low success rate', durationMs: 800 },
  { id: 'decide', label: 'Deciding', detail: 'AI Agent recommendation: ESCALATE — low confidence, human judgment required', durationMs: 500 },
  { id: 'policy', label: 'Policy Check', detail: 'Policy engine: BLOCKED — Amount INR 27,500 > INR 10,000 limit + Repeated failures require human review', durationMs: 500 },
];

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  scenario: 'success',
  status: 'idle',
  steps: [],
  result: null,
  setScenario: (scenario) => set({ scenario }),
  reset: () => set({ status: 'idle', steps: [], result: null }),
  start: () => {
    if (get().status === 'running') return;
    
    const { scenario } = get();
    const base = scenario === 'success' ? SUCCESS_STEPS : BLOCKED_STEPS;
    const steps: SimulatorStep[] = base.map(s => ({ ...s, status: 'pending' }));
    set({ status: 'running', steps, result: null });

    function runStep(index: number) {
      if (index >= steps.length) {
        const success = scenario === 'success';
        set({
          status: 'complete',
          result: success
            ? { success: true, amountPaise: 499900, message: 'INR 4,999 recovered in 4.1s' }
            : { success: false, message: 'Escalated to human review — no automatic action taken' },
        });
        return;
      }
      set(s => ({ steps: s.steps.map((st, i) => i === index ? { ...st, status: 'active' } : st) }));
      setTimeout(() => {
        set(s => ({ steps: s.steps.map((st, i) => i === index ? { ...st, status: 'complete' } : st) }));
        runStep(index + 1);
      }, base[index].durationMs);
    }
    runStep(0);
  },
}));
