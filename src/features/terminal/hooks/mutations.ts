import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { handleError } from '@lib';
import { terminalService } from '../services';
import { terminalKeys } from './queryKeys';
import type { CreateTerminalDto, UpdateTerminalDto } from '../types';

export function useCreateTerminal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTerminalDto) =>
      terminalService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: terminalKeys.lists() });
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
      qc.invalidateQueries({ queryKey: terminalKeys.lists() });
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
      qc.invalidateQueries({ queryKey: terminalKeys.lists() });
      message.success('ลบ Terminal สำเร็จ');
    },
    onError: handleError('ลบ Terminal'),
  });
}
