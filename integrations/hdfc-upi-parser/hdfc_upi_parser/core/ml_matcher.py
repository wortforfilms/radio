"""Optional ML matcher placeholder.

ML matching is intentionally disabled until model source, training data,
evaluation evidence, and verification status exist.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class MLMatchResult:
    status: str = "blocked"
    score: Optional[float] = None
    reason: str = "ML matcher disabled: model evidence is NULL"


class MLMatcher:
    def match(self, *_args, **_kwargs) -> MLMatchResult:
        return MLMatchResult()

