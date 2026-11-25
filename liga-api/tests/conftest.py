from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from liga_api.main import app


@pytest.fixture
def cliente_api() -> Iterator[TestClient]:
    with TestClient(app) as cliente:
        yield cliente
