import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../../store';
import { Permission } from '../../types/auth';
import { hasPermission } from '../../utils/permissions';

interface WithPermissionProps {
  action: Permission['action'];
  resource: Permission['resource'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const WithPermission: React.FC<WithPermissionProps> = ({
  action,
  resource,
  children,
  fallback = null,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!hasPermission(user.role, action, resource)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default WithPermission;