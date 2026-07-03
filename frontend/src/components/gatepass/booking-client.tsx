"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Gift,
  Building2,
  Smartphone,
  ChevronRight,
  Check,
  Info,
  Ticket,
  ChevronDown,
} from "lucide-react";
import { WalletSmartRedirect } from "@/components/gatepass/wallet-actions";
import { useSearchParams } from "next/navigation";


type EventDto = {
  id: string;
  organizationId: string;
  title: string;
  venue: string;
  startTime: string;
  slug?: string;
};

type CategoryDto = {
  id: string;
  name: string;
  pricePaisa: number;
  capacity: number;
};

type IssuedTicket = {
  id: string;
  attendeeName: string;
  ticketCategoryId: string;
};

const bankList = [
  { id: "sbi", name: "State Bank of India", logo: "🏛️" },
  { id: "hdfc", name: "HDFC Bank", logo: "🏦" },
  { id: "icici", name: "ICICI Bank", logo: "💳" },
  { id: "axis", name: "Axis Bank", logo: "🪙" },
  { id: "kotak", name: "Kotak Mahindra Bank", logo: "💰" },
];

const walletList = [
  { id: "paytm", name: "Paytm", logo: "📱" },
  { id: "phonepe", name: "PhonePe", logo: "🟣" },
  { id: "gpay", name: "Google Pay", logo: "🔵" },
  { id: "amazon", name: "Amazon Pay", logo: "🟠" },
];

type PaymentTab = "upi" | "card" | "wallet" | "voucher" | "netbanking" | "paylater" | "points";

const paymentTabs: { id: PaymentTab; name: string; icon: typeof Smartphone }[] = [
  { id: "upi", name: "Pay by any UPI App", icon: Smartphone },
  { id: "card", name: "Debit/Credit Card", icon: CreditCard },
  { id: "wallet", name: "Mobile Wallets", icon: Wallet },
  { id: "voucher", name: "Gift Voucher", icon: Gift },
  { id: "netbanking", name: "Net Banking", icon: Building2 },
  { id: "paylater", name: "Pay Later", icon: Info },
  { id: "points", name: "Redeem Points", icon: Ticket },
];

export function BookingClient({
  event,
  categories,
}: {
  event: EventDto;
  categories: CategoryDto[];
}) {
  const isDevCheckout = process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === "true";
  const searchParams = useSearchParams();
  const requestedCategoryId = searchParams.get("category");
  const initialCategoryId =
    requestedCategoryId && categories.some((category) => category.id === requestedCategoryId)
      ? requestedCategoryId
      : categories[0]?.id ?? "";
  const [categoryId, setCategoryId] = useState(initialCategoryId);

  const [quantity, setQuantity] = useState(2);
  const [buyerName, setBuyerName] = useState("Aarav Mehta");
  const [buyerEmail, setBuyerEmail] = useState("dev@gatepass.local");
  const [buyerPhone, setBuyerPhone] = useState("+919000000000");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    tickets: IssuedTicket[];
  } | null>(null);
  const [error, setError] = useState("");

  // Payment UI states
  const [activePaymentTab, setActivePaymentTab] = useState<PaymentTab>("upi");
  const [giveDonation, setGiveDonation] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [showUpiQr, setShowUpiQr] = useState(false);

  // Contact info edit state
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [tempName, setTempName] = useState(buyerName);
  const [tempEmail, setTempEmail] = useState(buyerEmail);
  const [tempPhone, setTempPhone] = useState(buyerPhone);
  const [tempState] = useState("Punjab");

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Offers state
  const [voucherCode, setVoucherCode] = useState("");
  const [isVoucherApplied, setIsVoucherApplied] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [showOffers, setShowOffers] = useState(false);

  const selected = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );

  const basePrice = useMemo(() => {
    return ((selected?.pricePaisa ?? 0) * quantity) / 100;
  }, [selected, quantity]);

  const convenienceFee = useMemo(() => {
    return quantity * 40.12;
  }, [quantity]);

  const donationAmount = useMemo(() => {
    return giveDonation ? quantity * 1.00 : 0;
  }, [giveDonation, quantity]);

  const discountAmount = useMemo(() => {
    return isVoucherApplied ? voucherDiscount : 0;
  }, [isVoucherApplied, voucherDiscount]);

  const finalTotal = useMemo(() => {
    return Math.max(0, basePrice + convenienceFee + donationAmount - discountAmount);
  }, [basePrice, convenienceFee, donationAmount, discountAmount]);

  async function bookPass() {
    if (!categoryId) {
      setError("Choose a ticket category first.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const idempotencyKey = crypto.randomUUID();
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({
          organizationId: event.organizationId,
          eventId: event.id,
          buyerName,
          buyerEmail,
          buyerPhone,
          items: [{ ticketCategoryId: categoryId, quantity }],
        }),
      });
      const orderPayload = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderPayload.message ?? "Order failed");

      if (isDevCheckout) {
        const confirmResponse = await fetch(`/api/orders/${orderPayload.order.id}/manual-confirm`, {
          method: "POST",
        });
        const confirmPayload = await confirmResponse.json();
        if (!confirmResponse.ok) {
          throw new Error(confirmPayload.message ?? "Dev checkout failed");
        }
        setResult({ tickets: confirmPayload.tickets ?? [] });
        return;
      }

      const paymentResponse = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: orderPayload.order.id, currency: "INR" }),
      });
      const paymentPayload = await paymentResponse.json();
      if (!paymentResponse.ok) {
        throw new Error(paymentPayload.message ?? "Payment gateway unavailable");
      }
      throw new Error("Secure payment checkout is not configured for this deployment.");
    } catch (bookingError) {
      setError(
        bookingError instanceof Error
          ? bookingError.message
          : "Unable to book pass",
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Ticket QR image component ─────────────────────────────────────────────
  function TicketQrImage({ ticketId }: { ticketId: string }) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [qrError, setQrError] = useState(false);

    useEffect(() => {
      let cancelled = false;
      setQrDataUrl(null);
      setQrError(false);
      fetch(`/api/tickets/${ticketId}/qr`)
        .then((res) => {
          if (!res.ok) throw new Error("QR unavailable");
          return res.json() as Promise<{ qrDataUrl?: string }>;
        })
        .then((payload) => {
          if (!cancelled && payload.qrDataUrl) setQrDataUrl(payload.qrDataUrl);
          else if (!cancelled) setQrError(true);
        })
        .catch(() => { if (!cancelled) setQrError(true); });
      return () => { cancelled = true; };
    }, [ticketId]);

    if (qrError) {
      return (
        <div className="w-36 h-36 flex items-center justify-center text-xs text-gray-400 text-center">
          QR unavailable — open Digital Pass
        </div>
      );
    }
    if (!qrDataUrl) {
      return (
        <div className="w-36 h-36 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={qrDataUrl} alt={`GatePass QR for ${ticketId}`} width={144} height={144} className="w-36 h-36" />
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  if (result) {
    return (
      <div className="min-h-screen bg-[#f2f5f9] py-12 px-4 flex justify-center items-center font-sans text-gray-800">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-emerald-500 text-white py-6 px-6 text-center">
            <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <Check className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold">Booking Confirmed!</h2>
            <p className="text-xs text-white/80 mt-1">Your tickets are ready and emailed to {buyerEmail}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="border-b border-dashed border-gray-200 pb-4 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Show this QR code at entry</span>
              <div className="my-4 flex flex-col items-center gap-4">
                {result.tickets.map((ticket) => {
                  const link = `/app/pass/${ticket.id}`;
                  return (
                    <div key={ticket.id} className="w-full flex flex-col items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm mb-2">
                        <TicketQrImage ticketId={ticket.id} />
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium mb-1">Ticket: {ticket.id}</p>
                      <Link
                        href={link}
                        className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1"
                      >
                        Open Digital GatePass QR
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Event</span>
                <span className="font-bold text-gray-800">{event.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Venue</span>
                <span className="font-medium text-gray-700">{event.venue}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                <span className="text-gray-400">Tickets Purchased</span>
                <span className="font-bold text-gray-800">{quantity}x {selected?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Paid</span>
                <span className="font-extrabold text-rose-600 text-base">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {result.tickets[0] ? (
              <div className="pt-2">
                <WalletSmartRedirect ticketId={result.tickets[0].id} />
              </div>
            ) : null}

            <div className="pt-4 flex gap-3">
              <Link
                href="/"
                className="flex-1 text-center bg-rose-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-rose-600 shadow-md shadow-rose-500/10 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f5f9] text-[#1a1a1a] font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl flex items-center gap-4 text-[#1a1a1a]">
          <Link href="/explore" className="hover:text-rose-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-base md:text-lg font-bold flex items-center gap-2">
              {event.title} <span className="text-[10px] text-gray-500 border border-gray-300 rounded px-1 py-0.5">UA16+</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {event.venue} | {new Date(event.startTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(event.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Payment Options Card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[480px]">
          {/* Tabs Menu (Left Side) */}
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 bg-[#f9fafc]">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Payment Options</h2>
            </div>
            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar">
              {paymentTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activePaymentTab === tab.id;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActivePaymentTab(tab.id)}
                    className={`flex items-center gap-3 px-5 py-4 text-left text-xs font-bold transition-all border-b md:border-b-0 border-gray-100 whitespace-nowrap md:whitespace-normal w-full shrink-0 ${isActive
                      ? "border-l-4 border-rose-500 bg-white text-rose-600"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <TabIcon className={`h-4 w-4 shrink-0 ${isActive ? "text-rose-500" : "text-gray-400"}`} />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Panel (Right Side) */}
          <div className="flex-1 p-6 md:p-8 bg-white">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                {activePaymentTab === "upi" && "Pay by any UPI App"}
                {activePaymentTab === "card" && "Debit/Credit Card"}
                {activePaymentTab === "wallet" && "Mobile Wallets"}
                {activePaymentTab === "voucher" && "Gift Voucher / Promo Code"}
                {activePaymentTab === "netbanking" && "Net Banking"}
                {activePaymentTab === "paylater" && "Pay Later"}
                {activePaymentTab === "points" && "Redeem Reward Points"}
              </h3>
            </div>

            {/* UPI Panel */}
            {activePaymentTab === "upi" && (
              <div className="space-y-4">
                <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Scan QR code</p>
                      <p className="text-xs text-gray-400">You need to have a registered UPI ID</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUpiQr(!showUpiQr)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100/50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
                  >
                    {showUpiQr ? "Hide QR" : "Show QR"}
                  </button>
                </div>

                {showUpiQr && (
                  <div className="flex flex-col items-center bg-gray-50 border border-gray-100 rounded-xl p-4 text-center space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                      <svg className="w-32 h-32" viewBox="0 0 100 100">
                        <path d="M5,5 h20 M5,5 v20 M95,5 h-20 M95,5 v20 M5,95 h20 M5,95 v-20 M95,95 h-20 M95,95 v-20" stroke="#f43f5e" strokeWidth="4" fill="none" />
                        <rect x="15" y="15" width="15" height="15" fill="#f43f5e" />
                        <rect x="70" y="15" width="15" height="15" fill="#f43f5e" />
                        <rect x="15" y="70" width="15" height="15" fill="#f43f5e" />
                        <rect x="40" y="40" width="20" height="20" fill="#f43f5e" />
                        <rect x="45" y="20" width="10" height="10" fill="#f43f5e" />
                        <rect x="20" y="45" width="10" height="10" fill="#f43f5e" />
                        <rect x="70" y="45" width="10" height="10" fill="#f43f5e" />
                        <rect x="45" y="70" width="10" height="10" fill="#f43f5e" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Scan using GPay, PhonePe, Paytm, or BHIM</p>
                    <button
                      type="button"
                      onClick={bookPass}
                      disabled={loading}
                      className="w-full bg-rose-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm hover:bg-rose-600 disabled:opacity-50 transition-colors shadow-md shadow-rose-500/10"
                    >
                      {loading ? "Confirming..." : "Simulate QR Scan Success"}
                    </button>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Or enter UPI ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="example@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="flex-1 text-sm border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={bookPass}
                      disabled={loading || !upiId.trim()}
                      className="bg-rose-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-rose-600 disabled:opacity-50 transition-colors shadow-md shadow-rose-500/10"
                    >
                      {loading ? "Paying..." : "Pay"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cards Panel */}
            {activePaymentTab === "card" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-rose-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Expiry (MM/YY)"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                      className="text-sm border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-rose-500"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="text-sm border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-rose-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Name on Card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-rose-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={bookPass}
                  disabled={loading || cardNumber.length < 16 || cardCvv.length < 3}
                  className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-rose-600 disabled:opacity-50 transition-colors shadow-md shadow-rose-500/10"
                >
                  {loading ? "Paying..." : `Pay ₹${finalTotal.toFixed(2)}`}
                </button>
              </div>
            )}

            {/* Mobile Wallets */}
            {activePaymentTab === "wallet" && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Wallet</p>
                <div className="grid grid-cols-2 gap-2">
                  {walletList.map((wallet) => (
                    <button
                      type="button"
                      key={wallet.id}
                      onClick={bookPass}
                      disabled={loading}
                      className="flex items-center gap-3 border border-gray-200 hover:border-rose-500 hover:bg-rose-50/10 rounded-xl p-3 text-left transition-all"
                    >
                      <span className="text-2xl">{wallet.logo}</span>
                      <span className="text-sm font-semibold text-gray-700">{wallet.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gift Voucher / Promo Codes */}
            {activePaymentTab === "voucher" && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Apply Voucher or Promo Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Voucher Code (e.g. GET50)"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="flex-1 text-sm border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (voucherCode === "GET50") {
                        setIsVoucherApplied(true);
                        setVoucherDiscount(50);
                      } else {
                        alert("Invalid Voucher Code!");
                      }
                    }}
                    className="bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-rose-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {isVoucherApplied && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center text-xs text-emerald-800">
                    <span>Voucher applied: GET50</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">-₹50.00</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsVoucherApplied(false);
                          setVoucherDiscount(0);
                        }}
                        className="text-red-500 font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Net Banking */}
            {activePaymentTab === "netbanking" && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Popular Banks</p>
                <div className="grid grid-cols-2 gap-2">
                  {bankList.map((bank) => (
                    <button
                      type="button"
                      key={bank.id}
                      onClick={bookPass}
                      disabled={loading}
                      className="flex items-center gap-3 border border-gray-200 hover:border-rose-500 hover:bg-rose-50/10 rounded-xl p-3 text-left transition-all"
                    >
                      <span className="text-xl">{bank.logo}</span>
                      <span className="text-xs font-semibold text-gray-700">{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pay Later */}
            {activePaymentTab === "paylater" && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pay Later Options</p>
                <div className="space-y-2">
                  {[
                    { id: "simpl", name: "Simpl", logo: "🟢", desc: "Pay in 3 interest-free installments" },
                    { id: "lazypay", name: "LazyPay", logo: "💳", desc: "Pay next month, no extra fee" }
                  ].map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      onClick={bookPass}
                      disabled={loading}
                      className="w-full flex items-center justify-between border border-gray-200 hover:border-rose-500 hover:bg-rose-50/10 rounded-xl p-3 text-left transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{option.logo}</span>
                        <div>
                          <p className="text-sm font-bold text-gray-700">{option.name}</p>
                          <p className="text-xs text-gray-400">{option.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Redeem Points */}
            {activePaymentTab === "points" && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Redeem Reward Points</p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Available Points</span>
                    <span className="font-bold text-gray-800">420 Points (₹42.00)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      id="redeem-all"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setIsVoucherApplied(true);
                          setVoucherDiscount(42);
                        } else {
                          setIsVoucherApplied(false);
                          setVoucherDiscount(0);
                        }
                      }}
                      className="rounded text-rose-500 focus:ring-rose-500"
                    />
                    <label htmlFor="redeem-all" className="font-medium text-gray-600 cursor-pointer">
                      Redeem all 420 points for ₹42.00 discount
                    </label>
                  </div>
                </div>
              </div>
            )}

            {error ? <p className="text-xs font-bold text-red-500 mt-4">{error}</p> : null}
          </div>
        </div>

        {/* Right Column: Checkout Summary */}
        <div className="space-y-4">
          {/* Ticket Detail Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold text-lg text-gray-800 leading-tight">{event.title}</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(event.startTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} | {new Date(event.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 border border-rose-200 bg-rose-50/50 rounded px-1.5 py-0.5 mt-2">
                  🎟️ M-Ticket
                </span>
              </div>
              <span className="text-xl font-extrabold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                {quantity}
              </span>
            </div>

            {/* Category / Quantity selectors */}
            <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-3">
              <div>
                <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Ticket Category</span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="text-xs font-bold text-gray-700 bg-transparent border-none p-0 focus:ring-0 outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (₹{c.pricePaisa / 100})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 rounded"
                >
                  -
                </button>
                <span className="text-xs font-bold text-gray-800 px-1">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(6, q + 1))}
                  className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 rounded"
                >
                  +
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 font-medium">{event.venue}</p>
          </div>

          {/* Cancellation Policy Banner */}
          <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 text-[11px] text-orange-800 leading-normal flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <div>
              <p className="font-bold">Cancellation Unavailable</p>
              <p className="text-orange-600/80">This venue does not support booking cancellation.</p>
            </div>
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between text-xs text-gray-600 font-medium">
              <span>Ticket(s) Price</span>
              <span className="font-bold text-gray-800">₹{basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 font-medium">
              <span className="flex items-center gap-1">
                Convenience fees
                <span className="cursor-help text-gray-400 hover:text-gray-500" title="Includes Booking fee & GST">ℹ️</span>
              </span>
              <span className="font-bold text-gray-800">₹{convenienceFee.toFixed(2)}</span>
            </div>

            {/* Donation */}
            <div className="flex justify-between items-start bg-rose-50/20 border border-dashed border-rose-100 rounded-lg p-2.5 text-xs">
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="charity"
                  checked={giveDonation}
                  onChange={(e) => setGiveDonation(e.target.checked)}
                  className="mt-0.5 rounded text-rose-500 focus:ring-rose-500"
                />
                <div>
                  <label htmlFor="charity" className="font-semibold text-gray-700 cursor-pointer">
                    Give to Underprivileged Musicians
                  </label>
                  <span className="text-[9px] text-gray-400 block mt-0.5">
                    (₹1 per ticket) <span className="underline cursor-pointer">VIEW T&C</span>
                  </span>
                </div>
              </div>
              <span className="font-bold text-rose-600">₹{(quantity * 1.0).toFixed(2)}</span>
            </div>

            {isVoucherApplied && (
              <div className="flex justify-between text-xs text-emerald-600 font-medium">
                <span>Discount Applied</span>
                <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-bold text-gray-800">
              <span>Order Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">For Sending Booking Details</span>
              {!isEditingContact && (
                <button
                  type="button"
                  onClick={() => {
                    setTempName(buyerName);
                    setTempEmail(buyerEmail);
                    setTempPhone(buyerPhone);
                    setIsEditingContact(true);
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingContact ? (
              <div className="space-y-2 mt-1">
                <input
                  type="text"
                  placeholder="Name"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-rose-500 outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-rose-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-rose-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBuyerName(tempName);
                      setBuyerEmail(tempEmail);
                      setBuyerPhone(tempPhone);
                      setIsEditingContact(false);
                    }}
                    className="bg-rose-500 text-white font-bold text-[10px] rounded px-3 py-1 hover:bg-rose-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingContact(false)}
                    className="bg-gray-100 text-gray-600 font-bold text-[10px] rounded px-3 py-1 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-700 font-medium">
                <p className="font-semibold">{buyerName}</p>
                <p>{buyerPhone} | {buyerEmail}</p>
                <p className="text-gray-400 mt-1 text-[10px]">State: {tempState} (for GST purposes)</p>
              </div>
            )}
          </div>

          {/* Offers Collapsible Header */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setShowOffers(!showOffers)}
              className="w-full flex justify-between items-center p-4 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                🎟️ Apply Offers
              </span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showOffers ? "rotate-180" : ""}`} />
            </button>
            {showOffers && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-2 text-xs">
                <p className="text-gray-500 font-medium">Available Offers:</p>
                <div className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-rose-500 uppercase tracking-wider block">GET50</span>
                    <span className="text-gray-400 text-[10px]">Get flat ₹50.00 off on any pass!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVoucherApplied(true);
                      setVoucherDiscount(50);
                      setVoucherCode("GET50");
                    }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Consent Text */}
          <p className="text-[10px] text-center text-gray-400 leading-normal px-2">
            By proceeding, I express my consent to complete this transaction.
          </p>

          {/* Amount Payable Box */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Payable</span>
              <span className="text-lg font-extrabold text-gray-800">₹{finalTotal.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={bookPass}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 text-sm uppercase tracking-wide transition-colors shadow-lg shadow-rose-500/15 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Processing..." : `Continue to Pay`}
            </button>
          </div>
        </div>
      </main>

      {/* Footer Notes */}
      <div className="mt-8 text-center text-gray-400 text-xs py-6 border-t border-gray-200 max-w-7xl mx-auto">
        <div className="font-bold text-gray-600 uppercase tracking-widest text-sm mb-4 flex items-center justify-center gap-1">
          <span className="text-rose-500 font-serif">GATE</span>
          <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded text-xs"></span>
          <span className="text-gray-600 font-serif">PASS</span>
        </div>
        <div className="max-w-3xl mx-auto space-y-2 text-left px-4 text-gray-500">
          <p><strong>Note:</strong></p>
          <p>1. Registrations/Tickets once booked cannot be exchanged, cancelled or refunded.</p>
          <p>2. In case of Credit/Debit Card bookings, the Credit/Debit Card and Card holder must be present at the ticket counter while collecting the ticket(s).</p>
        </div>
      </div>
    </div>
  );
}
