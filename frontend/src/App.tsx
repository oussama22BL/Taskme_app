import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Toast from './components/common/Toast';
import { useToast } from './hooks/useToast';

// Pages d'authentification
import Login from './pages/auth/Login';


// Pages Super Admin
import AccountManager from './pages/superAdmin/AccountManager';
import SuperAdminTasks from './pages/superAdmin/superAdminsTasks';
import SuperAdminDashboard from './pages/superAdmin/dashboard';

// Pages Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminTasks from './pages/admin/Tasks';
import AdminVehicles from './pages/admin/Vehicles';
import AdminHistory from './pages/admin/History';
import UserNotifications from './pages/user/Notification';

// Pages Utilisateur
import UserDashboard from './pages/user/Dashboard';
import UserMissions from './pages/user/Missions';
import UserHistory from './pages/user/History';


// Layouts
import AdminLayout from './components/layouts/AdminLayout';
import UserLayout from './components/layouts/UserLayout';
import AdminAssignments from './pages/admin/AdminAssignments';
import Profile from './pages/user/Profile';

const AppContent: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Routes>
       
        <Route path="/login" element={<Login />} />
        

     
        <Route path="/super-admin" element={<ProtectedRoute role="superAdmin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="accounts" element={<AccountManager />} />
          <Route path="assignments" element={<AdminAssignments />} />
          <Route path="tasks" element={<SuperAdminTasks />} />
          <Route path="history" element={<AdminHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>


        {/* Routes Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="assignments" element={<AdminAssignments />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="history" element={<AdminHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Routes Utilisateur */}
        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="missions" element={<UserMissions />} />
          <Route path="history" element={<UserHistory />} />
          <Route path="notifications" element={<UserNotifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Route par défaut */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;