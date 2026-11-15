export interface DeadLetterMessage {
  id: string;
  eventId: string;
  eventType: string;
  schemaVersion: number;
  aggregateType: string;
  aggregateId: string;
  sourceService: string;
  payloadJson: string;
  failureReason: string;
  retryCount: number;
  status: 'PENDING_REPLAY' | 'REPLAYED' | 'DISCARDED';
  replayedBy?: string | null;
  replayedAt?: string | null;
  createdAt: string;
}

export interface DlqMetrics {
  total: number;
  pendingReplay: number;
  replayed: number;
  discarded: number;
}
