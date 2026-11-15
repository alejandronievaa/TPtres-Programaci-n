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

export default router;