import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { handleError } from '@lib';
import { userService } from '../services';
import type { Role } from '@features/auth/types';
import type { CreateUserDto } from '../types';

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  roles: () => [...userKeys.all, 'roles'] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => userService.getAll().then((r) => r.data.data),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: userKeys.roles(),
    queryFn: () => userService.getRoles().then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.list() });
      message.success('เพิ่มผู้ใช้งานสำเร็จ');
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
      qc.invalidateQueries({ queryKey: userKeys.list() });
      qc.setQueryData(userKeys.detail(updated.id), updated);
      message.success('เปลี่ยนบทบาทสำเร็จ');
    },
    onError: handleError('เปลี่ยนบทบาท'),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.list() });
      message.success('ลบผู้ใช้งานสำเร็จ');
    },
    onError: handleError('ลบผู้ใช้งาน'),
  });
}
