import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import vehiculosRoutes from './routes/vehiculos.js';
import conductoresRoutes from './routes/conductores.js';
import viajesRoutes from './routes/viajes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/conductores', conductoresRoutes);
app.use('/api/viajes', viajesRoutes);

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY')
    return res.status(400).json({ message: 'Ya existe un registro con esos datos únicos (email, patente, documento o licencia)' });
  if (err.code === 'ER_ROW_IS_REFERENCED_2')
    return res.status(400).json({ message: 'No se puede eliminar: tiene viajes asociados' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2')
    return res.status(400).json({ message: 'Vehículo o conductor inexistente' });
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(process.env.PORT || 3000, () =>
  console.log(`API en http://localhost:${process.env.PORT || 3000}`));