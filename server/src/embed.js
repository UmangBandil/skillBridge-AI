
// Dynamic import so the server starts even if @xenova/transformers is unavailable
// (e.g. Render free tier 512MB RAM limit).
let pipelineFn = null;

// Promise-based memoization so concurrent embed() calls share a single init.
let embedderPromise = null;

async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      try {
        console.log('Initializing embedding model (this may take a moment on first use)...');
        if (!pipelineFn) {
          const mod = await import('@xenova/transformers');
          pipelineFn = mod.pipeline;
        }
        const instance = await pipelineFn('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('Embedding model initialized successfully');
        return instance;
      } catch (error) {
        console.error('Failed to initialize embedding model:', error);
        // Reset so a retry is possible after the underlying issue is fixed.
        embedderPromise = null;
        throw new Error(`Failed to initialize embedding model: ${error.message}`);
      }
    })();
  }
  return embedderPromise;
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
