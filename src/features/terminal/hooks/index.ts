import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { handleError } from '@lib';
import { terminalService } from '../services';
import type { CreateTerminalDto, UpdateTerminalDto } from '../types';

export const terminalKeys = {
  all: ['terminals'] as const,
  list: () => [...terminalKeys.all, 'list'] as const,
  detail: (id: string) => [...terminalKeys.all, 'detail', id] as const,
};

export function useTerminals() {
  return useQuery({
    queryKey: terminalKeys.list(),
    queryFn: () => terminalService.getAll().then((r) => r.data.data),
  });
}

export function useCreateTerminal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTerminalDto) =>
      terminalService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: terminalKeys.list() });
      message.success('เพิ่ม Terminal สำเร็จ');
    },
    onError: handleError('เพิ่ม Terminal'),
  });
}

export function useUpdateTerminal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTerminalDto }) =>
      terminalService.update(id, data).then((r) => r.data.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: terminalKeys.list() });
      qc.setQueryData(terminalKeys.detail(updated.id), updated);
      message.success('แก้ไข Terminal สำเร็จ');
    },
    onError: handleError('แก้ไข Terminal'),
  });
}

export function useDeleteTerminal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => terminalService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: terminalKeys.list() });
      message.success('ลบ Terminal สำเร็จ');
    },
    onError: handleError('ลบ Terminal'),
  });
}
