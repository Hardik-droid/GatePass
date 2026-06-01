import { AppShell, StatusBadge } from "@/components/gatepass/admin-components";
import { isAppleWalletConfigured } from "@/backend/modules/apple-wallet-service";
import { isGoogleWalletConfigured } from "@/backend/modules/google-wallet-service";

function SetupRow({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-black/24 px-4 py-3">
      <span>{label}</span>
      <StatusBadge status={configured ? "configured" : "missing"} />
    </div>
  );
}

export default function WalletSettingsPage() {
  const apple = isAppleWalletConfigured();
  const google = isGoogleWalletConfigured();

  return (
    <AppShell title="Wallet Setup">
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
          <h2 className="font-serif text-3xl">Apple Wallet</h2>
          <div className="mt-5 grid gap-3 text-sm">
            {["APPLE_PASS_TYPE_IDENTIFIER", "APPLE_TEAM_IDENTIFIER", "APPLE_PASS_CERT_PATH", "APPLE_PASS_KEY_PATH", "APPLE_PASS_CERT_PASSWORD", "APPLE_WWDR_CERT_PATH", "APPLE_WALLET_WEB_SERVICE_URL"].map((key) => (
              <SetupRow key={key} label={key} configured={Boolean(process.env[key])} />
            ))}
          </div>
          {!apple.configured ? <p className="mt-4 text-sm text-white/58">Apple Wallet temporarily unavailable until missing setup is complete: {apple.missing.join(", ")}</p> : null}
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
          <h2 className="font-serif text-3xl">Google Wallet</h2>
          <div className="mt-5 grid gap-3 text-sm">
            {["GOOGLE_WALLET_ISSUER_ID", "GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL", "GOOGLE_WALLET_PRIVATE_KEY", "GOOGLE_WALLET_EVENT_TICKET_CLASS_SUFFIX", "GOOGLE_WALLET_ORIGIN"].map((key) => (
              <SetupRow key={key} label={key} configured={Boolean(process.env[key])} />
            ))}
          </div>
          {!google.configured ? <p className="mt-4 text-sm text-white/58">Google Wallet temporarily unavailable until missing setup is complete: {google.missing.join(", ")}</p> : null}
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
          <h2 className="font-serif text-3xl">Shared Security</h2>
          <div className="mt-5 grid gap-3 text-sm">
            <SetupRow label="QR_SIGNING_SECRET" configured={Boolean(process.env.QR_SIGNING_SECRET)} />
            <SetupRow label="WALLET_LINK_SIGNING_SECRET" configured={Boolean(process.env.WALLET_LINK_SIGNING_SECRET)} />
            <SetupRow label="WALLET_PASS_BASE_URL" configured={Boolean(process.env.WALLET_PASS_BASE_URL || process.env.NEXT_PUBLIC_APP_URL)} />
          </div>
          <p className="mt-4 text-sm text-white/58">Missing secrets fall back in dev only. Production must set explicit secrets and provider credentials.</p>
        </section>
      </div>
    </AppShell>
  );
}
