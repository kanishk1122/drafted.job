"""
Embedding Service — Generates semantic vector embeddings for resume and job text.
Uses NVIDIA NIM `nvidia/nv-embed-v1` (1024-dim) when API key available.
Falls back to a lightweight TF-IDF heuristic vector for offline/dev mode.
"""
from __future__ import annotations
import hashlib
import json
from typing import List, Optional
from app.core.config import settings

# ──────────────────────────────────────────────────────────────────
# Embedding Client (NVIDIA NIM)
# ──────────────────────────────────────────────────────────────────
_client = None

def _get_client():
    global _client
    if _client is None and settings.NVIDIA_API_KEY:
        from openai import AsyncOpenAI
        _client = AsyncOpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=settings.NVIDIA_API_KEY
        )
    return _client


# ──────────────────────────────────────────────────────────────────
# Fallback: deterministic keyword hash vector (offline mode)
# Returns a unit-normalised 1024-dim float list derived from text tokens.
# NOT semantically meaningful, but allows the system to run without API.
# ──────────────────────────────────────────────────────────────────
def _fallback_vector(text: str, dim: int = 1024) -> List[float]:
    import math
    tokens = text.lower().split()
    vec = [0.0] * dim
    for tok in tokens:
        h = int(hashlib.sha256(tok.encode()).hexdigest(), 16)
        idx = h % dim
        vec[idx] += 1.0
    # L2-normalise
    mag = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / mag for v in vec]


# ──────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────
async def generate_embedding(text: str) -> List[float]:
    """
    Generate a semantic embedding vector for the given text.
    Returns a 1024-dim float list.
    Truncates input to 8000 chars to stay within model token limits.
    """
    if not text or not text.strip():
        return _fallback_vector("", settings.EMBEDDING_DIM)

    truncated = text[:8000]
    client = _get_client()

    if client is None:
        print("⚠️  No NVIDIA API key — using fallback hash vector.")
        return _fallback_vector(truncated, settings.EMBEDDING_DIM)

    try:
        response = await client.embeddings.create(
            input=[truncated],
            model=settings.EMBEDDING_MODEL_NAME,
            encoding_format="float",
            extra_body={"input_type": "query", "truncate": "END"}
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"⚠️  Embedding API failed: {e}. Using fallback hash vector.")
        return _fallback_vector(truncated, settings.EMBEDDING_DIM)


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity between two vectors (0-1 scale)."""
    import math
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a)) or 1e-9
    mag_b = math.sqrt(sum(y * y for y in b)) or 1e-9
    return max(0.0, min(1.0, dot / (mag_a * mag_b)))
