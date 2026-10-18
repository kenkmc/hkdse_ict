"""Run the actual Python examples embedded in the programming manual.

Run from any directory with: python tests/manual-programming.py
Only Python's standard library is required. Each example runs in a separate
interpreter and temporary working directory, with its own assertions enabled.
The pseudocode example is text, not an executable Python program.

Sensor, acceleration, voice-confidence and event examples use fixed simulated
data or a stub. Passing these checks verifies the numerical/state model only;
it does not verify a real sensor, microphone, speech service or hardware device.
The BMI and loan examples likewise verify classroom arithmetic models, not
medical interpretation or the terms of a real financial product.
"""

from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "course-manual" / "data" / "programming.json"
EXPECTED_IDS = {
    "chd-1/model-transfer", "chd-1/evidence", "chd-2/arrays",
    "chd-3/state", "chd-3/operators", "chd-3/loops", "chd-3/formulas",
    "chd-4/debug", "ec-1/records", "ec-1/merge", "ec-1/nested",
    "ec-1/parameters", "ec-1/stackqueue", "ec-1/linked", "ec-1/files",
    "ec-1/numeric", "ec-1/quality", "ec-2/features", "ec-2/simulation",
}

# Most detailed examples already contain their own expected results. These
# independent boundary checks cover important gaps, including examples whose
# printed calculations would otherwise execute without verifying the result.
EXTRA_CHECKS = {
    "chd-2/arrays": """
for index, want in [(0, [9, 1, 2]), (2, [1, 2, 9])]:
    sample = [1, 2, None]
    assert insert_item(sample, 2, index, 9) == (3, True)
    assert sample == want
empty = [None]
assert insert_item(empty, 0, 0, 7) == (1, True)
assert delete_item(empty, 1, 0) == (0, True)
assert empty == [None]
""",
    "chd-3/operators": """
assert (quantity // 5, quantity % 5) == (3, 2)
assert (12 + 8) / 4 == 5.0
assert 12 + 8 / 4 == 14.0
""",
    "ec-1/merge": """
from itertools import product
for size in range(5):
    for sample_tuple in product((-1, 0, 1), repeat=size):
        sample = list(sample_tuple)
        before = sample[:]
        ordered = sorted(sample)
        for sort in (bubble, insertion, selection):
            assert sort(sample) == ordered
            assert sample == before, 'sorting example promises a copied result'
        for target in (-2, -1, 0, 1, 2):
            found = binary_search(ordered, target)
            assert (found == -1) == (target not in ordered)
            if found != -1:
                assert ordered[found] == target
            expected_first = sample.index(target) if target in sample else -1
            assert linear_search(sample, target) == expected_first
for left, right in [([], []), ([1], []), ([-1, 0], [-1, 2]), ([2, 2], [2])]:
    assert merge(left, right) == sorted(left + right)
""",
    "ec-1/stackqueue": """
def must_fail(message, operation):
    try:
        operation()
    except ValueError as error:
        assert str(error) == message
    else:
        raise AssertionError('expected ' + message)
full = ['A', 'B', 'C']
must_fail('overflow', lambda: push(full, 2, 'D'))
must_fail('overflow', lambda: enqueue(full, 1, 3, 'D'))
assert full == ['A', 'B', 'C'], 'rejected insertion must not overwrite data'
must_fail('underflow', lambda: pop([None], -1))
""",
    "ec-1/files": """
for malformed in ['S1,60\\nS1,80\\n', 'S1,101\\n', 'S1\\n']:
    try:
        update_csv(malformed, 'append', 'S2', 70)
    except ValueError:
        pass
    else:
        raise AssertionError('malformed input must not produce an updated file')
assert update_csv('"S,1",60\\n', 'amend', 'S,1', 70) == '"S,1",70\\n'
""",
    "ec-1/numeric": """
assert value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP) == Decimal('3.15')
assert value.quantize(Decimal('0.01'), rounding=ROUND_DOWN) == Decimal('3.14')
assert 0.1 + 0.2 != 0.3, 'binary floating point is not exact decimal arithmetic'
assert 1e-300 * 1e-300 == 0.0, 'this example illustrates float underflow'
""",
    "ec-2/simulation": """
assert len(events) == len(expected) == 15, 'zip must not silently skip events'
base = {'enabled': True, 'lamp': True, 'fault': False,
        'last_read': 0, 'last_button': 0}
assert handle(base, (49, 'button', None))['enabled'] is True
assert handle(base, (50, 'button', None))['enabled'] is False
assert handle(base, (500, 'tick', None))['fault'] is False
assert handle(base, (501, 'tick', None))['fault'] is True
for boundary in (30, 40):
    for previous in (False, True):
        prior = dict(base, lamp=previous)
        assert handle(prior, (100, 'light', boundary))['lamp'] is previous
for invalid in (None, True, float('nan'), float('inf'), -1, 101):
    actual = handle(base, (100, 'light', invalid))
    assert actual['lamp'] is False and actual['fault'] is True
assert base['lamp'] is True and base['fault'] is False, 'handle copies its input'
""",
}

# Small examples need their displayed result checked as well as a zero exit code.
EXPECTED_OUTPUT = {
    "chd-1/evidence": "S001 1 ACCEPT\nbad 1 INVALID\nS002 2 ACCEPT\nS003 2 FULL",
    "chd-3/state": "4 5",
    "chd-3/operators": "3 2\n5.0 14.0",
    "chd-3/loops": "10 2",
    "chd-3/formulas": "(40, 80, 60.0, 2)\n1\nFalse\nTrue 0123",
    "ec-1/records": "0012 75 True",
    "ec-1/nested": "[5, 9] 14 6",
    "ec-1/parameters": "[1, 2, 3]",
    "ec-1/files": "S1,70\nS2,80\nr/w/a tests passed",
    "ec-1/numeric": "3.15\n3.14\n0.0",
    "ec-1/quality": "reading 18 lamp True",
    "ec-2/features": "[False, False, True]\nCONFIRM",
}


def examples() -> dict[str, str]:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    result = {}
    for unit in data["units"]:
        for item in unit["sections"] + unit["practice"]:
            code = item.get("code", {})
            if code.get("language", "").lower() != "python":
                continue
            key = unit["id"] + "/" + item["id"]
            if key in result:
                raise ValueError("Duplicate Python example: " + key)
            result[key] = code["text"]
    return result


class ProgrammingExamples(unittest.TestCase):
    def test_actual_manual_examples(self):
        blocks = examples()
        self.assertEqual(set(blocks), EXPECTED_IDS, "Update the inventory when examples change")
        for block_id, source in blocks.items():
            with self.subTest(example=block_id), tempfile.TemporaryDirectory() as folder:
                program = (
                    "import sys\nsys.stdout.reconfigure(encoding='utf-8')\n"
                    + source + "\n" + EXTRA_CHECKS.get(block_id, "")
                )
                result = subprocess.run(
                    [sys.executable, "-I", "-B", "-c", program],
                    cwd=folder, capture_output=True, encoding="utf-8", timeout=10,
                    check=False,
                )
                self.assertEqual(result.returncode, 0, block_id + "\n" + result.stderr)
                if block_id in EXPECTED_OUTPUT:
                    self.assertEqual(result.stdout.strip(), EXPECTED_OUTPUT[block_id])
        print("Checked 19 actual Python examples; sensor/voice/event inputs are simulated.")


if __name__ == "__main__":
    unittest.main(verbosity=2)
