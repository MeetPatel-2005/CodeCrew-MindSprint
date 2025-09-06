// Utility function to navigate users to their role-specific dashboard
export const navigateToRoleDashboard = (navigate, userRole) => {
  if (userRole === 'donor') {
    navigate('/donor-dashboard')
  } else if (userRole === 'patient') {
    navigate('/patient-dashboard')
  } else {
    // Fallback to home page if role is not recognized
    navigate('/')
  }
}

// Utility function to get the correct dashboard path based on role
export const getDashboardPath = (userRole) => {
  if (userRole === 'donor') {
    return '/donor-dashboard'
  } else if (userRole === 'patient') {
    return '/patient-dashboard'
  } else {
    return '/'
  }
}
