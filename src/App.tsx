import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardPengguna from './pages/pengguna/DashboardPengguna';
import DashboardPetugas from './pages/petugas/DashboardPetugas';

// Komponen Pembungkus Route yang dilindungi
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'petugas' ? '/petugas' : '/pengguna'} replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route 
          path="/pengguna" 
          element={
            <ProtectedRoute allowedRole="pengguna">
              <DashboardPengguna />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/petugas" 
          element={
            <ProtectedRoute allowedRole="petugas">
              <DashboardPetugas />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
