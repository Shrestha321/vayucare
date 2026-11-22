"""Comprehensive automated test suite for VayuCare API."""

import pytest
from httpx import AsyncClient
from unittest.mock import patch


SAMPLE_PROFILE_PAYLOAD = {
    "city": "New Delhi",
    "neighborhood": "Lajpat Nagar IV",
    "aqi": 380,
    "housing_type": "apartment_low",
    "floor_level": "mid_floor_1_5",
    "household_members": [
        {
            "role": "elderly_senior",
            "has_asthma_or_sensitivity": True,
            "daily_commute": False,
            "notes": "Mild COPD",
        },
        {
            "role": "school_kid",
            "has_asthma_or_sensitivity": False,
            "daily_commute": True,
            "notes": "Primary school",
        },
        {
            "role": "healthy_adult",
            "has_asthma_or_sensitivity": False,
            "daily_commute": True,
            "notes": "Office worker",
        },
    ],
    "commute_mode": "metro_train",
    "cooking_fuel": "piped_natural_gas",
    "heating_source": "electric_oil_convection",
    "has_air_purifier": True,
    "budget_tier": "moderate",
    "special_concerns": "Grandmother experiences morning cough; school child has playground periods.",
}


@pytest.mark.asyncio
async def test_health_check_and_security_headers(client: AsyncClient) -> None:
    """Verify health check endpoint returns 200 and enforces hardened security headers."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "VayuCare API"

    # Verify Hardened Security Headers
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert "geolocation=()" in response.headers["Permissions-Policy"]


@pytest.mark.asyncio
async def test_ready_check(client: AsyncClient) -> None:
    """Verify database readiness probe responds with 200 ready status."""
    response = await client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"


@pytest.mark.asyncio
async def test_scenario_presets_endpoint(client: AsyncClient) -> None:
    """Verify pre-configured scenario presets return valid profiles with realistic data."""
    response = await client.get("/api/presets")
    assert response.status_code == 200
    presets = response.json()
    assert len(presets) >= 4
    preset_ids = [p["id"] for p in presets]
    assert "delhi-severe-420" in preset_ids
    assert "lahore-critical-560" in preset_ids


@pytest.mark.asyncio
async def test_valid_plan_generation_and_caching(client: AsyncClient) -> None:
    """Verify plan generation, schema integrity, persistence, and deterministic caching."""
    # First request: Cache Miss -> Synthetic generation
    response = await client.post("/api/plans/generate", json=SAMPLE_PROFILE_PAYLOAD)
    assert response.status_code == 201
    plan_data = response.json()

    assert "id" in plan_data
    assert "share_slug" in plan_data
    assert plan_data["is_cached"] is False
    assert plan_data["aqi_severity"] == "severe_hazardous"

    # Validate Time Block Routines
    routines = plan_data["daily_routines"]
    assert len(routines) >= 4
    for r in routines:
        assert "time_window" in r
        assert "mechanism" in r
        assert len(r["mechanism"]) > 10
        assert "estimated_pm25_reduction_pct_range" in r
        assert "assumptions" in r
        assert r["confidence_level"] in ("high", "medium", "low")

    # Validate IAQ Room Hacks
    hacks = plan_data["iaq_hacks"]
    assert len(hacks) >= 3
    for h in hacks:
        assert "room_name" in h
        assert "mechanism" in h
        assert "indoor_pm25_drop_pct_range" in h
        assert "assumptions" in h
        assert h["confidence_level"] in ("high", "medium", "low")

    # Validate Sustainable Alternatives
    swaps = plan_data["sustainable_alternatives"]
    assert len(swaps) >= 3
    for s in swaps:
        assert "category" in s
        assert "mechanism" in s
        assert "estimated_emission_cut" in s
        assert "assumptions" in s

    # Validate Overall Impact
    impact = plan_data["overall_impact"]
    assert "estimated_aggregate_pm25_reduction_pct" in impact
    assert len(impact["vulnerable_member_alerts"]) > 0

    # Second request with identical payload: Cache Hit!
    cached_response = await client.post("/api/plans/generate", json=SAMPLE_PROFILE_PAYLOAD)
    assert cached_response.status_code == 201
    cached_data = cached_response.json()
    assert cached_data["is_cached"] is True
    assert cached_data["id"] == plan_data["id"]


@pytest.mark.asyncio
async def test_input_validation_edge_cases(client: AsyncClient) -> None:
    """Verify 422 Unprocessable Entity responses for malformed or invalid inputs."""
    # 1. Negative AQI
    bad_payload_1 = {**SAMPLE_PROFILE_PAYLOAD, "aqi": -15}
    res_1 = await client.post("/api/plans/generate", json=bad_payload_1)
    assert res_1.status_code == 422

    # 2. Oversized AQI (> 999)
    bad_payload_2 = {**SAMPLE_PROFILE_PAYLOAD, "aqi": 1250}
    res_2 = await client.post("/api/plans/generate", json=bad_payload_2)
    assert res_2.status_code == 422

    # 3. Empty city name
    bad_payload_3 = {**SAMPLE_PROFILE_PAYLOAD, "city": ""}
    res_3 = await client.post("/api/plans/generate", json=bad_payload_3)
    assert res_3.status_code == 422

    # 4. Empty household members list
    bad_payload_4 = {**SAMPLE_PROFILE_PAYLOAD, "household_members": []}
    res_4 = await client.post("/api/plans/generate", json=bad_payload_4)
    assert res_4.status_code == 422


@pytest.mark.asyncio
async def test_upstream_gemini_failure_graceful_handling(client: AsyncClient) -> None:
    """Verify that if Gemini client throws an exception, the system falls back safely."""
    with patch("backend.services.gemini_service.genai.Client") as mock_client:
        mock_instance = mock_client.return_value
        mock_instance.aio.models.generate_content.side_effect = TimeoutError("Gemini gateway timeout")

        with patch("backend.services.gemini_service.settings.GEMINI_API_KEY", "test_key_non_empty"):
            payload = {**SAMPLE_PROFILE_PAYLOAD, "city": "Lahore", "aqi": 490}
            response = await client.post("/api/plans/generate", json=payload)
            # Should gracefully fall back to deterministic scientific engine
            assert response.status_code == 201
            data = response.json()
            assert data["profile"]["city"] == "Lahore"
            assert len(data["daily_routines"]) > 0


@pytest.mark.asyncio
async def test_saved_plans_crud_lifecycle(client: AsyncClient) -> None:
    """Verify CRUD endpoints for plans: listing, retrieval by id/slug, favorite toggle, and deletion."""
    # 1. Generate plan to persist
    create_res = await client.post("/api/plans/generate", json=SAMPLE_PROFILE_PAYLOAD)
    assert create_res.status_code == 201
    plan = create_res.json()
    plan_id = plan["id"]
    share_slug = plan["share_slug"]

    # 2. List plans
    list_res = await client.get("/api/plans")
    assert list_res.status_code == 200
    summaries = list_res.json()
    assert len(summaries) >= 1
    assert any(s["id"] == plan_id for s in summaries)

    # 3. Fetch by ID
    get_res = await client.get(f"/api/plans/{plan_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == plan_id

    # 4. Fetch by Share Slug
    slug_res = await client.get(f"/api/plans/share/{share_slug}")
    assert slug_res.status_code == 200
    assert slug_res.json()["id"] == plan_id

    # 5. Toggle favorite
    fav_res = await client.patch(f"/api/plans/{plan_id}/favorite", json={"is_favorite": True})
    assert fav_res.status_code == 200
    assert fav_res.json()["is_favorite"] is True

    # 6. Delete plan
    del_res = await client.delete(f"/api/plans/{plan_id}")
    assert del_res.status_code == 204

    # 7. Verify deletion (404)
    missing_res = await client.get(f"/api/plans/{plan_id}")
    assert missing_res.status_code == 404


@pytest.mark.asyncio
async def test_community_pledges_board(client: AsyncClient) -> None:
    """Verify community pledges creation, listing, filtering, and upvoting."""
    # 1. Create a community pledge
    pledge_in = {
        "author_name": "Rohan Verma",
        "neighborhood": "Koramangala",
        "city": "Bengaluru",
        "action_type": "commute_carpool",
        "title": "Koramangala Tech Corridor EV Carpool",
        "description": "Formed an EV carpool pod for 4 engineers commuting to Electronic City every weekday.",
        "target_reduction_summary": "Saves 120 km daily personal car travel",
    }
    create_res = await client.post("/api/community/pledges", json=pledge_in)
    assert create_res.status_code == 201
    pledge = create_res.json()
    pledge_id = pledge["id"]
    assert pledge["title"] == pledge_in["title"]
    assert pledge["upvotes"] == 1

    # 2. List pledges with city filter
    list_res = await client.get("/api/community/pledges?city=Bengaluru")
    assert list_res.status_code == 200
    pledges = list_res.json()
    assert any(p["id"] == pledge_id for p in pledges)

    # 3. Upvote the pledge
    upvote_res = await client.post(f"/api/community/pledges/{pledge_id}/upvote")
    assert upvote_res.status_code == 200
    assert upvote_res.json()["upvotes"] == 2
