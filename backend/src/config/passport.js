import 'dotenv/config';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import pool from './db.js';

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const [rows] = await pool.query(
          'SELECT id, nombre, email FROM usuarios WHERE id = ?',
          [payload.id]
        );
        done(null, rows[0] || false);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

export const auth = passport.authenticate('jwt', { session: false });
export default passport;