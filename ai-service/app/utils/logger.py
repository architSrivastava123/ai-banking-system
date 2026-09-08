import logging
import sys
import re

# Sensitive patterns to scrub
SENSITIVE_PATTERNS = [
    (re.compile(r'bearer\s+[a-zA-Z0-9_\-\.]+', re.IGNORECASE), 'bearer [REDACTED]'),
    (re.compile(r'password["\']?\s*[:=]\s*["\']?[^"\'\s,]+', re.IGNORECASE), 'password: [REDACTED]'),
    (re.compile(r'token["\']?\s*[:=]\s*["\']?[^"\'\s,]+', re.IGNORECASE), 'token: [REDACTED]'),
    (re.compile(r'key["\']?\s*[:=]\s*["\']?[^"\'\s,]+', re.IGNORECASE), 'key: [REDACTED]')
]

class SanitizedFormatter(logging.Formatter):
    def format(self, record):
        message = super().format(record)
        for pattern, replacement in SENSITIVE_PATTERNS:
            message = pattern.sub(replacement, message)
        return message

def setup_logger(name: str = "ai-banking") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        formatter = SanitizedFormatter(
            fmt="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger

logger = setup_logger()
