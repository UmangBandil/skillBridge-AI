/**
 * Redacts sensitive fields from objects before logging
 */
function sanitize(data) {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveKeys = [
    'password', 'token', 'jwt', 'secret', 'authorization', 'bearer',
    'apikey', 'api_key', 'openai_api_key', 'rawtext', 'resumetext'
  ];

  if (Array.isArray(data)) {
    return data.map(item => sanitize(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({ level: 'INFO', timestamp, message, ...sanitize(meta) }));
  },
  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(JSON.stringify({ level: 'WARN', timestamp, message, ...sanitize(meta) }));
  },
  error: (message, error = null, meta = {}) => {
    const timestamp = new Date().toISOString();
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    } : { rawError: error };

    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp,
      message,
      error: errorDetails,
      ...sanitize(meta)
    }));
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.debug(JSON.stringify({ level: 'DEBUG', timestamp, message, ...sanitize(meta) }));
    }
  }
};

export default logger;
