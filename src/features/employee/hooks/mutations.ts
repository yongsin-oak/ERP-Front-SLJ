import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { employeeService } from '../services';
import { employeeKeys } from './queryKeys';
import type { CreateEmployeeDto, UpdateEmployeeDto } from '../types';

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeDto) =>
      employeeService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeeKeys.lists() });
      qc.invalidateQueries({ queryKey: [...employeeKeys.all, 'all'] });
      message.success('เพิ่มพนักงานสำเร็จ');
    },
    onError: () => message.error('เพิ่มพนักงานไม่สำเร็จ'),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeDto }) =>
      employeeService.update(id, data).then((r) => r.data.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: employeeKeys.lists() });
      qc.invalidateQueries({ queryKey: [...employeeKeys.all, 'all'] });
      qc.setQueryData(employeeKeys.detail(updated.id), updated);
      message.success('แก้ไขข้อมูลสำเร็จ');
    },
    onError: () => message.error('แก้ไขข้อมูลไม่สำเร็จ'),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeeKeys.lists() });
      qc.invalidateQueries({ queryKey: [...employeeKeys.all, 'all'] });
      message.success('ลบพนักงานสำเร็จ');
    },
    onError: () => message.error('ลบพนักงานไม่สำเร็จ'),
  });
}
