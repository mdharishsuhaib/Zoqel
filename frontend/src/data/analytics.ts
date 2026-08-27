export const REAL_ML_METRICS = {
  precision: 73.64,
  recall: 90.70,
  f1: 81.29,
  aucRoc: 87.61,
  falsePositiveRate: 22.44,
  falseNegativeRate: 9.30,
  testSamples: 1500,
  trainSamples: 7000,
  valSamples: 1500,
};

export const REAL_BUSINESS_METRICS = {
  testSamples: 1500,
  revenueAtRiskPaise: 140172450,
  trulyRecoverablePaise: 60164550,
  revenueRecoveredPaise: 53971420,
  revenueMissedPaise: 6193130,
  falselyIntervenedPaise: 17179350,
  recoveryRate: 89.7,
  truePositives: 556,
  falsePositives: 199,
  falseNegatives: 57,
  trueNegatives: 688,
};

export const RECOVERY_OUTCOMES_DATA = [
  { name: 'Recovered (TP)', value: 556, color: '#12B76A' },
  { name: 'Missed (FN)', value: 57, color: '#F04438' },
  { name: 'False Positive', value: 199, color: '#F79009' },
  { name: 'Correctly Skipped', value: 688, color: '#E4E7EC' },
];

export const FAILURE_REASON_DATA = [
  { reason: 'Checkout Abandoned', count: 3200, rate: 85 },
  { reason: 'Bank Timeout', count: 2800, rate: 80 },
  { reason: 'Network Error', count: 2200, rate: 75 },
  { reason: 'Overdue Receivable', count: 2100, rate: 45 },
  { reason: 'Subscription Failed', count: 1800, rate: 60 },
  { reason: 'Insufficient Funds', count: 2000, rate: 5 },
  { reason: 'Expired Card', count: 1300, rate: 10 },
  { reason: 'Repeated Failure', count: 1000, rate: 15 },
  { reason: 'Unknown', count: 400, rate: 30 },
  { reason: 'Duplicate Attempt', count: 300, rate: 0 },
];
