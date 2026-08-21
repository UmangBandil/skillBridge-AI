
import { pipeline } from '@xenova/transformers';

// Create a new pipeline instance
// const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

// Lazy-memoized initialization to avoid top-level await and handle startup failures gracefully
let embedderInstance;
let embedderInitializing = false;
let embedderError = null;

async function getEmbedder() {
  if (embedderError) {
    throw embedderError;
  }
  
  if (embedderInstance) {
    return embedderInstance;
  }
  
  if (embedderInitializing) {
    // Wait for initialization to complete
    while (embedderInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (embedderError) {
      throw embedderError;
    }
    return embedderInstance;
  }
  
  embedderInitializing = true;
  try {
    console.log('Initializing embedding model (this may take a moment on first use)...');
    embedderInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model initialized successfully');
    embedderInitializing = false;
    return embedderInstance;
  } catch (error) {
    embedderError = error;
    embedderInitializing = false;
    console.error('Failed to initialize embedding model:', error);
    throw new Error(`Failed to initialize embedding model: ${error.message}`);
  }
}

/**
 * Generates an embedding for a given text.
 *
 * @param {string} text The text to generate an embedding for.
 * @returns {Promise<number[]>} The embedding for the given text.
 */
export async function embed(text) {
    // Basic input validation
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('Text must be a non-empty string');
    }

    // Timeout guard to prevent hanging calls
    const TIMEOUT_MS = 15000;

    const run = async () => {
      const embedder = await getEmbedder();
      const result = await embedder(text, { pooling: 'mean', normalize: true });
      // Convert to a plain array: Float32Array is silently base64-encoded by
      // Prisma when stored in a JSONB column, which corrupts the embedding.
      return Array.from(result.data);
    };

    return await Promise.race([
      run(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Embedding timeout')), TIMEOUT_MS)),
    ]);
}
