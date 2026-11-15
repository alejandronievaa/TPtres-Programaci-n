import { Router } from 'express';
import { body, param, query } from 'express-validator';
import pool from '../config/db.js';
import { auth } from '../config/passport.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
router.use(auth);

const id = param('id').isInt({ min: 1 }).withMessage('id inválido');
const reglas = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio'),
  body('numero_documento').trim().notEmpty().withMessage('El documento es obligatorio'),
  body('numero_licencia').trim().notEmpty().withMessage('La licencia es obligatoria'),
  body('fecha_alta_licencia').isISO8601().withMessage('Fecha de alta inválida'),
  body('fecha_vencimiento_licencia').isISO8601().withMessage('Fecha de vencimiento inválida')
    .custom((v, { req }) => v > req.body.fecha_alta_licencia)
    .withMessage('El vencimiento debe ser posterior al alta'),
];

router.get('/', [query('q').optional().trim()], validate, async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const [rows] = await pool.query(
    'SELECT * FROM conductores WHERE apellido LIKE ? OR nombre LIKE ? ORDER BY id DESC', [q, q]);
  res.json(rows);
});

router.get('/:id', [id], validate, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM conductores WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Conductor no encontrado' });
  res.json(rows[0]);
});

router.post('/', reglas, validate, async (req, res) => {
  const { nombre, apellido, numero_documento, numero_licencia,
          fecha_alta_licencia, fecha_vencimiento_licencia } = req.body;
  const [r] = await pool.query(
    `INSERT INTO conductores (nombre, apellido, numero_documento, numero_licencia,
      fecha_alta_licencia, fecha_vencimiento_licencia) VALUES (?,?,?,?,?,?)`,
    [nombre, apellido, numero_documento, numero_licencia,
     fecha_alta_licencia, fecha_vencimiento_licencia]);
  res.status(201).json({ id: r.insertId, ...req.body });
});

router.put('/:id', [id, ...reglas], validate, async (req, res) => {
  const { nombre, apellido, numero_documento, numero_licencia,
          fecha_alta_licencia, fecha_vencimiento_licencia } = req.body;
  const [r] = await pool.query(
    `UPDATE conductores SET nombre=?, apellido=?, numero_documento=?, numero_licencia=?,
      fecha_alta_licencia=?, fecha_vencimiento_licencia=? WHERE id=?`,
    [nombre, apellido, numero_documento, numero_licencia,
     fecha_alta_licencia, fecha_vencimiento_licencia, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Conductor no encontrado' });
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', [id], validate, async (req, res) => {
  const [r] = await pool.query('DELETE FROM conductores WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Conductor no encontrado' });
  res.status(204).end();
});

export default router;