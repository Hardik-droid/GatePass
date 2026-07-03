import mongoose, { Schema } from "mongoose";

const StringId = { type: String, required: true, trim: true };

const UserSchema = new Schema(
  {
    userId: { ...StringId, unique: true, index: true },
    email: { type: String, trim: true, lowercase: true, index: true, sparse: true },
    name: { type: String, trim: true },
    phone: { type: String, trim: true, index: true, sparse: true },
    role: { type: String, default: "attendee", index: true },
    status: { type: String, default: "active", index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

const OrganizationSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    name: { type: String, trim: true, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

const OrganizationMemberSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    organizationId: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    email: { type: String, trim: true, lowercase: true, index: true, sparse: true },
    name: { type: String, trim: true },
    role: { type: String, required: true, index: true },
    status: { type: String, default: "invited", index: true },
  },
  { timestamps: true, versionKey: false },
);

const EventSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    organizationId: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: true },
    description: { type: String },
    eventType: { type: String, index: true },
    status: { type: String, index: true },
    visibility: { type: String, index: true },
    venue: { type: String, index: true },
    city: { type: String, index: true },
    startTime: { type: String, index: true },
    gpsRequired: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

const TicketCategorySchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    eventId: { type: String, required: true, index: true },
    name: { type: String, required: true, index: true },
    pricePaisa: { type: Number, default: 0, index: true },
    capacity: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

const OrderSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    organizationId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    buyerUserId: { type: String, index: true, sparse: true },
    buyerName: { type: String, trim: true, index: true },
    buyerEmail: { type: String, trim: true, lowercase: true, index: true },
    buyerPhone: { type: String, trim: true, index: true },
    items: {
      type: [
        {
          ticketCategoryId: { type: String, required: true, index: true },
          quantity: { type: Number, default: 1, min: 1, max: 6 },
        },
      ],
      default: [],
    },
    status: { type: String, default: "pending_payment", index: true },
    paymentStatus: { type: String, default: "unpaid", index: true },
    subtotalPaisa: { type: Number, default: 0 },
    platformFeePaisa: { type: Number, default: 0 },
    totalPaisa: { type: Number, default: 0, index: true },
    currency: { type: String, default: "INR" },
    paymentId: { type: String, index: true, sparse: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

const TicketSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    ticketId: { type: String, unique: true, index: true },
    qrToken: { type: String, unique: true, index: true, sparse: true },
    qrTokenHash: { type: String, index: true, sparse: true },
    userId: { type: String, index: true, sparse: true },
    eventId: { type: String, required: true, index: true },
    orderId: { type: String, index: true, sparse: true },
    organizationId: { type: String, index: true, sparse: true },
    ticketCategoryId: { type: String, index: true },
    attendeeName: { type: String, trim: true, index: true },
    attendeeEmail: { type: String, trim: true, lowercase: true, index: true, sparse: true },
    attendeePhone: { type: String, trim: true, index: true, sparse: true },
    status: {
      type: String,
      enum: ["active", "used", "cancelled", "refunded", "expired", "issued", "checked_in"],
      default: "active",
      index: true,
    },
    scannedAt: { type: Date, index: true, sparse: true },
    scannedBy: { type: String, index: true, sparse: true },
    checkedInAt: { type: String },
    checkedInBy: { type: String },
    checkedInGateId: { type: String },
    walletEnabled: { type: Boolean, default: true },
    appleWalletPassId: { type: String, index: true, sparse: true },
    googleWalletPassId: { type: String, index: true, sparse: true },
    walletLastUpdatedAt: { type: String, index: true, sparse: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

const ScanLogSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    organizationId: { type: String, index: true },
    eventId: { type: String, index: true },
    ticketId: { type: String, index: true },
    qrToken: { type: String, index: true, sparse: true },
    scannerUserId: { type: String, index: true },
    gateId: { type: String, index: true },
    deviceId: { type: String, index: true },
    scanResult: { type: String, index: true },
    message: { type: String },
    scanTime: { type: Date, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

const LocationLogSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    userId: { type: String, index: true },
    ticketId: { type: String, index: true },
    eventId: { type: String, index: true },
    latitude: { type: Number, index: true },
    longitude: { type: Number, index: true },
    accuracy: { type: Number },
    source: { type: String, index: true },
    status: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

const PaymentSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    orderId: { type: String, index: true },
    paymentId: { type: String, index: true, sparse: true },
    gatewayOrderId: { type: String, index: true, sparse: true },
    provider: { type: String, index: true },
    status: { type: String, index: true },
    amountPaisa: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

const WalletPassSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    ticketId: { type: String, index: true },
    userId: { type: String, index: true, sparse: true },
    provider: { type: String, enum: ["apple", "google"], index: true },
    status: { type: String, index: true },
    saveUrl: { type: String },
    providerPassId: { type: String, index: true, sparse: true },
    providerClassId: { type: String, index: true, sparse: true },
    serialNumber: { type: String, index: true, sparse: true },
    authenticationTokenHash: { type: String, index: true, sparse: true },
    lastSyncedAt: { type: String, index: true, sparse: true },
    lastError: { type: String },
  },
  { timestamps: true, versionKey: false },
);

const WalletDeviceSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    provider: { type: String, index: true },
    deviceLibraryIdentifier: { type: String, unique: true, index: true },
    pushToken: { type: String },
  },
  { timestamps: true, versionKey: false },
);

const WalletPassRegistrationSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    walletPassId: { type: String, index: true },
    walletDeviceId: { type: String, index: true },
    createdAt: { type: String, index: true },
  },
  { timestamps: false, versionKey: false },
);

const UserWalletPreferenceSchema = new Schema(
  {
    userId: { ...StringId, unique: true, index: true },
    walletPreference: { type: String, index: true },
    preferredWalletProvider: { type: String, index: true, sparse: true },
    walletAutoPromptSeen: { type: Boolean, default: false },
    walletLastSelectedAt: { type: String, index: true, sparse: true },
  },
  { timestamps: true, versionKey: false },
);

const NotificationSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    target: { type: String, index: true },
    subject: { type: String, index: true },
    status: { type: String, index: true },
    provider: { type: String, index: true },
    attempts: { type: Number, default: 0 },
    relatedTicketId: { type: String, index: true, sparse: true },
    sentAt: { type: String, index: true, sparse: true },
    recipientEmail: { type: String, index: true, sparse: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

const AuditSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    actor: { type: String, index: true, sparse: true },
    actorRole: { type: String, index: true },
    actorUserId: { type: String, index: true },
    action: { type: String, index: true },
    entityType: { type: String, index: true },
    entityId: { type: String, index: true },
    timestamp: { type: String, index: true },
    createdAt: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: false, versionKey: false },
);

const GatepassRequestSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    status: { type: String, index: true },
    createdAt: { type: String, index: true },
    organizationId: { type: String, index: true, sparse: true },
    userId: { type: String, index: true, sparse: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: false, versionKey: false },
);

const SettlementSchema = new Schema(
  {
    id: { ...StringId, unique: true, index: true },
    eventId: { type: String, index: true },
    status: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export const OrganizationModel = mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);
export const OrganizationMemberModel = mongoose.models.OrganizationMember || mongoose.model("OrganizationMember", OrganizationMemberSchema);
export const EventModel = mongoose.models.Event || mongoose.model("Event", EventSchema);
export const TicketCategoryModel = mongoose.models.TicketCategory || mongoose.model("TicketCategory", TicketCategorySchema);
export const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export const TicketModel = mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
export const ScanLogModel = mongoose.models.ScanLog || mongoose.model("ScanLog", ScanLogSchema);
export const LocationLogModel = mongoose.models.LocationLog || mongoose.model("LocationLog", LocationLogSchema);
export const PaymentModel = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export const WalletPassModel = mongoose.models.WalletPass || mongoose.model("WalletPass", WalletPassSchema);
export const WalletDeviceModel = mongoose.models.WalletDevice || mongoose.model("WalletDevice", WalletDeviceSchema);
export const WalletPassRegistrationModel =
  mongoose.models.WalletPassRegistration || mongoose.model("WalletPassRegistration", WalletPassRegistrationSchema);
export const UserWalletPreferenceModel =
  mongoose.models.UserWalletPreference || mongoose.model("UserWalletPreference", UserWalletPreferenceSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
export const AuditModel = mongoose.models.Audit || mongoose.model("Audit", AuditSchema);
export const GatepassRequestModel = mongoose.models.GatepassRequest || mongoose.model("GatepassRequest", GatepassRequestSchema);
export const SettlementModel = mongoose.models.Settlement || mongoose.model("Settlement", SettlementSchema);

