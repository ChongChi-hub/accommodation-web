import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HttpDlqRepository } from '@/infrastructure/repositories/http-dlq.repository';
import { toast } from '@/presentation/stores/toast.store';

const dlqRepo = new HttpDlqRepository();

export function useDlqManagement() {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ['admin', 'dlq', 'messages'],
    queryFn: () => dlqRepo.listAll(),
    refetchInterval: 10000,
  });

  const metricsQuery = useQuery({
    queryKey: ['admin', 'dlq', 'metrics'],
    queryFn: () => dlqRepo.getMetrics(),
    refetchInterval: 10000,
  });

  const replayMutation = useMutation({
    mutationFn: (id: string) => dlqRepo.replay(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dlq'] });
      toast.success(`Đã xếp hàng phát lại sự kiện ${data.eventType}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Không thể phát lại sự kiện DLQ');
    },
  });

  const discardMutation = useMutation({
    mutationFn: (id: string) => dlqRepo.discard(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dlq'] });
      toast.info(`Đã loại bỏ sự kiện ${data.eventType}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Không thể loại bỏ sự kiện DLQ');
    },
  });

  return {
    messages: messagesQuery.data || [],
    metrics: metricsQuery.data || { total: 0, pendingReplay: 0, replayed: 0, discarded: 0 },
    isLoading: messagesQuery.isLoading || metricsQuery.isLoading,
    isRefetching: messagesQuery.isRefetching,
    refetch: () => {
      messagesQuery.refetch();
      metricsQuery.refetch();
    },
    replay: replayMutation.mutate,
    isReplaying: replayMutation.isPending,
    discard: discardMutation.mutate,
    isDiscarding: discardMutation.isPending,
  };
}
