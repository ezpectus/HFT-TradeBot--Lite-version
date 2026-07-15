"""Exchange Simulator nested package — additional modules.

Module registration is handled by the root exchange_simulator/__init__.py.
This package just ensures its directory is on sys.path for direct imports.
"""
import os
import sys

_self_dir = os.path.dirname(os.path.abspath(__file__))
if _self_dir not in sys.path:
    sys.path.insert(0, _self_dir)

__version__ = "1.0.0"
