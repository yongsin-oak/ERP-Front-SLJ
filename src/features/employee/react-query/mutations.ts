import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, notify } from '@shared';
import { employeeService } from './services';
import { employeeKeys } from './queryKeys';
import type { CreateEmployeeDto, UpdateEmployeeDto } from '../types';

export function useBulkCreateEmployees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dtos: CreateEmployeeDto[]) =>
      employeeService.bulkCreate(dtos).then((r) => r.data.data),
    onSuccess: (employees) => {
      qc.invalidateQueries({ queryKey: employeeKeys.lists() });
      qc.invalidateQueries({ queryKey: [...employeeKeys.all, 'all'] });
      notify.success('นำเข้าพนักงานสำเร็จ', `${employees.length} คนถูกเพิ่มเข้าระบบ`);
    },
    onError: handleError('นำเข้าพนักงาน'),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeDto) =>
      employeeService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeeKeys.lists() });
      qc.invalidateQueries({ queryKey: [...employeeKeys.all, 'all'] });
      notify.success('เพิ่มพนักงานสำเร็จ');
    },
    onError: handleError('เพิ่มพนักงาน'),
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
      notify.success('แก้ไขข้อมูลพนักงานสำเร็จ');
    },
    onError: handleError('แก้ไขข้อมูลพนักงาน'),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeeKeys.lists() });
      qc.invalidateQueries({ queryKey: [...employeeKeys.all, 'all'] });
      notify.success('ลบพนักงานสำเร็จ');
    },
    onError: handleError('ลบพนักงาน'),
  });
}

export function useSetEmployeePin() {
  return useMutation({
    mutationFn: ({ id, pin }: { id: string; pin: string }) =>
      employeeService.setPin(id, pin),
    onSuccess: () => {
      notify.success('ตั้ง PIN สำเร็จ');
    },
    onError: handleError('ตั้ง PIN'),
  });
}

export function useBulkDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => employeeService.delete(id))),
    onSuccess: (_, ids) => {
      qc.invalidateQueries({ queryKey: employeeKeys.lists() });
      qc.invalidateQueries({ queryKey: [...employeeKeys.all, 'all'] });
      notify.success('ลบพนักงานสำเร็จ', `${ids.length} รายการถูกลบออกจากระบบ`);
    },
    onError: handleError('ลบพนักงาน'),
  });
}
