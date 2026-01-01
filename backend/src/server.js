import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { migrateCheck } from './db.js';
import orphanRouter from './routes/orphans.js';
import guardianRouter from './routes/guardians.js';
import sponsorRouter from './routes/sponsors.js';
import sponsorshipRouter from './routes/sponsorships.js';
import socialVisitRouter from './routes/socialVisits.js';
import documentRouter from './routes/documents.js';
import reportRouter from './routes/reports.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/users.js';
import motherRouter from './routes/mothers.js';
import fatherRouter from './routes/fathers.js';
import siblingRouter from './routes/siblings.js';
// import sponsorOrgRouter from './routes/sponsor-organizations.js';
// import marketingOrgRouter from './routes/marketing-organizations.js';
import organizationsRouter from './routes/organizations.js';
import attachmentRouter from './routes/attachments.js';
import settingsRouter from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', async (req, res, next) => {
  try {
    const dbVersion = await migrateCheck();
    res.json({ status: 'ok', dbVersion });
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRouter);
app.use('/api/orphans', orphanRouter);
app.use('/api/guardians', guardianRouter);
app.use('/api/sponsors', sponsorRouter);
app.use('/api/sponsorships', sponsorshipRouter);
app.use('/api/social-visits', socialVisitRouter);
app.use('/api/documents', documentRouter);
app.use('/api/reports', reportRouter);
app.use('/api/users', userRouter);
app.use('/api/mothers', motherRouter);
app.use('/api/fathers', fatherRouter);
app.use('/api/siblings', siblingRouter);
// app.use('/api/sponsor-organizations', sponsorOrgRouter);
// app.use('/api/marketing-organizations', marketingOrgRouter);
app.use('/api/organizations', organizationsRouter);
app.use('/api/attachments', attachmentRouter);
app.use('/api/settings', settingsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ message: 'Internal server error', detail: err.message });
});

app.listen(config.port, () => {
  console.log(`API listening on port ${config.port} (env: ${config.nodeEnv})`);
});
