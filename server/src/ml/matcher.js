import pkg from 'ml-distance';
const { cosine } = pkg;
import { InferenceSession, Tensor } from 'onnxruntime-node';

const session = await InferenceSession.create("src/ml/sbert.onnx");

// naive tokeniser (stub) – replace with real tokenizer later
function tokenize(text) {
  const buf = Buffer.from(text);
  const ids = Array(128).fill(0);
  for (let i = 0; i < buf.length && i < 128; i++) ids[i] = buf[i] % 30000;
  return ids;
}

export async function embed(text) {
  const ids   = new BigInt64Array(tokenize(text).map(BigInt));
  const mask  = new BigInt64Array(128).fill(1n);

  const feeds = {
    input_ids:      new Tensor("int64", ids,  [1, 128]),
    attention_mask: new Tensor("int64", mask, [1, 128])
  };
  const { last_hidden_state } = await session.run(feeds);   // [1,128,768]
  const data = last_hidden_state.data;                     // flatten
  const pooled = new Array(768).fill(0);
  for (let i = 0; i < 128; i++) {
    for (let j = 0; j < 768; j++) pooled[j] += data[i * 768 + j];
  }
  pooled.forEach((_, i) => (pooled[i] /= 128));   // mean-pool
  return pooled;
}

export async function rankTasks(resumeText, tasks) {
  const resumeVec = await embed(resumeText);
  return tasks
    .map((t) => ({ ...t, score: cosine(resumeVec, t.embedding || Array(768).fill(0)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
