from pathlib import Path
import sys
import copy
import pytest
from fastapi.testclient import TestClient

# Ensure the `src` directory is on sys.path so we can import `app`
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

import app as app_module

client = TestClient(app_module.app)


@pytest.fixture(autouse=True)
def restore_activities():
    original = copy.deepcopy(app_module.activities)
    yield
    app_module.activities.clear()
    app_module.activities.update(original)


def test_root_redirect():
    resp = client.get("/", follow_redirects=False)
    assert resp.status_code == 307
    assert resp.headers["location"].endswith("/static/index.html")


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "Tennis Club" in data


def test_signup_success_and_duplicate():
    email = "teststudent@example.com"
    resp = client.post("/activities/Tennis%20Club/signup", params={"email": email})
    assert resp.status_code == 200
    assert email in app_module.activities["Tennis Club"]["participants"]

    # duplicate signup should fail
    resp2 = client.post("/activities/Tennis%20Club/signup", params={"email": email})
    assert resp2.status_code == 400


def test_signup_404():
    resp = client.post("/activities/Nonexistent%20Club/signup", params={"email":"x@x.com"})
    assert resp.status_code == 404
