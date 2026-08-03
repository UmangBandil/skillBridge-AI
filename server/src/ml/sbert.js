import { AutoTokenizer } from '@xenova/transformers';
import { InferenceSession, Tensor } from "onnxruntime-node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let session, tokenizer;
try {
  session = await InferenceSession.create(path.resolve(__dirname, "sbert.onnx"));
  tokenizer = await AutoTokenizer.from_pretrained('Xenova/all-MiniLM-L6-v2');
  console.log('[SBERT] Model and tokenizer loaded successfully');
} catch (err) {
  console.error('[SBERT] Failed to load model or tokenizer:', err.message);
}


export async function embed(text) {
  if (!session || !tokenizer) {
    throw new Error('[SBERT] Model not available — check that sbert.onnx exists and the tokenizer loaded correctly');
  }
  const { input_ids, attention_mask } = await tokenizer(text);
  const feeds = {
    input_ids: new Tensor("int64", input_ids.data, input_ids.dims),
    attention_mask: new Tensor("int64", attention_mask.data, attention_mask.dims),
  };
  const { sentence_embedding } = await session.run(feeds);
  return sentence_embedding.data;
}
