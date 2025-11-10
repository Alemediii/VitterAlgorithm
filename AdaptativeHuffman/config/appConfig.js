/**
 * App configuration centralizada.
 * Lee variables de entorno y proporciona valores por defecto seguros.
 */

const toInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

const DEFAULTS = {
  NODE_ENV: 'development',
  HOST: '0.0.0.0',
  PORT: 3000,
  MAX_PAYLOAD_BYTES: 10 * 1024 * 1024, // 10 MB
  LOG_LEVEL: 'debug',
  ENCODER_MAX_ORDER: 512,
  TRUST_PROXY: false
};

const config = {
  env: process.env.NODE_ENV || DEFAULTS.NODE_ENV,
  host: process.env.HOST || DEFAULTS.HOST,
  port: toInt(process.env.PORT, DEFAULTS.PORT),
  maxPayloadBytes: toInt(process.env.MAX_PAYLOAD_BYTES, DEFAULTS.MAX_PAYLOAD_BYTES),
  logLevel: process.env.LOG_LEVEL || DEFAULTS.LOG_LEVEL,
  trustProxy: (typeof process.env.TRUST_PROXY !== 'undefined') ? (process.env.TRUST_PROXY === 'true') : DEFAULTS.TRUST_PROXY,

  // Opciones específicas del algoritmo/codec
  encoder: {
    // orden máximo usado por el árbol Vitter (puedes ajustar para pruebas)
    maxOrder: toInt(process.env.ENCODER_MAX_ORDER, DEFAULTS.ENCODER_MAX_ORDER)
  },

  // Política de seguridad/limites
  limits: {
    // máximo de bytes aceptados en carga por petición
    payloadBytes: toInt(process.env.MAX_PAYLOAD_BYTES, DEFAULTS.MAX_PAYLOAD_BYTES)
  }
};

function validate(cfg) {
  if (!Number.isInteger(cfg.port) || cfg.port <= 0 || cfg.port > 65535) {
    throw new Error(`Invalid port in configuration: ${cfg.port}`);
  }
  if (!Number.isInteger(cfg.maxPayloadBytes) || cfg.maxPayloadBytes <= 0) {
    throw new Error(`Invalid maxPayloadBytes in configuration: ${cfg.maxPayloadBytes}`);
  }
  if (!Number.isInteger(cfg.encoder.maxOrder) || cfg.encoder.maxOrder <= 0) {
    throw new Error(`Invalid encoder.maxOrder in configuration: ${cfg.encoder.maxOrder}`);
  }
}

// Ejecutar validación al cargar el módulo
validate(config);

// Función auxiliar para obtener la configuración (inmutable)
function getConfig() {
  return Object.freeze(JSON.parse(JSON.stringify(config)));
}

// Export a plain object copy (so we don't mutate a frozen object) and include getConfig
module.exports = Object.assign({}, getConfig(), { getConfig });
