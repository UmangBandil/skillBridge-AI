import json
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

# 1. Configuration
model_name = 'sentence-transformers/all-MiniLM-L6-v2'
train_data_path = 'train.json'
output_path = './fine_tuned_model'
epochs = 4
batch_size = 16

# 2. Load the pre-trained model
model = SentenceTransformer(model_name)

# 3. Prepare the dataset
train_samples = []
with open(train_data_path, 'r') as f:
    for item in json.load(f):
        train_samples.append(InputExample(texts=[item['sentence1'], item['sentence2']], label=float(item['label'])))

# 4. Define the loss function and dataloader
train_dataloader = DataLoader(train_samples, shuffle=True, batch_size=batch_size)
train_loss = losses.CosineSimilarityLoss(model)

# 5. Fine-tune the model
model.fit(train_objectives=[(train_dataloader, train_loss)],
          epochs=epochs,
          warmup_steps=100,
          output_path=output_path,
          show_progress_bar=True)