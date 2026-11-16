import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Vehiculos from './pages/Vehiculos.jsx';
import Conductores from './pages/Conductores.jsx';
import Viajes from './pages/Viajes.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vehiculos" element={<ProtectedRoute><Vehiculos /></ProtectedRoute>} />
          <Route path="/conductores" element={<ProtectedRoute><Conductores /></ProtectedRoute>} />
          <Route path="/viajes" element={<ProtectedRoute><Viajes /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}