import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import { pool } from './db.js';

if (env.googleClientId && env.googleClientSecret && env.googleCallbackUrl) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || 'Google User';
          const oauthId = profile.id;

          const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

          if (existing.rowCount) {
            return done(null, existing.rows[0]);
          }

          const created = await pool.query(
            `INSERT INTO users (name, email, oauth_provider, oauth_id)
             VALUES ($1,$2,'google',$3)
             RETURNING *`,
            [name, email, oauthId]
          );

          return done(null, created.rows[0]);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

export default passport;
