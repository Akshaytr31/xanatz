export const getMemberPermissions = (company, currentUser) => {
  if (!company || !currentUser) {
    return {
      role: null,
      isOwner: false,
      canManageRoles: false,
      canAssignSuperAdmin: false,
      canManageProfile: false,
      canAccessHR: false,
      canAccessAccounting: false,
      canManageRFPs: false,
    };
  }

  const isOwner = company.creator === currentUser.id;
  const memberDetail = company.members_details?.find((m) => m.id === currentUser.id);
  const memberRole = isOwner ? 'super_admin' : (memberDetail?.access_role || 'user');

  const backendPerms = company.user_permissions || {};

  const canManageRoles = isOwner || ['super_admin', 'admin'].includes(memberRole) || !!backendPerms.can_manage_roles;
  const canAssignSuperAdmin = isOwner || memberRole === 'super_admin' || !!backendPerms.can_assign_super_admin;
  const canManageProfile = isOwner || ['super_admin', 'admin'].includes(memberRole) || !!backendPerms.can_manage_profile;
  const canAccessHR = isOwner || ['super_admin', 'admin', 'hr'].includes(memberRole) || !!backendPerms.can_manage_hr;
  const canAccessAccounting = isOwner || ['super_admin', 'admin', 'accountant'].includes(memberRole) || !!backendPerms.can_manage_accounting;
  const canManageRFPs = isOwner || ['super_admin', 'admin'].includes(memberRole) || !!backendPerms.can_manage_rfp;

  return {
    role: memberRole,
    isOwner,
    canManageRoles,
    canAssignSuperAdmin,
    canManageProfile,
    canAccessHR,
    canAccessAccounting,
    canManageRFPs,
  };
};
