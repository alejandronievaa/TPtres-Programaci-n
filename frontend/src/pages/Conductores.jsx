import CrudPage from '../components/CrudPage.jsx';

const campos = [
  { name: 'nombre', label: 'Nombre' },
  { name: 'apellido', label: 'Apellido' },
  { name: 'numero_documento', label: 'N.º de documento',
    validar: (v) => /^\d{7,9}$/.test(v) ? '' : 'Debe tener entre 7 y 9 dígitos' },
  { name: 'numero_licencia', label: 'N.º de licencia' },
  { name: 'fecha_alta_licencia', label: 'Alta de licencia', type: 'date' },
  { name: 'fecha_vencimiento_licencia', label: 'Vencimiento de licencia', type: 'date',
    validar: (v, f) => v <= f.fecha_alta_licencia ? 'Debe ser posterior al alta' : '' },
];
const columnas = [
  { key: 'nombre', label: 'Nombre' }, { key: 'apellido', label: 'Apellido' },
  { key: 'numero_documento', label: 'Documento' }, { key: 'numero_licencia', label: 'Licencia' },
  { key: 'fecha_vencimiento_licencia', label: 'Vence' },
];

export default function Conductores() {
  return <CrudPage titulo="Conductores" endpoint="/conductores" campos={campos} columnas={columnas} />;
}