import CrudPage from '../components/CrudPage.jsx';

const campos = [
  { name: 'marca', label: 'Marca' },
  { name: 'modelo', label: 'Modelo' },
  { name: 'patente', label: 'Patente', validar: (v) => v.length > 10 ? 'Máximo 10 caracteres' : '' },
  { name: 'anio', label: 'Año', type: 'number',
    validar: (v) => (v < 1950 || v > new Date().getFullYear() + 1) ? 'Año inválido' : '' },
  { name: 'capacidad_carga', label: 'Capacidad de carga (kg)', type: 'number',
    validar: (v) => Number(v) <= 0 ? 'Debe ser mayor a 0' : '' },
];
const columnas = [
  { key: 'marca', label: 'Marca' }, { key: 'modelo', label: 'Modelo' },
  { key: 'patente', label: 'Patente' }, { key: 'anio', label: 'Año' },
  { key: 'capacidad_carga', label: 'Capacidad' },
];

export default function Vehiculos() {
  return <CrudPage titulo="Vehículos" endpoint="/vehiculos" campos={campos} columnas={columnas} />;
}