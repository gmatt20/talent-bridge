"""Thin boto3 wrapper around AWS Bedrock. One function: invoke_json."""

import functools
import json
import logging
import os
import re
import time
from typing import Any

import boto3
from botocore import exceptions as botocore_exceptions

log = logging.getLogger(__name__)

# Nova Lite is a regional model in us-west-2, with no cross-region inference
# profile, so the IAM policy stays scoped to one region. Swap it with
# BEDROCK_MODEL_ID.
DEFAULT_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
DEFAULT_REGION = os.getenv("AWS_REGION", "us-west-2")
# Nova rejects temperature 0; 0.00001 is its minimum and effectively greedy.
DEFAULT_TEMPERATURE = float(os.getenv("BEDROCK_TEMPERATURE", "0.00001"))
MAX_RETRIES = 2

_FENCE_RE = re.compile(r"```(?:json)?\s*(.+?)\s*```", re.DOTALL)
_THINK_RE = re.compile(r"<think>.*?</think>", re.DOTALL)
_OBJECT_RE = re.compile(r"\{.*\}", re.DOTALL)


class BedrockError(RuntimeError):
    """Bedrock could not return a usable JSON response."""


@functools.cache
def _get_client() -> Any:
    return boto3.client("bedrock-runtime", region_name=DEFAULT_REGION)


def invoke_json(
    system: str,
    user: str,
    *,
    max_tokens: int = 1500,
    model_id: str | None = None,
) -> dict[str, Any]:
    """Calls Bedrock and parses the response as JSON.

    Strips reasoning tags and markdown code fences before parsing.

    Args:
        system: The system prompt.
        user: The user message.
        max_tokens: The most tokens the model may generate.
        model_id: A Bedrock model id; defaults to `DEFAULT_MODEL_ID`.

    Returns:
        The JSON object the model returned.

    Raises:
        BedrockError: The model is unreachable or returned unparseable output.
    """
    try:
        client = _get_client()
    # Isolation point: client construction must never escape this module.
    except Exception as e:  # pylint: disable=broad-exception-caught
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
                # topK is Nova-specific and only accepted via
                # additionalModelRequestFields; 1 forces greedy decoding.
                additionalModelRequestFields={"inferenceConfig": {"topK": 1}},
            )
            text = resp["output"]["message"]["content"][0]["text"]
            return _parse_json(text)
        except (
            botocore_exceptions.BotoCoreError,
            botocore_exceptions.ClientError,
        ) as e:
            last_err = e
            log.warning("Bedrock call failed (attempt %d): %s", attempt + 1, e)
            if attempt < MAX_RETRIES:
                time.sleep(0.5 * (attempt + 1))
        except (ValueError, KeyError) as e:
            last_err = e
            log.warning("Bedrock returned unparseable output: %s", e)
            break

    raise BedrockError(f"Bedrock invocation failed: {last_err}") from last_err


def _parse_json(text: str) -> dict[str, Any]:
    """Pulls a JSON object out of a model response.

    Tolerates reasoning tags, code fences and surrounding prose.
    """
    cleaned = _THINK_RE.sub("", text).strip()
    fence = _FENCE_RE.search(cleaned)
    if fence:
        cleaned = fence.group(1).strip()
    obj_match = _OBJECT_RE.search(cleaned)
    if not obj_match:
        raise ValueError(
            f"no JSON object found in model output: {text[:200]!r}"
        )
    return json.loads(obj_match.group(0))
