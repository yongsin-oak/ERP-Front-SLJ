import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, notify } from '@shared';
import { userService } from './services';
import { userKeys } from './queryKeys';
import type { Role } from '@features/auth/types';
import type { CreateUserDto } from '../types';

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      notify.success('เพิ่มผู้ใช้งานสำเร็จ');
    },
    onError: handleError('เพิ่มผู้ใช้งาน'),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      userService.updateRole(id, { role }).then((r) => r.data.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      qc.setQueryData(userKeys.detail(updated.id), updated);
      notify.success('เปลี่ยนบทบาทสำเร็จ');
    },
    onError: handleError('เปลี่ยนบทบาท'),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      notify.success('ลบผู้ใช้งานสำเร็จ');
    },
    onError: handleError('ลบผู้ใช้งาน'),
  });
}
