import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';

export default function Login() {
  const navigate = useNavigate();
  const [registro, setRegistro] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [msg, setMsg] = useState('');

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validar = () => {
    const er = {};
    if (registro && !form.nombre.trim()) er.nombre = 'El nombre es obligatorio';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Email inválido';
    if (form.password.length < 6) er.password = 'Mínimo 6 caracteres';
    setErrores(er);
    return Object.keys(er).length === 0;
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    try {
      if (registro) await api('/auth/register', { method: 'POST', body: form });
      const data = await api('/auth/login', {
        method: 'POST',
        body: { email: form.email, password: form.password },
      });
      localStorage.setItem('token', data.token);
      navigate('/vehiculos');
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <form className="card" onSubmit={enviar} noValidate>
      <h2>{registro ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
      {msg && <p className="error">{msg}</p>}

      {registro && (
        <label>Nombre
          <input name="nombre" value={form.nombre} onChange={cambiar} />
          {errores.nombre && <small className="error">{errores.nombre}</small>}
        </label>
      )}
      <label>Email
        <input name="email" type="email" value={form.email} onChange={cambiar} />
        {errores.email && <small className="error">{errores.email}</small>}
      </label>
      <label>Contraseña
        <input name="password" type="password" value={form.password} onChange={cambiar} />
        {errores.password && <small className="error">{errores.password}</small>}
      </label>

      <button className="btn">{registro ? 'Registrarme' : 'Ingresar'}</button>
      <button type="button" className="link" onClick={() => setRegistro(!registro)}>
        {registro ? 'Ya tengo cuenta' : 'Crear una cuenta'}
      </button>
    </form>
  );
}   