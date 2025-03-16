import os
import time
import torch
import tiktoken
from dataclasses import dataclass
from typing import Optional, Tuple
from .train_gpt2 import GPT, GPTConfig

@dataclass
class InferenceConfig:
    max_new_tokens: int = 50
    temperature: float = 0.8
    top_k: int = 40
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
    model_type: str = "gpt2"
    checkpoint_path: Optional[str] = None

class GPT2Wrapper:
    def __init__(self, config: InferenceConfig):
        self.config = config
        self.device = config.device
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
        
        # Initialize model based on type
        if config.model_type.startswith('d'):
            n_layer = int(config.model_type[1:])
            model_config = GPTConfig(
                block_size=1024,
                vocab_size=100256,
                n_layer=n_layer,
                n_head=12 if n_layer == 12 else 16,
                n_embd=768 if n_layer == 12 else 1024
            )
            self.model = GPT(model_config)
        else:
            self.model = GPT.from_pretrained(config.model_type)
        
        # Load checkpoint if provided
        if config.checkpoint_path and os.path.exists(config.checkpoint_path):
            state_dict = torch.load(config.checkpoint_path, map_location=self.device)
            self.model.load_state_dict(state_dict)
        
        self.model.to(self.device)
        self.model.eval()

    @torch.no_grad()
    def generate(self, prompt: str) -> Tuple[str, float]:
        start_time = time.time()
        
        # Tokenize input
        input_ids = self.tokenizer.encode(prompt)
        input_ids = [self.tokenizer.eot_token] + input_ids  # Add EOT token at start
        x = torch.tensor(input_ids, dtype=torch.long, device=self.device)[None, ...]
        
        # Generate
        y = self.model.generate(
            x,
            max_new_tokens=self.config.max_new_tokens,
            temperature=self.config.temperature,
            top_k=self.config.top_k
        )
        
        # Decode output
        output_text = self.tokenizer.decode(y[0].tolist())
        inference_time = time.time() - start_time
        
        return output_text, inference_time

_model_instance = None

def get_model_instance(config: Optional[InferenceConfig] = None) -> GPT2Wrapper:
    global _model_instance
    if _model_instance is None and config is not None:
        _model_instance = GPT2Wrapper(config)
    return _model_instance