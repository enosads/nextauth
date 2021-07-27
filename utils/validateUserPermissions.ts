type ValidateUserPermissionsParams = {
  user: User,
  permissions?: string[],
  roles?: string[]
}

type User = Omit<ValidateUserPermissionsParams, 'user'>;

export function validateUserPermissions (
  params: ValidateUserPermissionsParams): boolean {
  const {permissions, user, roles} = params;
  if (permissions?.length > 0) {
    const hasAllPermissions = permissions.every(
      permission => user.permissions.includes(permission)
    );
    if (!hasAllPermissions) {
      return false;
    }
  }

  if (roles?.length > 0) {
    const hasAllRoles = roles.some(
      permission => user.roles.includes(permission)
    );
    if (!hasAllRoles) {
      return false;
    }
  }
  return true;
}