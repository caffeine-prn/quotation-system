import { UserRole, Permission, ROLE_PERMISSIONS } from '../types/auth';

export const hasPermission = (
  role: UserRole,
  action: Permission['action'],
  resource: Permission['resource']
): boolean => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.some(
    (permission) =>
      permission.action === action && permission.resource === resource
  );
};

export const can = {
  create: (role: UserRole, resource: Permission['resource']): boolean =>
    hasPermission(role, 'create', resource),
  read: (role: UserRole, resource: Permission['resource']): boolean =>
    hasPermission(role, 'read', resource),
  update: (role: UserRole, resource: Permission['resource']): boolean =>
    hasPermission(role, 'update', resource),
  delete: (role: UserRole, resource: Permission['resource']): boolean =>
    hasPermission(role, 'delete', resource),
};