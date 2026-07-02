import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import CareSchedule from './pages/CareSchedule';
import VisitConfirm from './pages/VisitConfirm';
import AIChat from './pages/AIChat';
import EngageCare from './pages/EngageCare';
import DoseTrack from './pages/DoseTrack';
import MyReports from './pages/MyReports';
import Settings from './pages/Settings';
import VideoConsultation from './pages/VideoConsultation';
import IncomingCallNotification from './components/IncomingCallNotification';
import { NotificationProvider } from './context/NotificationContext';

function AppContent({ user, onLogout }) {
  const navigate = useNavigate();
  
  // Determine if user is a patient (participant)
  const isPatient = !user?.role || user?.role === 'participant';
  const isDoctor = user?.role === 'doctor';

  // Handle incoming call acceptance
  const handleCallAccepted = (callData) => {
    // Navigate to video page with call data
    navigate(`/video?token=${encodeURIComponent(callData.token)}&room=${callData.roomName}&url=${encodeURIComponent(callData.url)}&consultationId=${callData.consultationId}`);
  };

  return (
    <>
      {/* Incoming call notification for patients */}
      {isPatient && (
        <IncomingCallNotification 
          user={user} 
          onAccept={handleCallAccepted}
          onDecline={() => console.log('Call declined')}
        />
      )}
      
      <Layout user={user} onLogout={onLogout}>
        <Routes>
          {/* Dashboard - different for patients vs doctors */}
          <Route 
            path="/" 
            element={isDoctor ? <DoctorDashboard user={user} /> : <Dashboard user={user} />} 
          />
          
          {/* Patient-only routes */}
          {isPatient && (
            <>
              <Route path="/schedule" element={<CareSchedule user={user} />} />
              <Route path="/chat" element={<AIChat user={user} />} />
              <Route path="/engage" element={<EngageCare user={user} />} />
              <Route path="/reports" element={<MyReports user={user} />} />
            </>
          )}
          
          {/* Patient and Doctor routes */}
          <Route path="/medication" element={<DoseTrack user={user} />} />
          
          {/* Shared routes */}
          <Route path="/visits" element={<VisitConfirm user={user} />} />
          <Route path="/settings" element={<Settings user={user} />} />
          <Route path="/video" element={<VideoConsultation user={user} />} />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('trialUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Validate user has a proper UUID (36 chars with dashes)
        if (parsed?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.id)) {
          setUser(parsed);
        } else {
          // Invalid user data, clear it
          localStorage.removeItem('trialUser');
        }
      } catch (e) {
        localStorage.removeItem('trialUser');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('trialUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('trialUser');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <NotificationProvider user={user}>
      <AppContent user={user} onLogout={handleLogout} />
    </NotificationProvider>
  );
}

export default App;
