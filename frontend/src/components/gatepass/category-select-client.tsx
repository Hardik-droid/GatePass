"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Check, ArrowRight, ArrowLeft } from "lucide-react";

type EventDto = {
  id: string;
  organizationId: string;
  title: string;
  venue: string;
  startTime: string;
  slug?: string;
  city?: string;
};

type CategoryDto = {
  id: string;
  name: string;
  pricePaisa: number;
  capacity: number;
};

export function CategorySelectClient({
  event,
  categories,
}: {
  event: EventDto;
  categories: CategoryDto[];
}) {
  const [selectedId, setSelectedId] = useState(categories[0]?.id ?? "");
  const router = useRouter();

  const handleContinue = () => {
    router.push(`/book/${event.slug ?? event.id}?category=${selectedId}`);
  };

  return (
    <div className="min-h-screen bg-[#f2f5f9] text-[#1a1a1a] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="mx-auto max-w-7xl flex items-center gap-4">
          <Link href="/" className="hover:text-rose-500 text-gray-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-sm md:text-base font-bold text-gray-800">
              {event.title}
            </h1>
            <p className="text-xs text-gray-400">
              {event.venue} | {event.city ?? "India"}
            </p>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-md w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-xl space-y-6">
          <div className="text-center space-y-2 border-b border-gray-100 pb-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">Choose Ticket Option</span>
            <h2 className="text-2xl font-serif text-gray-800">Select Category</h2>
            <p className="text-xs text-gray-500">Choose your preferred entry tier to proceed to payment.</p>
          </div>

          <div className="space-y-3">
            {categories.map((category) => {
              const isSelected = selectedId === category.id;
              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => setSelectedId(category.id)}
                  className={`w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 outline-none ${
                    isSelected
                      ? "border-rose-500 bg-rose-50/30 text-gray-900 ring-2 ring-rose-500/20"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-rose-500 bg-rose-500 text-white"
                        : "border-gray-300 bg-white"
                    }`}>
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="font-bold text-sm block text-gray-800">{category.name}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Instant Digital QR Ticket</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-gray-900">
                    ₹{(category.pricePaisa / 100).toLocaleString("en-IN")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Event Quick Info */}
          <div className="rounded-2xl bg-gray-50 p-4 space-y-2.5 text-xs border border-gray-100 text-gray-600">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarDays className="h-4 w-4 text-rose-500 shrink-0" />
              <span>{new Date(event.startTime).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {new Date(event.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
              <span>{event.venue}, {event.city ?? "India"}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-rose-500 hover:bg-rose-600 py-3.5 font-bold uppercase tracking-[0.1em] text-white transition-all shadow-lg shadow-rose-500/10 text-sm cursor-pointer"
          >
            <span>Continue Booking</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
