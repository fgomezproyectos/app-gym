import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExercisesPage from './pages/ExercisesPage';

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
          path="/exercises"
          element={<PrivateRoute><ExercisesPage /></PrivateRoute>}
        />
        <Route path="*" element={<Navigate to="/exercises" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
