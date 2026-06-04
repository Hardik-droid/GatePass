from datetime import datetime
from enum import StrEnum
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EventStatus(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"


class Visibility(StrEnum):
    PUBLIC = "public"
    PRIVATE = "private"


class TicketStatus(StrEnum):
    ISSUED = "issued"
    CHECKED_IN = "checked_in"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    EXPIRED = "expired"


class OrderStatus(StrEnum):
    PAYMENT_PENDING = "payment_pending"
    PAID = "paid"
    TICKET_ISSUED = "ticket_issued"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class ScanState(StrEnum):
    VALID = "VALID"
    ALREADY_USED = "ALREADY_USED"
    INVALID = "INVALID"
    WRONG_EVENT = "WRONG_EVENT"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"
    EXPIRED = "EXPIRED"
    OUTSIDE_GEOFENCE = "OUTSIDE_GEOFENCE"


class Geofence(BaseModel):
    center_lat: float
    center_lng: float
    radius_meters: float = Field(gt=0)


class Organization(BaseModel):
    id: str
    name: str
    type: str = "organizer"
    owner_user_id: str = "usr_owner_demo"
    contact_email: str | None = None
    contact_phone: str | None = None
    created_at: datetime


class Event(BaseModel):
    id: str
    organization_id: str
    title: str
    slug: str
    description: str | None = None
    event_type: str
    venue: str
    city: str | None = None
    start_time: datetime
    end_time: datetime
    status: EventStatus = EventStatus.DRAFT
    visibility: Visibility = Visibility.PRIVATE
    capacity: int
    gps_required: bool = False
    geofence: Geofence | None = None
    created_at: datetime


class TicketCategory(BaseModel):
    id: str
    organization_id: str
    event_id: str
    name: str
    description: str | None = None
    price_paisa: int = 0
    currency: str = "INR"
    capacity: int
    sold_count: int = 0
    status: str = "active"
    created_at: datetime


class OrderItem(BaseModel):
    id: str
    order_id: str
    ticket_category_id: str
    quantity: int
    unit_price_paisa: int


class Order(BaseModel):
    id: str
    organization_id: str
    event_id: str
    buyer_name: str
    buyer_phone: str
    buyer_email: str | None = None
    gross_amount_paisa: int
    platform_fee_paisa: int
    gateway_fee_paisa: int
    net_amount_paisa: int
    payment_status: str = "pending"
    payment_mode: str = "dev_simulator"
    status: OrderStatus
    created_at: datetime


class Ticket(BaseModel):
    id: str
    organization_id: str
    event_id: str
    order_id: str
    ticket_category_id: str
    attendee_name: str
    attendee_phone: str
    attendee_email: str | None = None
    status: TicketStatus = TicketStatus.ISSUED
    issued_at: datetime | None = None
    checked_in_at: datetime | None = None
    checked_in_gate_id: str | None = None
    checked_in_by: str | None = None
    google_wallet_object_id: str | None = None
    wallet_added_at: datetime | None = None
    qr_token_hash: str | None = None
    expires_at: datetime | None = None
    used_at: datetime | None = None
    used_by_scanner_id: str | None = None
    created_at: datetime


class TicketToken(BaseModel):
    id: str
    ticket_id: str
    event_id: str
    token_hash: str
    created_at: datetime


class Payment(BaseModel):
    id: str
    order_id: str
    provider: str
    status: str
    amount_paisa: int
    currency: str = "INR"
    gateway_order_id: str | None = None
    gateway_payment_id: str | None = None
    created_at: datetime


class ScanLog(BaseModel):
    id: str
    event_id: str
    ticket_id: str | None
    scanner_user_id: str
    gate_id: str
    device_id: str
    scan_result: ScanState
    metadata: dict = Field(default_factory=dict)
    reason: str | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    scan_time: datetime


class NotificationOutbox(BaseModel):
    id: str
    type: str
    recipient_email: str | None = None
    recipient_phone: str | None = None
    subject: str | None = None
    html: str | None = None
    text: str | None = None
    status: str = "queued"
    provider: str | None = None
    provider_message_id: str | None = None
    attempts: int = 0
    last_error: str | None = None
    related_order_id: str | None = None
    related_ticket_id: str | None = None
    created_at: datetime
    sent_at: datetime | None = None


class AuditEvent(BaseModel):
    id: str
    actor_user_id: str | None = None
    actor_role: str = "OWNER"
    organization_id: str | None = None
    event_id: str | None = None
    action: str
    entity_type: str
    entity_id: str
    metadata: dict = Field(default_factory=dict)
    created_at: datetime


class GatepassRequest(BaseModel):
    id: str
    requester_user_id: str
    organization_id: str
    reason: str
    destination: str
    emergency: bool = False
    gps_permission_status: str = "unknown"
    approval_status: str = "pending"
    workflow_status: str = "requested"
    created_at: datetime


class GpsLocationLog(BaseModel):
    id: str
    user_id: str
    gatepass_request_id: str | None = None
    lat: float
    lng: float
    accuracy: float | None = None
    status: str
    metadata: dict = Field(default_factory=dict)
    created_at: datetime


class OrganizationCreate(BaseModel):
    name: str = Field(min_length=2)
    type: str = Field(min_length=2)
    owner_user_id: str = "usr_owner_demo"
    contact_email: EmailStr | None = None
    contact_phone: str | None = None


class EventCreate(BaseModel):
    organization_id: str
    title: str = Field(min_length=3)
    description: str | None = None
    event_type: str
    venue: str
    city: str | None = None
    start_time: datetime
    end_time: datetime
    visibility: Visibility = Visibility.PRIVATE
    capacity: int = Field(gt=0)


class TicketCategoryCreate(BaseModel):
    organization_id: str
    event_id: str
    name: str = Field(min_length=2)
    price_paisa: int = Field(ge=0)
    capacity: int = Field(gt=0)


class OrderLineCreate(BaseModel):
    ticket_category_id: str
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    organization_id: str
    event_id: str
    buyer_name: str = Field(min_length=2)
    buyer_phone: str = Field(min_length=8)
    buyer_email: EmailStr | None = None
    items: list[OrderLineCreate] = Field(min_length=1)


class ScannerValidate(BaseModel):
    event_id: str
    gate_id: str
    device_id: str
    scanner_user_id: str
    qr_token: str = Field(min_length=12)


class GatepassRequestCreate(BaseModel):
    requester_user_id: str = "usr_owner_demo"
    organization_id: str
    reason: str
    destination: str
    emergency: bool = False


class GpsLocationCreate(BaseModel):
    user_id: str = "usr_owner_demo"
    gatepass_request_id: str | None = None
    lat: float
    lng: float
    accuracy: float | None = None
    geofence: Geofence | None = None


class ApiResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
