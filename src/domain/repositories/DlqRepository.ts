import { DeadLetterMessage, DlqMetrics } from '../entities/DeadLetterMessage';

export interface DlqRepository {
  listAll(): Promise<DeadLetterMessage[]>;
  getMetrics(): Promise<DlqMetrics>;
  replay(id: string): Promise<DeadLetterMessage>;
  discard(id: string): Promise<DeadLetterMessage>;
}
