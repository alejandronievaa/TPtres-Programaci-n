import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const vacio = { vehiculo_id: '', conductor_id: '', fecha_salida: '', fecha_llegada: '',
                origen: '', destino: '', kilometros: '', observaciones: '' };

export default function Viajes() {
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [form, setForm] = useState(vacio);
  const [errores, setErrores] = useState({});
  const [filtro, setFiltro] = useState({ vehiculo_id: '', conductor_id: '' });
  const [totalKm, setTotalKm] = useState(null);
  const [msg, setMsg] = useState('');

  const cargarViajes = async () => {
    const qs = new URLSearchParams(
      Object.entries(filtro).filter(([, v]) => v)).toString();
    try {
      setViajes(await api(`/viajes?${qs}`));
      setTotalKm(qs ? (await api(`/viajes/km?${qs}`)).total_km : null);
    } catch (e) { setMsg(e.message); }
  };

  useEffect(() => {
    (async () => {
      try {
        setVehiculos(await api('/vehiculos'));
        setConductores(await api('/conductores'));
      } catch (e) { setMsg(e.message); }
    })();
  }, []);
  useEffect(() => { cargarViajes(); }, [filtro]);

  const validar = () => {
    const er = {};
    ['vehiculo_id', 'conductor_id', 'fecha_salida', 'fecha_llegada', 'origen', 'destino']
      .forEach((k) => { if (!String(form[k]).trim()) er[k] = 'Campo obligatorio'; });
    if (!form.kilometros || Number(form.kilometros) <= 0) er.kilometros = 'Debe ser mayor a 0';
    if (form.fecha_salida && form.fecha_llegada && form.fecha_llegada < form.fecha_salida)
      er.fecha_llegada = 'La llegada no puede ser anterior a la salida';
    setErrores(er);
    return Object.keys(er).length === 0;
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    try {
      await api('/viajes', { method: 'POST', body: form });
      setForm(vacio); setMsg('');
      cargarViajes();
    } catch (err) { setMsg(err.message); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este viaje?')) return;
    try { await api(`/viajes/${id}`, { method: 'DELETE' }); cargarViajes(); }
    catch (err) { setMsg(err.message); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <section>
      <h2>Viajes</h2>
      {msg && <p className="error">{msg}</p>}

      <form className="card grid" onSubmit={guardar} noValidate>
        <label>Vehículo
          <select value={form.vehiculo_id} onChange={set('vehiculo_id')}>
            <option value="">Seleccionar...</option>
            {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.patente} - {v.marca} {v.modelo}</option>)}
          </select>
          {errores.vehiculo_id && <small className="error">{errores.vehiculo_id}</small>}
        </label>
        <label>Conductor
          <select value={form.conductor_id} onChange={set('conductor_id')}>
            <option value="">Seleccionar...</option>
            {conductores.map((c) => <option key={c.id} value={c.id}>{c.apellido}, {c.nombre}</option>)}
          </select>
          {errores.conductor_id && <small className="error">{errores.conductor_id}</small>}
        </label>
        <label>Fecha de salida
          <input type="datetime-local" value={form.fecha_salida} onChange={set('fecha_salida')} />
          {errores.fecha_salida && <small className="error">{errores.fecha_salida}</small>}
        </label>
        <label>Fecha de llegada
          <input type="datetime-local" value={form.fecha_llegada} onChange={set('fecha_llegada')} />
          {errores.fecha_llegada && <small className="error">{errores.fecha_llegada}</small>}
        </label>
        <label>Origen
          <input value={form.origen} onChange={set('origen')} />
          {errores.origen && <small className="error">{errores.origen}</small>}
        </label>
        <label>Destino
          <input value={form.destino} onChange={set('destino')} />
          {errores.destino && <small className="error">{errores.destino}</small>}
        </label>
        <label>Kilómetros
          <input type="number" value={form.kilometros} onChange={set('kilometros')} />
          {errores.kilometros && <small className="error">{errores.kilometros}</small>}
        </label>
        <label>Observaciones
          <input value={form.observaciones} onChange={set('observaciones')} />
        </label>
        <div><button className="btn">Registrar viaje</button></div>
      </form>

      <div className="card grid">
        <label>Filtrar por vehículo
          <select value={filtro.vehiculo_id}
            onChange={(e) => setFiltro({ ...filtro, vehiculo_id: e.target.value })}>
            <option value="">Todos</option>
            {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.patente}</option>)}
          </select>
        </label>
        <label>Filtrar por conductor
          <select value={filtro.conductor_id}
            onChange={(e) => setFiltro({ ...filtro, conductor_id: e.target.value })}>
            <option value="">Todos</option>
            {conductores.map((c) => <option key={c.id} value={c.id}>{c.apellido}, {c.nombre}</option>)}
          </select>
        </label>
        {totalKm !== null && <p><strong>Total recorrido: {totalKm} km</strong></p>}
      </div>

      <table>
        <thead>
          <tr><th>Salida</th><th>Llegada</th><th>Vehículo</th><th>Conductor</th>
              <th>Origen</th><th>Destino</th><th>Km</th><th></th></tr>
        </thead>
        <tbody>
          {viajes.map((v) => (
            <tr key={v.id}>
              <td>{v.fecha_salida}</td><td>{v.fecha_llegada}</td><td>{v.patente}</td>
              <td>{v.conductor}</td><td>{v.origen}</td><td>{v.destino}</td><td>{v.kilometros}</td>
              <td><button className="peligro" onClick={() => eliminar(v.id)}>Eliminar</button></td>
            </tr>
          ))}
          {!viajes.length && <tr><td colSpan="8">Sin viajes</td></tr>}
        </tbody>
      </table>
    </section>
  );
}