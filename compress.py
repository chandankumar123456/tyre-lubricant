import os
import zipfile
from pathlib import Path

# ==========================
# CONFIGURATION
# ==========================

# Folder to compress (defaults to the current directory)
PROJECT_DIR = Path(".").resolve()

# Output ZIP file
OUTPUT_ZIP = PROJECT_DIR.parent / f"{PROJECT_DIR.name}.zip"

# Patterns to exclude, similar to .gitignore
EXCLUDE = [
    "GPT Image",
    "Nano Banana Image",
    ".git/",
    "node_modules/",
    ".next/",
    "build/",
    "dist/",
    ".venv/",
    "venv/",
    "__pycache__/",
    ".pytest_cache/",
    ".mypy_cache/",
    ".ruff_cache/",
    "coverage/",
    ".idea/",
    ".vscode/",
    "*.pyc",
    "*.log",
    ".DS_Store",
    "Thumbs.db",
    "test-results"
]

# ==========================
# EXCLUSION LOGIC
# ==========================

def should_exclude(relative_path: Path) -> bool:
    path_str = relative_path.as_posix()
    parts = relative_path.parts

    for pattern in EXCLUDE:
        pattern = pattern.rstrip("/")

        # Directory exclusions apply at any depth
        if pattern in parts:
            return True

        # Wildcard and filename matching
        if relative_path.match(pattern):
            return True

    return False


# ==========================
# ZIP CREATION
# ==========================

def compress_project():
    print(f"Project: {PROJECT_DIR}")
    print(f"Output:  {OUTPUT_ZIP}")
    print("Compressing...\n")

    file_count = 0
    skipped_count = 0

    with zipfile.ZipFile(
        OUTPUT_ZIP,
        mode="w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=6,
    ) as archive:

        for root, dirs, files in os.walk(PROJECT_DIR):
            root_path = Path(root)
            relative_root = root_path.relative_to(PROJECT_DIR)

            # Prune excluded directories before walking into them
            dirs[:] = [
                directory
                for directory in dirs
                if not should_exclude(
                    relative_root / directory
                )
            ]

            for filename in files:
                file_path = root_path / filename
                relative_path = file_path.relative_to(PROJECT_DIR)

                if should_exclude(relative_path):
                    skipped_count += 1
                    continue

                # Avoid including the output ZIP if it is inside the project
                if file_path.resolve() == OUTPUT_ZIP.resolve():
                    continue

                archive.write(
                    file_path,
                    arcname=relative_path.as_posix(),
                )
                file_count += 1

    size_mb = OUTPUT_ZIP.stat().st_size / (1024 * 1024)

    print("Compression complete!")
    print(f"Files included: {file_count}")
    print(f"Files skipped:  {skipped_count}")
    print(f"ZIP size:       {size_mb:.2f} MB")
    print(f"Saved to:       {OUTPUT_ZIP}")


if __name__ == "__main__":
    compress_project()