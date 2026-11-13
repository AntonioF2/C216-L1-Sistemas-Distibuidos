import pytest
from fastapi.testclient import TestClient

from backend.main import app


@pytest.mark.parametrize("method", ["GET", "POST", "PUT", "PATCH", "DELETE"])
def test_preflight_origem_permitida(method):
    with TestClient(app) as client:
        response = client.options(
            "/servicos",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": method,
                "Access-Control-Request-Headers": "Content-Type",
            },
        )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_preflight_origem_desconhecida():
    with TestClient(app) as client:
        response = client.options(
            "/servicos",
            headers={
                "Origin": "https://desconhecido.example",
                "Access-Control-Request-Method": "POST",
            },
        )
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers
