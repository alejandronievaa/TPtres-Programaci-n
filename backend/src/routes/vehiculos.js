import { Router } from 'express';
import { body, param, query } from 'express-validator';
import pool from '../config/db.js';
import { auth } from '../config/passport.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
router.use(auth);

const id = param('id').isInt({ min: 1 }).withMessage('id inválido');
const reglas = [
  body('marca').trim().notEmpty().withMessage('La marca es obligatoria'),
  body('modelo').trim().notEmpty().withMessage('El modelo es obligatorio'),
  body('patente').trim().notEmpty().isLength({ max: 10 }).withMessage('Patente inválida'),
  body('anio').isInt({ min: 1950, max: new Date().getFullYear() + 1 }).withMessage('Año inválido'),
  body('capacidad_carga').isFloat({ gt: 0 }).withMessage('Capacidad inválida'),
];

router.get('/', [query('q').optional().trim()], validate, async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const [rows] = await pool.query(
    'SELECT * FROM vehiculos WHERE patente LIKE ? OR marca LIKE ? ORDER BY id DESC', [q, q]);
  res.json(rows);
});

router.get('/:id', [id], validate, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Vehículo no encontrado' });
  res.json(rows[0]);
});

router.post('/', reglas, validate, async (req, res) => {
  const { marca, modelo, patente, anio, capacidad_carga } = req.body;
  const [r] = await pool.query(
    'INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?,?,?,?,?)',
    [marca, modelo, patente, anio, capacidad_carga]);
  res.status(201).json({ id: r.insertId, ...req.body });
});

router.put('/:id', [id, ...reglas], validate, async (req, res) => {
  const { marca, modelo, patente, anio, capacidad_carga } = req.body;
  const [r] = await pool.query(
    'UPDATE vehiculos SET marca=?, modelo=?, patente=?, anio=?, capacidad_carga=? WHERE id=?',
    [marca, modelo, patente, anio, capacidad_carga, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Vehículo no encontrado' });
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', [id], validate, async (req, res) => {
  const [r] = await pool.query('DELETE FROM vehiculos WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Vehículo no encontrado' });
  res.status(204).end();
});

export default router;