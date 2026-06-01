from enum import StrEnum
from fastapi import Header
from app.core.errors import AppError


class UserRole(StrEnum):
    OWNER = "OWNER"
    SUPER_ADMIN = "SUPER_ADMIN"
    EVENT_MANAGER = "EVENT_MANAGER"
    FINANCE_MANAGER = "FINANCE_MANAGER"
    SCANNER_STAFF = "SCANNER_STAFF"
    GATE_STAFF = "GATE_STAFF"
    VOLUNTEER = "VOLUNTEER"
    VIEWER = "VIEWER"


ROLE_PERMISSIONS: dict[UserRole, set[str]] = {
    UserRole.OWNER: {"*"},
    UserRole.SUPER_ADMIN: {"*"},
    UserRole.EVENT_MANAGER: {
        "events:write",
        "tickets:write",
        "orders:read",
        "scanner:validate",
        "scanner:lookup",
        "reports:read",
        "dashboard:read",
    },
    UserRole.FINANCE_MANAGER: {"orders:read", "settlements:read", "reports:read", "dashboard:read"},
    UserRole.SCANNER_STAFF: {"scanner:validate", "scanner:lookup"},
    UserRole.GATE_STAFF: {"scanner:validate", "scanner:lookup"},
    UserRole.VOLUNTEER: {"scanner:validate"},
    UserRole.VIEWER: {"dashboard:read"},
}


def role_from_header(x_gatepass_role: str | None = Header(default="OWNER")) -> UserRole:
    try:
        return UserRole(x_gatepass_role or "OWNER")
    except ValueError:
        raise AppError(403, "ACCESS_DENIED", "Unknown GatePass role")


def require_permission(permission: str, role: UserRole) -> None:
    permissions = ROLE_PERMISSIONS[role]
    if "*" not in permissions and permission not in permissions:
        raise AppError(403, "ACCESS_DENIED", "Access denied")
