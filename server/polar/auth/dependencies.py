from typing import Self
from uuid import UUID

from fastapi import Depends, HTTPException, Request

from polar.authz.service import Anonymous, Subject
from polar.enums import Platforms
from polar.models import Organization, Repository, User
from polar.organization.service import organization as organization_service
from polar.postgres import AsyncSession, get_db_session

from .service import AuthService


async def current_user_optional(
    request: Request,
    session: AsyncSession = Depends(get_db_session),
) -> User | None:
    return await AuthService.get_user_from_request(session, request=request)


async def current_user_required(
    user: User | None = Depends(current_user_optional),
) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


class Auth:
    def __init__(
        self,
        *,
        subject: Subject,
        user: User | None = None,
        organization: Organization | None = None,
        repository: Repository | None = None,
    ):
        self.subject = subject
        self.user = user
        self._organization = organization
        self._repository = repository

    @property
    def organization(self) -> Organization:
        if self._organization:
            return self._organization

        raise AttributeError(
            "No organization set. Use Auth.current_user_with_org_access()."
        )

    @property
    def repository(self) -> Repository:
        if self._repository:
            return self._repository

        raise AttributeError(
            "No repository set. Use Auth.current_user_with_org_and_repo_access()."
        )

    ###############################################################################
    # FastAPI dependency methods
    ###############################################################################

    @classmethod
    async def current_user(cls, user: User = Depends(current_user_required)) -> Self:
        return cls(subject=user, user=user)

    @classmethod
    async def optional_user(
        cls, user: User | None = Depends(current_user_optional)
    ) -> Self:
        if user:
            return cls(subject=user, user=user)
        else:
            return cls(subject=Anonymous())

    @classmethod
    async def user_with_org_access(
        cls,
        *,
        platform: Platforms,
        org_name: str,
        session: AsyncSession = Depends(get_db_session),
        user: User = Depends(current_user_required),
    ) -> Self:
        organization = await organization_service.get_for_user(
            session,
            platform=platform,
            org_name=org_name,
            user_id=user.id,
        )
        if not organization:
            raise HTTPException(
                status_code=404, detail="Organization not found for user"
            )
        return cls(subject=user, user=user, organization=organization)

    @classmethod
    async def user_with_org_access_by_id(
        cls,
        *,
        id: UUID,
        session: AsyncSession = Depends(get_db_session),
        user: User = Depends(current_user_required),
    ) -> Self:
        organization = await organization_service.get_by_id_for_user(
            session,
            org_id=id,
            user_id=user.id,
        )
        if not organization:
            raise HTTPException(
                status_code=404, detail="Organization not found for user"
            )
        return cls(subject=user, user=user, organization=organization)

    @classmethod
    async def user_with_org_and_repo_access(
        cls,
        *,
        platform: Platforms,
        org_name: str,
        repo_name: str,
        session: AsyncSession = Depends(get_db_session),
        user: User = Depends(current_user_required),
    ) -> Self:
        org, repo = await organization_service.get_with_repo_for_user(
            session,
            platform=platform,
            org_name=org_name,
            repo_name=repo_name,
            user_id=user.id,
        )
        return cls(subject=user, user=user, organization=org, repository=repo)

    @classmethod
    async def backoffice_user(
        cls,
        *,
        user: User = Depends(current_user_required),
    ) -> Self:
        allowed = ["zegl", "birkjernstrom", "hult", "petterheterjag"]

        if user.username not in allowed:
            raise HTTPException(
                status_code=404,
                detail="Not Found",
            )

        return cls(subject=user, user=user)
