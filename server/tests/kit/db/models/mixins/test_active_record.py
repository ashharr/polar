import pytest

from polar.kit.db.models.mixins import ActiveRecordMixin
from polar.postgres import AsyncSession
from tests.fixtures.database import TestModel


class ActiveRecord(TestModel, ActiveRecordMixin):
    ...


@pytest.mark.asyncio
async def test_create(session: AsyncSession) -> None:
    created = await ActiveRecord.create(
        session, int_column=234, str_column="Hello world"
    )
    assert created.id is not None
    assert created.str_column == "Hello world"
    await created.delete(session)


@pytest.mark.asyncio
async def test_find(session: AsyncSession) -> None:
    created = await ActiveRecord.create(session)
    retrieved = await ActiveRecord.find(session, created.id)
    assert retrieved is not None
    assert retrieved.id == created.id
    await created.delete(session)


@pytest.mark.asyncio
async def test_find_using_non_id(session: AsyncSession) -> None:
    pseudo_id = 1337
    created = await ActiveRecord.create(session, int_column=pseudo_id)

    retrieved = await ActiveRecord.find(session, pseudo_id, key="int_column")
    assert retrieved is not None
    assert retrieved.id == created.id
    assert retrieved.int_column == created.int_column
    await retrieved.delete(session)


@pytest.mark.asyncio
async def test_find_by(session: AsyncSession) -> None:
    pseudo_id = 1337
    created = await ActiveRecord.create(session, int_column=pseudo_id)

    retrieved = await ActiveRecord.find_by(session, id=created.id, int_column=pseudo_id)
    assert retrieved is not None
    assert retrieved.id == created.id
    assert retrieved.int_column == created.int_column
    await retrieved.delete(session)


@pytest.mark.asyncio
async def test_update(session: AsyncSession) -> None:
    created = await ActiveRecord.create(session)
    assert created is not None
    assert created.id

    assert created.int_column is None
    await created.update(session, int_column=1337, str_column="Hello update")
    assert created.int_column == 1337

    retrieved = await ActiveRecord.find_by(session, int_column=1337)
    assert retrieved is not None
    assert retrieved.int_column == 1337
    assert retrieved.str_column == "Hello update"
    await retrieved.delete(session)


@pytest.mark.asyncio
async def test_fill(session: AsyncSession) -> None:
    instance = ActiveRecord()
    instance.fill(int_column=1337, str_column="New instance")
    assert instance.int_column == 1337
    assert instance.str_column == "New instance"
    assert instance.id is None

    retrieved = await ActiveRecord.find_by(session, int_column=1337)
    assert retrieved is None


@pytest.mark.asyncio
async def test_autocommit_disabled_on_create(session: AsyncSession) -> None:
    created = await ActiveRecord.create(session, autocommit=False, int_column=1337)
    assert created.id is None
    created = await ActiveRecord.create(session, autocommit=True, int_column=1337)
    assert created.id is not None
    await created.delete(session)


@pytest.mark.asyncio
async def test_autocommit_disabled_on_update(session: AsyncSession) -> None:
    created = await ActiveRecord.create(session, int_column=1337)
    assert created.id is not None

    await created.update(session, int_column=404, autocommit=False)
    retrieved = await ActiveRecord.find_by(session, int_column=404)
    assert retrieved is None


@pytest.mark.asyncio
async def test_delete(session: AsyncSession) -> None:
    created = await ActiveRecord.create(session)
    assert created is not None
    assert created.id

    retrieved = await ActiveRecord.find(session, created.id)
    assert retrieved is not None

    await created.delete(session)
    retrieved = await ActiveRecord.find(session, created.id)
    assert retrieved is None
