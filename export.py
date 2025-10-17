
from optimum.onnxruntime import ORTModelForFeatureExtraction, ORTQuantizer
from optimum.onnxruntime.configuration import QuantizationConfig
from transformers import AutoTokenizer
from optimum.exporters.onnx.__main__ import main_export
from onnxruntime.quantization import QuantFormat, QuantizationMode, QuantType
import os

# 1. Configuration
model_path = './fine_tuned_model'
onnx_path = './onnx_model'
os.makedirs(onnx_path, exist_ok=True)


# 2. Export model to ONNX
main_export(model_name_or_path=model_path, output=onnx_path, task="feature-extraction", opset=14)


# 3. Load tokenizer and save it
tokenizer = AutoTokenizer.from_pretrained(model_path)
tokenizer.save_pretrained(onnx_path)

# 4. Create a quantizer for the ONNX model
quantizer = ORTQuantizer.from_pretrained(onnx_path, file_name="model.onnx")

# 5. Define the quantization configuration
qconfig = QuantizationConfig(
    is_static=False,  # Use dynamic quantization
    format=QuantFormat.QOperator,
    mode=QuantizationMode.IntegerOps,
    activations_dtype=QuantType.QUInt8,
    weights_dtype=QuantType.QInt8,
    per_channel=False
)

# 6. Quantize the model
quantizer.quantize(save_dir=onnx_path, quantization_config=qconfig, file_suffix="quantized")
print(f"ONNX model and tokenizer saved to {onnx_path}")
print("Quantization complete.")
