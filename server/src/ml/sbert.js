import { InferenceSession, Tensor } from "onnxruntime-node";

const session = await InferenceSession.create("./src/ml/sbert.onnx");

function tokenize(text) {
  const buf = Buffer.from(text.toLowerCase().normalize("NFD").replace(/[^\w\s]/g, ""));
  const ids = Array(128).fill(0);
  for (let i = 0; i < buf.length && i < 128; i++) ids[i] = (buf[i] % 30000) + 1;
  return ids;
}

export async function embed(text) {
  const ids = new Int32Array(tokenize(text));
  const mask = new Int32Array(128).fill(1);
  const feeds = {
    input_ids: new Tensor("int32", ids, [1, 128]),
    attention_mask: new Tensor("int32", mask, [1, 128]),
  };
  const { last_hidden_state } = await session.run(feeds);
  const data = last_hidden_state.data;
  const pooled = new Array(768).fill(0);
  for (let i = 0; i < 128; i++) {
    for (let j = 0; j < 768; j++) pooled[j] += data[i * 768 + j];
  }
  pooled.forEach((_, i) => (pooled[i] /= 128));
  return pooled;
}
