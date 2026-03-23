import { useAuthStore } from '../store/authStore';

export function usePermission(module: string) {
  const hasPermission = useAuthStore(state => state.hasPermission);

  return {
    canView:   hasPermission(module, 'view'),
    canCreate: hasPermission(module, 'create'),
    canEdit:   hasPermission(module, 'edit'),
    canDelete: hasPermission(module, 'delete'),
  };
}
