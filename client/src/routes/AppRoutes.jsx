import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import Login from '../auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../admin/AdminDashboard';
import ManageHostels from '../admin/ManageHostels';
import ManageRooms from '../admin/ManageRooms';
import RoomRequests from '../admin/RoomRequests';
import ManageStudents from '../admin/ManageStudents';
import StudentDashboard from '../student/StudentDashboard';
import RequestRoom from '../pages/student/RequestRoom';
import RequestRoomChange from '../student/RequestRoomChange';

const AppRoutes = () => {
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

  // Listen for localStorage changes (e.g., after login)
  useEffect(() => {
    const checkAuth = () => {
      const currentToken = localStorage.getItem('token');
      const currentRole = localStorage.getItem('userRole');
      setToken(currentToken);
      setUserRole(currentRole);
    };

    // Check auth on location change (which happens after navigation)
    checkAuth();

    // Also listen for storage events from other tabs
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location]);

  // Protected Route Component
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole && userRole !== requiredRole) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  // Public Route Component (always show login page first)
  const PublicRoute = ({ children }) => {
    // Always show public routes (login/register) regardless of token
    // User can choose where to go from the login page
    return children;
  };

  return (
    <Routes>
      {/* Default Route - Direct to Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Direct Access Routes for Testing */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Admin Routes - Direct Access (No Auth Required) */}
      <Route path="/admin/dashboard" element={
        <AdminLayout title="Dashboard">
          <AdminDashboard />
        </AdminLayout>
      } />
      
      <Route path="/admin/hostels" element={
        <AdminLayout title="Manage Hostels">
          <ManageHostels />
        </AdminLayout>
      } />
      
      <Route path="/admin/rooms" element={
        <AdminLayout title="Manage Rooms">
          <ManageRooms />
        </AdminLayout>
      } />
      
      <Route path="/admin/room-requests" element={
        <AdminLayout title="Room Requests">
          <RoomRequests />
        </AdminLayout>
      } />
      
      <Route path="/admin/students" element={
        <AdminLayout title="Manage Students">
          <ManageStudents />
        </AdminLayout>
      } />
      
      {/* Student Routes - Direct Access (No Auth Required) */}
      <Route path="/student/dashboard" element={
        <Layout>
          <StudentDashboard />
        </Layout>
      } />
      
      <Route path="/student/request-room" element={
        <Layout>
          <RequestRoom />
        </Layout>
      } />

      <Route path="/student/request-room-change" element={
        <Layout>
          <RequestRoomChange />
        </Layout>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;