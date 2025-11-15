const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const configureAdfsStrategy = require('./sso/adfsStrategy');

// Routes
const authRoutes = require('./routes/authRoutes');
const ssoRoutes = require('./routes/ssoRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const timesheetRoutes = require('./routes/timesheetRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Security middlewares
app.use(helmet());

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(xss());
app.use(hpp());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 20,
//   message: 'Too many login attempts from this IP, please try again later.',
// });
// app.use('/api/auth', authLimiter);

// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 1000,
// });
// app.use('/api/', apiLimiter);

// Passport SSO
app.use(passport.initialize());
configureAdfsStrategy(passport);

// Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api/docs.json', (req, res) => {
  res.json(swaggerDocument);
});

// Attach routes
app.use('/api/auth', authRoutes);
app.use('/api/sso', ssoRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
