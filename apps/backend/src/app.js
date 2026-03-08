import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import trackerRoutes from './routes/trackerRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import programRoutes from './routes/programRoutes.js';
import { authRequired } from './middleware/authMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import passport from './config/passport.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(passport.initialize());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'RAVIVE API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authRequired, dashboardRoutes);
app.use('/api/nutrition', authRequired, nutritionRoutes);
app.use('/api/exercises', authRequired, exerciseRoutes);
app.use('/api/trackers', authRequired, trackerRoutes);
app.use('/api/profile', authRequired, profileRoutes);
app.use('/api/analytics', authRequired, analyticsRoutes);
app.use('/api/achievements', authRequired, achievementRoutes);
app.use('/api/ai', authRequired, aiRoutes);
app.use('/api/social', authRequired, socialRoutes);
app.use('/api/challenges', authRequired, challengeRoutes);
app.use('/api/programs', authRequired, programRoutes);

app.use(errorHandler);

export default app;
