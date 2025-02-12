from httpx import AsyncClient
from unittest.mock import AsyncMock
import pytest
from pytest_mock import MockerFixture

from polar.models import User, MagicLink
from polar.magic_link.service import InvalidMagicLink, magic_link as magic_link_service
from polar.config import settings


@pytest.mark.asyncio
async def test_request(client: AsyncClient, mocker: MockerFixture) -> None:
    magic_link_service_request_mock = mocker.patch.object(
        magic_link_service,
        "request",
        new=AsyncMock(return_value=(MagicLink(), "TOKEN")),
    )
    magic_link_service_send_mock = mocker.patch.object(
        magic_link_service, "send", new=AsyncMock()
    )

    response = await client.post(
        "/api/v1/magic_link/request", json={"email": "user@example.com"}
    )

    assert response.status_code == 202

    assert magic_link_service_request_mock.called
    assert magic_link_service_send_mock.called


@pytest.mark.asyncio
async def test_authenticate_invalid_token(
    client: AsyncClient, mocker: MockerFixture
) -> None:
    magic_link_service_mock = mocker.patch.object(
        magic_link_service, "authenticate", side_effect=InvalidMagicLink()
    )

    response = await client.post(
        "/api/v1/magic_link/authenticate", params={"token": "TOKEN"}
    )

    assert response.status_code == 401
    json = response.json()
    assert json["type"] == "InvalidMagicLink"

    assert magic_link_service_mock.called
    assert magic_link_service_mock.call_args[0][1] == "TOKEN"


@pytest.mark.asyncio
async def test_authenticate_valid_token(
    client: AsyncClient, user: User, mocker: MockerFixture
) -> None:
    magic_link_service_mock = mocker.patch.object(
        magic_link_service, "authenticate", new=AsyncMock(return_value=user)
    )

    response = await client.post(
        "/api/v1/magic_link/authenticate", params={"token": "TOKEN"}
    )

    assert response.status_code == 200
    json = response.json()
    assert json["success"]
    assert json["token"] is None

    assert settings.AUTH_COOKIE_KEY in response.cookies

    assert magic_link_service_mock.called
    assert magic_link_service_mock.call_args[0][1] == "TOKEN"
