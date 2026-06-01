from math import asin, cos, radians, sin, sqrt
from app.core.store import new_id, now, store
from app.schemas import GatepassRequest, GatepassRequestCreate, GpsLocationCreate, GpsLocationLog
from app.services.audit import log_audit


def distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    radius = 6371000
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2) ** 2
    return 2 * radius * asin(sqrt(a))


def create_gatepass_request(payload: GatepassRequestCreate) -> GatepassRequest:
    request = GatepassRequest(
        id=new_id("gpr"),
        requester_user_id=payload.requester_user_id,
        organization_id=payload.organization_id,
        reason=payload.reason,
        destination=payload.destination,
        emergency=payload.emergency,
        created_at=now(),
    )
    store.gatepass_requests.insert(0, request)
    log_audit("gatepass.requested", "gatepass_request", request.id, actor_user_id=request.requester_user_id, organization_id=request.organization_id)
    return request


def log_location(payload: GpsLocationCreate) -> GpsLocationLog:
    status = "inside"
    metadata = {}
    if payload.geofence:
        distance = distance_meters(payload.lat, payload.lng, payload.geofence.center_lat, payload.geofence.center_lng)
        status = "inside" if distance <= payload.geofence.radius_meters else "outside"
        metadata = {"distance_meters": round(distance), "radius_meters": payload.geofence.radius_meters}
    log = GpsLocationLog(
        id=new_id("gps"),
        user_id=payload.user_id,
        gatepass_request_id=payload.gatepass_request_id,
        lat=payload.lat,
        lng=payload.lng,
        accuracy=payload.accuracy,
        status=status,
        metadata=metadata,
        created_at=now(),
    )
    store.gps_location_logs.insert(0, log)
    if status == "outside":
        log_audit("gps.outside_geofence", "gps_location_log", log.id, actor_user_id=payload.user_id, metadata=metadata)
    return log
