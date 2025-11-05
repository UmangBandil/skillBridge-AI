
import { pipeline } from '@xenova/transformers';

// Create a new pipeline instance
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

/**
 * Generates an embedding for a given text.
 *
 * @param {string} text The text to generate an embedding for.
 * @returns {Promise<number[]>} The embedding for the given text.
 */
export async function embed(text) {
    const result = await embedder(text, { pooling: 'mean', normalize: true });
    return result.data;
}
