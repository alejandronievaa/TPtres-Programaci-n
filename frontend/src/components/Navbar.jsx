import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const logueado = !!localStorage.getItem('token');

  const salir = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <strong>🚚 Transporte</strong>
      <Link to="/">Inicio</Link>
      {logueado ? (
        <>
          <Link to="/vehiculos">Vehículos</Link>
          <Link to="/conductores">Conductores</Link>
          <Link to="/viajes">Viajes</Link>
          <button onClick={salir}>Cerrar sesión</button>
        </>
      ) : (
        <Link to="/login">Iniciar sesión</Link>
      )}
    </nav>
  );
}