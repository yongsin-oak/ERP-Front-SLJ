import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { handleError } from '@lib';
import { shopService } from '../services';
import type { CreateShopDto, UpdateShopDto } from '../types';

const shopKeys = {
  all: ['shops'] as const,
  lists: () => [...shopKeys.all, 'list'] as const,
  list: (params: object) => [...shopKeys.lists(), params] as const,
  detail: (id: string) => [...shopKeys.all, 'detail', id] as const,
};

export function useShops() {
  return useQuery({
    queryKey: [...shopKeys.all, 'all'],
    queryFn: () => shopService.getAll({ page: 1, limit: 100 }).then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  });
}

export function useShopList(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: shopKeys.list(params),
    queryFn: () => shopService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useCreateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShopDto) => shopService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopKeys.all });
      message.success('เพิ่มร้านค้าสำเร็จ');
    },
    onError: handleError('เพิ่มร้านค้า'),
  });
}

export function useUpdateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShopDto }) =>
      shopService.update(id, data).then((r) => r.data.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: shopKeys.lists() });
      qc.invalidateQueries({ queryKey: [...shopKeys.all, 'all'] });
      qc.setQueryData(shopKeys.detail(updated.id), updated);
      message.success('แก้ไขร้านค้าสำเร็จ');
    },
    onError: handleError('แก้ไขร้านค้า'),
  });
}

export function useDeleteShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shopService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopKeys.all });
      message.success('ลบร้านค้าสำเร็จ');
    },
    onError: handleError('ลบร้านค้า'),
  });
}

export function useBulkDeleteShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => shopService.delete(id))),
    onSuccess: (_, ids) => {
      qc.invalidateQueries({ queryKey: shopKeys.all });
      message.success(`ลบ ${ids.length} ร้านค้าสำเร็จ`);
    },
    onError: handleError('ลบร้านค้า'),
  });
}
