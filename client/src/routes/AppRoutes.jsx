import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../admin/AdminDashboard';
import ManageHostels from '../admin/ManageHostels';
import ManageRooms from '../admin/ManageRooms';
import RoomRequests from '../admin/RoomRequests';
import ManageStudents from '../admin/ManageStudents';
import ManageCaretakers from '../admin/ManageCaretakers';
import StudentDashboard from '../student/StudentDashboard';
import RequestRoom from '../pages/student/RequestRoom';
import RequestRoomChange from '../student/RequestRoomChange';
import SubmitComplaint from '../pages/student/SubmitComplaint';
import MyComplaints from '../pages/student/MyComplaints';
import HelpSupport from '../pages/student/HelpSupport';
import HostelRules from '../pages/student/HostelRules';
import CaretakerDashboard from '../caretaker/CaretakerDashboard';

const AppRoutes = () => {
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

      {/* Caretaker Routes */}
      <Route path="/caretaker/dashboard" element={
        <ProtectedRoute allowedRoles={['caretaker']}>
          <CaretakerDashboard />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Dashboard">
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/hostels" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Manage Hostels">
            <ManageHostels />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/rooms" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Manage Rooms">
            <ManageRooms />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/room-requests" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Room Requests">
            <RoomRequests />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/students" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Manage Students">
            <ManageStudents />
          </AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/caretakers" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Manage Caretakers">
            <ManageCaretakers />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      {/* Student Routes */}
      <Route path="/student/dashboard" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/student/request-room" element={
        <ProtectedRoute allowedRoles={['student']}>
          <RequestRoom />
        </ProtectedRoute>
      } />
      
      <Route path="/student/submit-complaint" element={
        <ProtectedRoute allowedRoles={['student']}>
          <SubmitComplaint />
        </ProtectedRoute>
      } />

      <Route path="/student/complaints" element={
        <ProtectedRoute allowedRoles={['student']}>
          <MyComplaints />
        </ProtectedRoute>
      } />

      <Route path="/student/request-room-change" element={
        <ProtectedRoute allowedRoles={['student']}>
          <RequestRoomChange />
        </ProtectedRoute>
      } />

      <Route path="/student/help" element={
        <ProtectedRoute allowedRoles={['student']}>
          <HelpSupport />
        </ProtectedRoute>
      } />

      <Route path="/student/rules" element={
        <ProtectedRoute allowedRoles={['student']}>
          <HostelRules />
        </ProtectedRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;