import json
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# 1. Configuration
model_path = './fine_tuned_model'
eval_data_path = 'eval.json'

# 2. Load the fine-tuned model
model = SentenceTransformer(model_path)

# 3. Load evaluation data
with open(eval_data_path, 'r') as f:
    eval_data = json.load(f)

sentences1 = [item['sentence1'] for item in eval_data]
sentences2 = [item['sentence2'] for item in eval_data]
gold_scores = [item['label'] for item in eval_data]

# 4. Generate embeddings
embeddings1 = model.encode(sentences1, convert_to_tensor=True)
embeddings2 = model.encode(sentences2, convert_to_tensor=True)

# 5. Calculate cosine similarity
predicted_scores = cosine_similarity(
    embeddings1.cpu().numpy(),
    embeddings2.cpu().numpy()
)

# 6. Print results
print("Evaluation Results:")
for i in range(len(sentences1)):
    print(f"Gold: {gold_scores[i]:.4f}, Predicted: {predicted_scores[i][i]:.4f}")

# Calculate Pearson correlation
correlation = np.corrcoef(gold_scores, [pred[i] for i, pred in enumerate(predicted_scores)])[0, 1]
print(f"\nPearson Correlation: {correlation:.4f}")