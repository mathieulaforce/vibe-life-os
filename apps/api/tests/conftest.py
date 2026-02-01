import os
import sys
from pathlib import Path

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:////tmp/lifeos_test.db")
os.environ.setdefault("TESTING", "1")

sys.path.append(str(Path(__file__).resolve().parents[1]))
