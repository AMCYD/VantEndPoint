import os
import hashlib
import sys
import subprocess
from typing import Dict, Any

CREATE_NO_WINDOW = 0x08000000 if sys.platform == 'win32' else 0

def calculate_sha256(filepath: str) -> str:
    """Calculates genuine SHA-256 hash of a file with chunked memory-safe reading."""
    if not filepath or not os.path.isfile(filepath):
        return ""
    try:
        hasher = hashlib.sha256()
        with open(filepath, 'rb') as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()
    except Exception:
        return ""

def calculate_md5(filepath: str) -> str:
    """Calculates genuine MD5 hash of a file."""
    if not filepath or not os.path.isfile(filepath):
        return ""
    try:
        hasher = hashlib.md5()
        with open(filepath, 'rb') as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()
    except Exception:
        return ""

def verify_signature(filepath: str) -> Dict[str, Any]:
    """Verifies Microsoft Authenticode signature of an executable."""
    if not filepath or not os.path.isfile(filepath):
        return {'is_signed': False, 'status': 'FileNotFound', 'signer': ''}

    if sys.platform == 'win32':
        try:
            cmd = [
                'powershell', '-NoProfile', '-Command',
                f"(Get-AuthenticodeSignature -FilePath '{filepath}').Status.ToString()"
            ]
            res = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=4,
                creationflags=CREATE_NO_WINDOW
            )
            status = res.stdout.strip()
            is_valid = status == 'Valid'
            return {
                'is_signed': is_valid,
                'status': status or 'Unknown',
                'signer': 'Microsoft Windows' if is_valid else ''
            }
        except Exception:
            pass

    return {'is_signed': False, 'status': 'NotChecked', 'signer': ''}
