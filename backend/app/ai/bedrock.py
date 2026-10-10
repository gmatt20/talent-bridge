"""Thin boto3 wrapper around AWS Bedrock. One function: invoke_json."""

from __future__ import annotations

import json
import logging
import os
import re
import time
from typing import Any

import boto3
from botocore.exceptions import BotoCoreError, ClientError

log = logging.getLogger(__name__)

# Nova Lite is a regional model in us-west-2 — no cross-region inference profile,
# so IAM policy stays scoped to one region. Swap via BEDROCK_MODEL_ID.
DEFAULT_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
DEFAULT_REGION = os.getenv("AWS_REGION", "us-west-2")
DEFAULT_TEMPERATURE = float(os.getenv("BEDROCK_TEMPERATURE", "0.2"))
MAX_RETRIES = 2

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client("bedrock-runtime", region_name=DEFAULT_REGION)
    return _client


class BedrockError(RuntimeError):
    """Raised when Bedrock cannot return a usable JSON response."""


def invoke_json(
    system: str,
    user: str,
    *,
    max_tokens: int = 1500,
    model_id: str | None = None,
) -> dict[str, Any]:
    """Call Bedrock and parse the response as JSON.

    Strips DeepSeek R1 reasoning tags and markdown code fences before parsing.
    Raises BedrockError if the model is unreachable or returns unparseable output.
    """
    try:
        client = _get_client()
    except Exception as e:  # noqa: BLE001 - client construction must never escape; see module contract
        raise BedrockError(f"Bedrock client unavailable: {e}") from e

    model = model_id or DEFAULT_MODEL_ID
    last_err: Exception | None = None

    for attempt in range(MAX_RETRIES + 1):
        try:
            resp = client.converse(
                modelId=model,
                system=[{"text": system}],
                messages=[{"role": "user", "content": [{"text": user}]}],
                inferenceConfig={
                    "maxTokens": max_tokens,
                    "temperature": DEFAULT_TEMPERATURE,
                },
            )
            text = resp["output"]["message"]["content"][0]["text"]
            return _parse_json(text)
        except (BotoCoreError, ClientError) as e:
            last_err = e
            log.warning("Bedrock call failed (attempt %d): %s", attempt + 1, e)
            if attempt < MAX_RETRIES:
                time.sleep(0.5 * (attempt + 1))
        except (ValueError, KeyError) as e:
            last_err = e
            log.warning("Bedrock returned unparseable output: %s", e)
            break

    raise BedrockError(f"Bedrock invocation failed: {last_err}") from last_err


_FENCE_RE = re.compile(r"```(?:json)?\s*(.+?)\s*```", re.DOTALL)
_THINK_RE = re.compile(r"<think>.*?</think>", re.DOTALL)
_OBJECT_RE = re.compile(r"\{.*\}", re.DOTALL)


def _parse_json(text: str) -> dict[str, Any]:
    """Pull a JSON object out of a model response, tolerant of reasoning tags and fences."""
    cleaned = _THINK_RE.sub("", text).strip()
    fence = _FENCE_RE.search(cleaned)
    if fence:
        cleaned = fence.group(1).strip()
    obj_match = _OBJECT_RE.search(cleaned)
    if not obj_match:
        raise ValueError(f"no JSON object found in model output: {text[:200]!r}")
    return json.loads(obj_match.group(0))
