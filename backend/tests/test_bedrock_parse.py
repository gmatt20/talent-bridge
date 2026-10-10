"""Tests for the JSON extraction in app.ai.bedrock."""

# The parser is private; these tests pin down its tolerance for messy output.
# pylint: disable=protected-access

import pytest

from app.ai import bedrock


def test_plain_json():
    assert bedrock._parse_json('{"a": 1}') == {"a": 1}


def test_strips_think_tag():
    text = '<think>reasoning here</think>\n{"a": 2}'
    assert bedrock._parse_json(text) == {"a": 2}


def test_strips_code_fence():
    text = '```json\n{"a": 3}\n```'
    assert bedrock._parse_json(text) == {"a": 3}


def test_strips_fence_without_lang():
    assert bedrock._parse_json('```\n{"a": 4}\n```') == {"a": 4}


def test_extracts_json_from_prose():
    text = 'Here is the brief: {"a": 5, "b": [1, 2]} hope that helps!'
    assert bedrock._parse_json(text) == {"a": 5, "b": [1, 2]}


def test_raises_when_no_json():
    with pytest.raises(ValueError):
        bedrock._parse_json("just some prose, no object anywhere")
