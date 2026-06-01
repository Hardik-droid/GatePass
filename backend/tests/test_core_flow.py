import unittest

from app.core.store import store
from app.schemas import OrderCreate, OrderLineCreate, ScannerValidate
from app.services.orders import create_order, dev_payment_simulator
from app.services.qr import create_secure_qr_token, verify_qr_token
from app.services.scanner import validate_scan


class GatePassCoreFlowTest(unittest.TestCase):
    def test_qr_token_is_signed_and_opaque(self):
        token = create_secure_qr_token("evt_test", "tkt_test")
        valid, payload, _ = verify_qr_token(token)

        self.assertTrue(valid)
        self.assertEqual(payload["event_id"], "evt_test")
        self.assertNotIn("email", token)
        self.assertNotIn("phone", token)

    def test_purchase_issue_and_duplicate_scan(self):
        event = store.events[0]
        category = next(item for item in store.ticket_categories if item.event_id == event.id)
        order_result = create_order(
            OrderCreate(
                organization_id=event.organization_id,
                event_id=event.id,
                buyer_name="FastAPI Buyer",
                buyer_phone="+919999999999",
                buyer_email="buyer@gatepass.local",
                items=[OrderLineCreate(ticket_category_id=category.id, quantity=1)],
            )
        )
        issued = dev_payment_simulator(order_result["order"].id)
        ticket = issued["tickets"][0]
        token = issued["raw_tokens"][0]

        first = validate_scan(
            ScannerValidate(
                event_id=ticket.event_id,
                gate_id="gate_main",
                device_id="unit-test",
                scanner_user_id="usr_scanner_demo",
                qr_token=token,
            )
        )
        second = validate_scan(
            ScannerValidate(
                event_id=ticket.event_id,
                gate_id="gate_main",
                device_id="unit-test",
                scanner_user_id="usr_scanner_demo",
                qr_token=token,
            )
        )

        self.assertEqual(first["status"], "VALID")
        self.assertEqual(second["status"], "ALREADY_USED")


if __name__ == "__main__":
    unittest.main()
