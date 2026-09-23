import config from '../config/index.js';
import logger from '../utils/logger.js';

let pipelineFn = null;
let embedderPromise = null;

// In-memory cache for text -> embedding vector
const embeddingCache = new Map();
const MAX_CACHE_SIZE = 500;

/**
 * Returns the singleton embedding pipeline instance
 */
async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      try {
        logger.info(`Loading embedding model (${config.EMBEDDING_MODEL})...`);
        if (!pipelineFn) {
          const mod = await import('@xenova/transformers');
          pipelineFn = mod.pipeline;
        }
        const instance = await pipelineFn('feature-extraction', config.EMBEDDING_MODEL);
        logger.info('Embedding model initialized successfully');
        return instance;
      } catch (err) {
        logger.error('Failed to initialize embedding model', err);
        embedderPromise = null;
        throw new Error(`Embedding model initialization failed: ${err.message}`);
      }
    })();
  }
  return embedderPromise;
}

/**
 * Computes a normalized vector embedding for a given text
 * @param {string} text 
 * @param {number} timeoutMs
 * @returns {Promise<number[]>} Array of floating point values
 */
export async function embed(text, timeoutMs = 15000) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Text must be a non-empty string');
  }

  const normalized = text.trim();
  if (embeddingCache.has(normalized)) {
    return embeddingCache.get(normalized);
  }

  const run = async () => {
    const embedder = await getEmbedder();
    const result = await embedder(normalized, { pooling: 'mean', normalize: true });
    // Convert to plain JS number array
    const vector = Array.from(result.data);

    // Cache vector
    if (embeddingCache.size >= MAX_CACHE_SIZE) {
      const firstKey = embeddingCache.keys().next().value;
      if (firstKey) embeddingCache.delete(firstKey);
    }
    embeddingCache.set(normalized, vector);
    return vector;
  };

  return await Promise.race([
    run(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Embedding generation timed out')), timeoutMs))
  ]);
}

/**
 * Checks if the embedding pipeline is warm and functional
 */
export async function isEmbeddingReady() {
  try {
    await embed('health check test', 4000);
    return true;
  } catch {
    return false;
  }
}

export default { embed, isEmbeddingReady };
