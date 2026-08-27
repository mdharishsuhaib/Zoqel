export function formatRupeesSymbol(paise: number): string {
  const rupees = paise / 100;
  return `\u20b9${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatLakhsSymbol(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 1_00_00_000) return `\u20b9${(rupees / 1_00_00_000).toFixed(2)}Cr`;
  if (rupees >= 1_00_000) return `\u20b9${(rupees / 1_00_000).toFixed(2)}L`;
  if (rupees >= 1_000) return `\u20b9${(rupees / 1_000).toFixed(1)}K`;
  return formatRupeesSymbol(paise);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function formatTimeAgo(isoString: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getRiskLabel(score: number): string {
  if (score >= 85) return 'Very High';
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export function getRiskColor(score: number): string {
  if (score >= 85) return '#F04438';
  if (score >= 70) return '#F79009';
  if (score >= 40) return '#F79009';
  return '#12B76A';
}

export function getFailureReasonLabel(reason: string): string {
  const map: Record<string, string> = {
    BANK_TIMEOUT: 'Bank Timeout',
    NETWORK_ERROR: 'Network Error',
    INSUFFICIENT_FUNDS: 'Insufficient Funds',
    EXPIRED_CARD: 'Expired Card',
    DUPLICATE_ATTEMPT: 'Duplicate Attempt',
    REPEATED_FAILURE: 'Repeated Failure',
    CHECKOUT_ABANDONED: 'Checkout Abandoned',
    OVERDUE_RECEIVABLE: 'Overdue Receivable',
    SUBSCRIPTION_FAILED: 'Subscription Failed',
    UNKNOWN: 'Unknown',
  };
  return map[reason] ?? reason;
}

export function formatTxnId(id: string): string {
  if (!id) return '';
  if (id.startsWith('TXN-')) return id;
  // Convert UUID like '64be8fc7-...' into 'TXN-64BE8FC7'
  return `TXN-${id.split('-')[0].toUpperCase()}`;
}
