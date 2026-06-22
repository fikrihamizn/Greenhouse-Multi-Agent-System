import os
from dotenv import load_dotenv

load_dotenv()

# ─── Supported Ollama models (using correct colon-format tags) ───
MODEL_CHOICES = {
    "qwen3-vl:4b": {
        "name": "Qwen3 VL 4B",
        "type": "VLM (Vision-Language Model)",
        "parameters": "4.2 Billion",
        "description": "Multi-modal vision-language model optimized for plant leaf disease scanning, pest classification, and nutrient deficiency analysis from photos.",
        "context_window": 32768,
        "is_vision_capable": True,
        "best_role": "vision"
    },
    "gemma3:1b": {
        "name": "Gemma 3 1B",
        "type": "LLM (Language Model)",
        "parameters": "1.1 Billion",
        "description": "Google's lightweight reasoning model, delivering optimized plant expert advice, soil humidity guidance, and greenhouse Q&A responses.",
        "context_window": 8192,
        "is_vision_capable": False,
        "best_role": "expert"
    },
    "llama3.2:1b": {
        "name": "Llama 3.2 1B",
        "type": "LLM (Language Model)",
        "parameters": "1.2 Billion",
        "description": "Highly efficient compact model with 128k context window, ideal for task checklist generation, scheduling, and structured output generation.",
        "context_window": 131072,
        "is_vision_capable": False,
        "best_role": "scheduler"
    }
}

from app.config import VISION_MODEL, EXPERT_MODEL, SCHEDULER_MODEL

def _resolve_model(env_val: str, fallback: str) -> str:
    """Resolves a model name from env, normalizing common formats."""
    # Direct match
    if env_val in MODEL_CHOICES:
        return env_val
    # Try normalizing dash-format to colon-format (e.g. qwen3-vl-4b → qwen3-vl:4b)
    normalized = env_val.rsplit("-", 1)
    if len(normalized) == 2:
        colon_form = f"{normalized[0]}:{normalized[1]}"
        if colon_form in MODEL_CHOICES:
            return colon_form
    # Fallback
    return fallback if fallback in MODEL_CHOICES else list(MODEL_CHOICES.keys())[0]

# Load chosen model from .env with fallback
DEFAULT_MODEL = _resolve_model(os.getenv("SELECTED_MODEL", EXPERT_MODEL), "gemma3:1b")

# Active state tracking (global fallback model)
_current_active_model = DEFAULT_MODEL

# Validate individual agent model configurations
final_vision    = _resolve_model(VISION_MODEL,    "qwen3-vl:4b")
final_expert    = _resolve_model(EXPERT_MODEL,    "gemma3:1b")
final_scheduler = _resolve_model(SCHEDULER_MODEL, "llama3.2:1b")

# Agent-Specific Model Bindings (Each agent powered by a custom model)
# Best-fit assignment:
#   vision    → qwen3-vl:4b  (only VLM, handles image + text for leaf diagnostics)
#   expert    → gemma3:1b    (strong reasoning for plant Q&A and expert advice)
#   scheduler → llama3.2:1b  (128k context, great for structured task list generation)
_agent_bindings = {
    "vision":    final_vision,
    "expert":    final_expert,
    "scheduler": final_scheduler,
}

def _find_ollama_model(target: str, installed_models: list) -> str | None:
    """Fuzzy-match a target model tag against installed Ollama model names."""
    target_lower = target.lower()
    # 1. Exact match
    for m in installed_models:
        if m.lower() == target_lower:
            return m
    # 2. Colon-normalized match (e.g. qwen3-vl:4b vs qwen3-vl:4b-q4_K_M)
    for m in installed_models:
        if target_lower in m.lower():
            return m
    # 3. Dash-normalized match
    dash_target = target_lower.replace(":", "-")
    for m in installed_models:
        if dash_target in m.lower().replace(":", "-"):
            return m
    # 4. Base-name match (e.g. qwen3-vl matches qwen3-vl:4b)
    base = target_lower.split(":")[0]
    for m in installed_models:
        if m.lower().startswith(base):
            return m
    return None

def get_active_model() -> str:
    global _current_active_model
    return _current_active_model

def set_active_model(model_name: str) -> bool:
    global _current_active_model
    resolved = _resolve_model(model_name, _current_active_model)
    if resolved in MODEL_CHOICES:
        _current_active_model = resolved
        return True
    return False

def get_agent_bindings() -> dict:
    global _agent_bindings
    return _agent_bindings

def set_agent_binding(agent_name: str, model_name: str) -> bool:
    global _agent_bindings
    resolved = _resolve_model(model_name, list(MODEL_CHOICES.keys())[0])
    if agent_name in _agent_bindings and resolved in MODEL_CHOICES:
        _agent_bindings[agent_name] = resolved
        return True
    return False

def get_active_model_details() -> dict:
    return MODEL_CHOICES[get_active_model()]

def get_all_models() -> dict:
    return MODEL_CHOICES

def find_installed_model(target: str, installed_models: list) -> str | None:
    """Public wrapper for fuzzy model matching."""
    return _find_ollama_model(target, installed_models)
