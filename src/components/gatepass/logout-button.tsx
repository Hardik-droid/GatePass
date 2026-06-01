"use client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-full border border-white/14 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/70 transition hover:border-white/32 hover:text-white"
    >
      Logout
    </button>
  );
}

