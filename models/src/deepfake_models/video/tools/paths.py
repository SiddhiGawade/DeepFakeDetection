from pathlib import Path

def get_repo_root() -> Path:
    # Resolves to repo root from: models/src/deepfake_models/video/tools/paths.py
    # This assumes models is a top-level directory in the git repository.
    return Path(__file__).resolve().parents[5]

def get_data_root() -> Path:
    return get_repo_root() / "data"

def get_faceforensics_root() -> Path:
    return get_data_root() / "raw" / "video" / "faceforensicspp"

def ensure_directory(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path
