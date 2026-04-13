import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WorkoutsPage from './pages/WorkoutsPage';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/workouts"
          element={<PrivateRoute><WorkoutsPage /></PrivateRoute>}
        />
        <Route path="*" element={<Navigate to="/workouts" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
