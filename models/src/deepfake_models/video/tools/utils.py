import logging
from pathlib import Path

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

def check_idempotency(path: Path) -> bool:
    """Returns True if the file exists and is not empty."""
    return path.exists() and path.stat().st_size > 0
