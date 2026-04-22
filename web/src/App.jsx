import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkoutsPage from './pages/WorkoutsPage';
import ProfilePage from './pages/ProfilePage';
import GoalsPage from './pages/GoalsPage';
import GoalJournalPage from './pages/GoalJournalPage';
import { ProtectedLayout } from './components/ProtectedLayout';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <ProtectedLayout><DashboardPage /></ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/workouts"
            element={
              <PrivateRoute>
                <ProtectedLayout><WorkoutsPage /></ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProtectedLayout><ProfilePage /></ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <PrivateRoute>
                <ProtectedLayout><GoalsPage /></ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/goal-journal"
            element={
              <PrivateRoute>
                <ProtectedLayout><GoalJournalPage /></ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
