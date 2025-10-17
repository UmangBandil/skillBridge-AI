import { AutoTokenizer } from '@xenova/transformers';
import { InferenceSession, Tensor } from "onnxruntime-node";

const session = await InferenceSession.create("./src/ml/sbert.onnx");
const tokenizer = await AutoTokenizer.from_pretrained('./onnx_model');


export async function embed(text) {
  const { input_ids, attention_mask } = tokenizer(text);
  const feeds = {
    input_ids: new Tensor("int64", input_ids.data, input_ids.dims),
    attention_mask: new Tensor("int64", attention_mask.data, attention_mask.dims),
  };
  const { sentence_embedding } = await session.run(feeds);
  return sentence_embedding.data;
}
