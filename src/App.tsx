import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import ManagerDashboard from './components/Dashboard/ManagerDashboard';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';
import FeedbackForm from './components/Feedback/FeedbackForm';
import FeedbackHistory from './components/Feedback/FeedbackHistory';
import TeamMembers from './components/Team/TeamMembers';
import MyFeedback from './components/Feedback/MyFeedback';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route 
              path="/dashboard" 
              element={
                user.role === 'manager' ? <ManagerDashboard /> : <EmployeeDashboard />
              } 
            />
            
            {/* Manager Routes */}
            {user.role === 'manager' && (
              <>
                <Route path="/team" element={<TeamMembers />} />
                <Route path="/feedback/new" element={<FeedbackForm />} />
                <Route path="/feedback/history" element={<FeedbackHistory />} />
              </>
            )}
            
            {/* Employee Routes */}
            {user.role === 'employee' && (
              <Route path="/feedback/received" element={<MyFeedback />} />
            )}
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
};

export default App;