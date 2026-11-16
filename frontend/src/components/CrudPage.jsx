import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export default function CrudPage({ titulo, endpoint, campos, columnas }) {
  const vacio = Object.fromEntries(campos.map((c) => [c.name, '']));
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [errores, setErrores] = useState({});
  const [msg, setMsg] = useState('');

  const cargar = async () => {
    try { setItems(await api(endpoint)); } catch (e) { setMsg(e.message); }
  };
  useEffect(() => { cargar(); }, []);

  const validar = () => {
    const er = {};
    campos.forEach((c) => {
      const v = String(form[c.name]).trim();
      if (!v) er[c.name] = 'Campo obligatorio';
      else if (c.validar) { const m = c.validar(v, form); if (m) er[c.name] = m; }
    });
    setErrores(er);
    return Object.keys(er).length === 0;
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    try {
      await api(editId ? `${endpoint}/${editId}` : endpoint, {
        method: editId ? 'PUT' : 'POST', body: form,
      });
      setForm(vacio); setEditId(null); setMsg('');
      cargar();
    } catch (err) { setMsg(err.message); }
  };

  const editar = (item) => {
    setEditId(item.id);
    setForm(Object.fromEntries(campos.map((c) => [
      c.name, c.type === 'date' ? String(item[c.name]).slice(0, 10) : item[c.name],
    ])));
  };

  const eliminar = async (id) => {
    if (!confirm('¿Seguro que querés eliminarlo?')) return;
    try { await api(`${endpoint}/${id}`, { method: 'DELETE' }); cargar(); }
    catch (err) { setMsg(err.message); }
  };

  return (
    <section>
      <h2>{titulo}</h2>
      {msg && <p className="error">{msg}</p>}

      <form className="card grid" onSubmit={guardar} noValidate>
        {campos.map((c) => (
          <label key={c.name}>{c.label}
            <input type={c.type || 'text'} value={form[c.name]}
              onChange={(e) => setForm({ ...form, [c.name]: e.target.value })} />
            {errores[c.name] && <small className="error">{errores[c.name]}</small>}
          </label>
        ))}
        <div>
          <button className="btn">{editId ? 'Actualizar' : 'Agregar'}</button>
          {editId && (
            <button type="button" className="link"
              onClick={() => { setEditId(null); setForm(vacio); setErrores({}); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <table>
        <thead>
          <tr>{columnas.map((c) => <th key={c.key}>{c.label}</th>)}<th>Acciones</th></tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              {columnas.map((c) => <td key={c.key}>{it[c.key]}</td>)}
              <td>
                <button onClick={() => editar(it)}>Editar</button>
                <button className="peligro" onClick={() => eliminar(it.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={columnas.length + 1}>Sin registros</td></tr>}
        </tbody>
      </table>
    </section>
  );
}