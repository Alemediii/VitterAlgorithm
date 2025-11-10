const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const logger = require('./utils/logger');
const config = require('./config/appConfig');

const compressionRoutes = require('./routes/compressionRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const visualizationRoutes = require('./routes/visualizationRoutes');
const decooutRoutes = require('./routes/decooutRoutes');
const entropyGuideRoutes = require('./routes/entropyGuideRoutes');
const compareRoutes = require('./routes/compareRoutes');
const benchmarkRoutes = require('./routes/benchmarkRoutes');

const app = express();

// Basic security and performance middleware
app.use(helmet());
app.use(compression());

// JSON body parser with size limit from config
app.use(express.json({ limit: config.maxPayloadBytes }));
app.use(express.urlencoded({ extended: true, limit: config.maxPayloadBytes }));

// CORS
app.use(cors());

// Serve frontend static assets (public) and make index available at '/'
app.use(express.static(path.join(__dirname, 'public')));
// Serve the bundled UMA image (it's located under views/uma.png) at /uma.png
app.get('/uma.png', (req, res) => {
  return res.sendFile(path.join(__dirname, 'views', 'uma.png'));
});
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'views', 'index.html');
  return res.sendFile(indexPath);
});

// Mount API routes
app.use('/', compressionRoutes);
app.use('/', analysisRoutes);
app.use('/api/visualization', visualizationRoutes);
app.use('/decoout', decooutRoutes);
app.use('/entropy', entropyGuideRoutes);
app.use('/', compareRoutes);
app.use('/', benchmarkRoutes);

// 404 handler
app.use((req, res, _next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, _next) => {
  logger.error('Unhandled error: %s', err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  res.status(status).json({ error: err && err.message ? err.message : 'Internal Server Error' });
});

// Start server if run directly
if (require.main === module) {
  const port = config.port || 3000;
  app.listen(port, config.host, () => {
    logger.info('Server listening on %s:%d (env=%s)', config.host, port, config.env);
  });
}

module.exports = app;
