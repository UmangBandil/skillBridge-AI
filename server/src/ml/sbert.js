import { InferenceSession, Tensor } from "onnxruntime-node";

const session = await InferenceSession.create("./src/ml/sbert.onnx");

export async function embed(text) {
  const tokens = text.split(/\s+/).map((t) => t.toLowerCase().normalize("NFD").replace(/[^\w\s]+/g, ""));
  const inputIds = new Int32Array(tokens.map((t) => t.charCodeAt(0)));
  const attentionMask = new Int32Array(tokens.length).fill(1);

  const inputs = {
    input_ids: new Tensor("int32", inputIds, [1, tokens.length]),
    attention_mask: new Tensor("int32", attentionMask, [1, tokens.length]),
  };

  const { data } = await session.run(inputs);
  const pooled = data.last_hidden_state.slice(0, 768);

  return Array.from(pooled);
}