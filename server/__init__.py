# This file is intentionally empty to mark this directory as a Python package

web: playwright install chromium && gunicorn server.server:app
