import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section>
      <h1>Gestión de transporte</h1>
      <p>Administrá los vehículos de tu empresa, sus conductores y los viajes realizados.</p>
      {!localStorage.getItem('token') && <Link className="btn" to="/login">Ingresar</Link>}
    </section>
  );
}