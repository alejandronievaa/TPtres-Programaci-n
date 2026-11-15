import { Router } from 'express';
import { body, param, query } from 'express-validator';
import pool from '../config/db.js';
import { auth } from '../config/passport.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
router.use(auth);

const filtros = [
  query('vehiculo_id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('vehiculo_id inválido'),
  query('conductor_id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('conductor_id inválido'),
];

const armarWhere = (q) => {
  const cond = [], vals = [];
  if (q.vehiculo_id) { cond.push('v.vehiculo_id = ?'); vals.push(q.vehiculo_id); }
  if (q.conductor_id) { cond.push('v.conductor_id = ?'); vals.push(q.conductor_id); }
  return { where: cond.length ? 'WHERE ' + cond.join(' AND ') : '', vals };
};

router.get('/', filtros, validate, async (req, res) => {
  const { where, vals } = armarWhere(req.query);
  const [rows] = await pool.query(
    `SELECT v.*, ve.patente, ve.marca, ve.modelo,
            CONCAT(c.nombre, ' ', c.apellido) AS conductor
     FROM viajes v
     JOIN vehiculos ve ON ve.id = v.vehiculo_id
     JOIN conductores c ON c.id = v.conductor_id
     ${where} ORDER BY v.fecha_salida DESC`, vals);
  res.json(rows);
});

router.get('/km', filtros, validate, async (req, res) => {
  const { where, vals } = armarWhere(req.query);
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(v.kilometros), 0) AS total_km FROM viajes v ${where}`, vals);
  res.json({ total_km: Number(rows[0].total_km) });
});

const reglas = [
  body('vehiculo_id').isInt({ min: 1 }).withMessage('Vehículo inválido'),
  body('conductor_id').isInt({ min: 1 }).withMessage('Conductor inválido'),
  body('fecha_salida').isISO8601().withMessage('Fecha de salida inválida'),
  body('fecha_llegada').isISO8601().withMessage('Fecha de llegada inválida')
    .custom((v, { req }) => new Date(v) >= new Date(req.body.fecha_salida))
    .withMessage('La llegada no puede ser anterior a la salida'),
  body('origen').trim().notEmpty().withMessage('El origen es obligatorio'),
  body('destino').trim().notEmpty().withMessage('El destino es obligatorio'),
  body('kilometros').isFloat({ gt: 0 }).withMessage('Kilómetros inválidos'),
  body('observaciones').optional({ values: 'falsy' }).trim(),
];

router.post('/', reglas, validate, async (req, res) => {
  const { vehiculo_id, conductor_id, fecha_salida, fecha_llegada,
          origen, destino, kilometros, observaciones } = req.body;

  const [veh] = await pool.query('SELECT id FROM vehiculos WHERE id = ?', [vehiculo_id]);
  if (!veh[0]) return res.status(404).json({ message: 'Vehículo no encontrado' });

  const [con] = await pool.query('SELECT * FROM conductores WHERE id = ?', [conductor_id]);
  if (!con[0]) return res.status(404).json({ message: 'Conductor no encontrado' });

  if (con[0].fecha_vencimiento_licencia < fecha_salida.slice(0, 10)) {
    return res.status(403).json({ message: 'La licencia del conductor está vencida' });
  }

  const [r] = await pool.query(
    `INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada,
      origen, destino, kilometros, observaciones) VALUES (?,?,?,?,?,?,?,?)`,
    [vehiculo_id, conductor_id, fecha_salida, fecha_llegada,
     origen, destino, kilometros, observaciones || null]);
  res.status(201).json({ id: r.insertId, ...req.body });
});

router.delete('/:id', [param('id').isInt({ min: 1 })], validate, async (req, res) => {
  const [r] = await pool.query('DELETE FROM viajes WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Viaje no encontrado' });
  res.status(204).end();
});

export default router;