"""MoodBite backend API tests."""
import os
import re
import pytest
import requests
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Health ----
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert "MoodBite" in r.json().get("message", "")


# ---- Catalog ----
class TestCatalog:
    def test_catalog_shape(self, session):
        r = session.get(f"{API}/catalog", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "foods" in data and "tiffin" in data
        assert len(data["foods"]) >= 20
        assert len(data["tiffin"]) >= 6
        # Structure check
        f = data["foods"][0]
        for k in ["id", "name", "price", "rating", "veg", "tags", "timing"]:
            assert k in f
        t = data["tiffin"][0]
        for k in ["id", "name", "monthly", "meals", "rating", "veg"]:
            assert k in t


# ---- AI Concierge (real LLM) ----
class TestConcierge:
    def test_empty_message_400(self, session):
        r = session.post(f"{API}/concierge", json={"message": "   "}, timeout=30)
        assert r.status_code == 400

    def test_food_budget_recommendation(self, session):
        r = session.post(
            f"{API}/concierge",
            json={"message": "I'm feeling sad and want comfort food under 250"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "session_id" in data and data["session_id"]
        assert isinstance(data.get("reply"), str) and len(data["reply"]) > 5
        recs = data.get("recommendations", [])
        assert 1 <= len(recs) <= 4, f"expected 1-4 recs, got {len(recs)}"
        food_recs = [x for x in recs if x.get("type") == "food"]
        assert len(food_recs) >= 1
        # Budget respected
        for r_ in food_recs:
            assert r_["price"] <= 250, f"food {r_['name']} price {r_['price']} exceeds 250"
            assert r_.get("reason"), "each rec should have a reason"
            assert r_.get("id", "").startswith("f")
            assert r_.get("restaurantId", "").startswith("r")

    def test_tiffin_intent(self, session):
        r = session.post(
            f"{API}/concierge",
            json={"message": "I need affordable home-style food for the next month in my PG"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        recs = data.get("recommendations", [])
        assert len(recs) >= 1
        # At least one tiffin recommendation expected
        tiffins = [x for x in recs if x.get("type") == "tiffin"]
        assert len(tiffins) >= 1, f"expected at least 1 tiffin rec, got recs: {recs}"
        for t in tiffins:
            assert t.get("id", "").startswith("t")
            assert "monthly" in t
            assert t.get("reason")

    def test_session_persistence(self, session):
        r1 = session.post(
            f"{API}/concierge",
            json={"message": "Suggest something cheap and spicy under 150"},
            timeout=90,
        )
        assert r1.status_code == 200
        sid = r1.json()["session_id"]
        r2 = session.post(
            f"{API}/concierge",
            json={"message": "Actually make it non-veg", "session_id": sid},
            timeout=90,
        )
        assert r2.status_code == 200
        assert r2.json()["session_id"] == sid


# ---- Status (existing basic endpoint) ----
class TestStatus:
    def test_create_and_read(self, session):
        r = session.post(f"{API}/status", json={"client_name": "TEST_pytest"}, timeout=15)
        assert r.status_code == 200
        sid = r.json()["id"]
        r2 = session.get(f"{API}/status", timeout=15)
        assert r2.status_code == 200
        ids = [x["id"] for x in r2.json()]
        assert sid in ids
