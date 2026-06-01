from app.core.store import new_id, now, store
from app.schemas import AuditEvent


def log_audit(
    action: str,
    entity_type: str,
    entity_id: str,
    *,
    actor_user_id: str | None = "system",
    actor_role: str = "OWNER",
    organization_id: str | None = None,
    event_id: str | None = None,
    metadata: dict | None = None,
) -> AuditEvent:
    event = AuditEvent(
        id=new_id("audit"),
        actor_user_id=actor_user_id,
        actor_role=actor_role,
        organization_id=organization_id,
        event_id=event_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata=metadata or {},
        created_at=now(),
    )
    store.audit_events.insert(0, event)
    return event
