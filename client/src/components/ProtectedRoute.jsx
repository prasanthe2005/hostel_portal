import { Navigate, useLocation } from 'react-router-dom';
import tabSession from '../utils/tabSession';

/**
 * ProtectedRoute component to handle authentication and authorization
 * Protects routes that require authentication and specific roles
 * Uses tab-isolated sessionStorage to support multiple users in different tabs
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  
  // Check if user has a token (tab-specific)
  const token = tabSession.getToken();
  const userRole = tabSession.getUserRole();
  
  // If no token, redirect to login
  if (!token) {
    console.log('ProtectedRoute: No token found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If role is required and doesn't match, redirect to appropriate dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log('ProtectedRoute: Role mismatch. User role:', userRole, 'Allowed:', allowedRoles);
    
    // Redirect to appropriate dashboard based on user's role
    switch (userRole) {
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'caretaker':
        return <Navigate to="/caretaker/dashboard" replace />;
      case 'warden':
        return <Navigate to="/warden/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  // User is authenticated and authorized, render the protected component
  return children;
}
