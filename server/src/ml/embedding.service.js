import crypto from 'crypto';
import config from '../config/index.js';
import logger from '../utils/logger.js';

let pipelineFn = null;
let embedderPromise = null;

// In-memory LRU cache: contentHash (SHA-256) -> embedding vector
const embeddingCache = new Map();
const MAX_CACHE_SIZE = 1000;

/**
 * Computes deterministic SHA-256 content hash of input text
 * @param {string} text
 * @returns {string} Hex hash string
 */
export function getContentHash(text) {
  if (typeof text !== 'string') return '';
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

/**
 * Returns the singleton embedding pipeline instance
 */
async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      const startTime = Date.now();
      try {
        logger.info(`Loading embedding model (${config.EMBEDDING_MODEL})...`);
        if (!pipelineFn) {
          const mod = await import('@xenova/transformers');
          pipelineFn = mod.pipeline;
        }
        const instance = await pipelineFn('feature-extraction', config.EMBEDDING_MODEL);
        const durationMs = Date.now() - startTime;
        logger.info('Embedding model initialized successfully', { durationMs });
        return instance;
      } catch (err) {
        logger.error('Failed to initialize embedding model', { error: err.message });
        embedderPromise = null;
        throw new Error(`Embedding model initialization failed: ${err.message}`);
      }
    })();
  }
  return embedderPromise;
}

/**
 * Computes a normalized vector embedding for a given text with content hash caching
 * @param {string} text 
 * @param {number} timeoutMs
 * @returns {Promise<number[]>} Array of floating point values
 */
export async function embed(text, timeoutMs = 15000) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Text must be a non-empty string');
  }

  const normalized = text.trim();
  const hashKey = getContentHash(normalized);

  if (embeddingCache.has(hashKey)) {
    return embeddingCache.get(hashKey);
  }

  const run = async () => {
    const startTime = Date.now();
    const embedder = await getEmbedder();
    const result = await embedder(normalized, { pooling: 'mean', normalize: true });
    const vector = Array.from(result.data);
    const durationMs = Date.now() - startTime;

    logger.debug('Generated vector embedding', {
      vectorDim: vector.length,
      durationMs,
      contentLength: normalized.length,
      contentHash: hashKey.substring(0, 12),
    });

    // Cache management
    if (embeddingCache.size >= MAX_CACHE_SIZE) {
      const firstKey = embeddingCache.keys().next().value;
      if (firstKey) embeddingCache.delete(firstKey);
    }
    embeddingCache.set(hashKey, vector);

    return vector;
  };

  return await Promise.race([
    run(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Embedding generation timed out')), timeoutMs)
    ),
  ]);
}

/**
 * Checks if the embedding pipeline is warm and functional
 */
export async function isEmbeddingReady() {
  try {
    await embed('health check probe', 5000);
    return true;
  } catch {
    return false;
  }
}

export default { embed, getContentHash, isEmbeddingReady };
