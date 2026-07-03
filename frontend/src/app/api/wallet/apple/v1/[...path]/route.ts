import { NextRequest, NextResponse } from "next/server";
import {
  getChangedApplePassSerials,
  registerAppleDevice,
  signApplePkpass,
  unregisterAppleDevice,
  validateApplePassAuth,
} from "@/backend/modules/apple-wallet-service";
import { recordAudit } from "@/backend/modules/audit";
import { getTicket } from "@/backend/modules/tickets";
import { syncWalletPassStatus } from "@/backend/modules/wallet-service";

type ApplePathParams = { path: string[] };

function getApplePassAuthToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, token] = authorization.split(/\s+/, 2);
  return scheme === "ApplePass" ? token : "";
}

function requireApplePassAuth(serialNumber: string, request: NextRequest) {
  const authToken = getApplePassAuthToken(request);
  if (!authToken || !validateApplePassAuth(serialNumber, authToken)) {
    return NextResponse.json({ message: "Invalid Apple pass authorization" }, { status: 401 });
  }
  return null;
}

function parsePath(path: string[]) {
  const registrationsIndex = path.indexOf("registrations");
  const passesIndex = path.indexOf("passes");
  return {
    isLog: path[0] === "log",
    isDeviceRegistration: path[0] === "devices" && registrationsIndex === 2,
    isPassDownload: passesIndex === 0,
    deviceLibraryIdentifier: path[1],
    passTypeIdentifier: registrationsIndex >= 0 ? path[registrationsIndex + 1] : path[1],
    serialNumber: registrationsIndex >= 0 ? path[registrationsIndex + 2] : path[2],
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<ApplePathParams> },
) {
  try {
    const parsed = parsePath((await params).path);
    if (parsed.isDeviceRegistration && !parsed.serialNumber) {
      return NextResponse.json(getChangedApplePassSerials(parsed.deviceLibraryIdentifier));
    }
    if (parsed.isPassDownload && parsed.serialNumber) {
      const authError = requireApplePassAuth(parsed.serialNumber, request);
      if (authError) return authError;
      const ticket = getTicket(parsed.serialNumber);
      if (!ticket?.qrToken) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
      const pass = await signApplePkpass(parsed.serialNumber, ticket.qrToken);
      if (!pass.configured || !("pkpassBuffer" in pass)) return NextResponse.json(pass);
      const pkpassBuffer = pass.pkpassBuffer;
      if (!pkpassBuffer) return NextResponse.json({ message: "Apple pass generation failed" }, { status: 400 });
      syncWalletPassStatus(parsed.serialNumber, "downloaded");
      return new NextResponse(new Uint8Array(pkpassBuffer), {
        headers: { "content-type": "application/vnd.apple.pkpass" },
      });
    }
    return NextResponse.json({ message: "Unsupported Apple Wallet endpoint" }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Apple Wallet endpoint failed" },
      { status: 400 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<ApplePathParams> },
) {
  const parsed = parsePath((await params).path);
  if (parsed.isLog) {
    const body = await request.json().catch(() => ({}));
    recordAudit({ action: "wallet.apple.log", entityType: "wallet", entityId: "apple", newValue: body });
    return NextResponse.json({ ok: true });
  }
  if (parsed.isDeviceRegistration && parsed.serialNumber) {
    const authError = requireApplePassAuth(parsed.serialNumber, request);
    if (authError) return authError;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(registerAppleDevice(parsed.deviceLibraryIdentifier, parsed.serialNumber, String(body.pushToken ?? "")));
  }
  return NextResponse.json({ message: "Unsupported Apple Wallet endpoint" }, { status: 404 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<ApplePathParams> },
) {
  const parsed = parsePath((await params).path);
  if (parsed.isDeviceRegistration && parsed.serialNumber) {
    const authError = requireApplePassAuth(parsed.serialNumber, request);
    if (authError) return authError;
    return NextResponse.json(unregisterAppleDevice(parsed.deviceLibraryIdentifier, parsed.serialNumber));
  }
  return NextResponse.json({ message: "Unsupported Apple Wallet endpoint" }, { status: 404 });
}
