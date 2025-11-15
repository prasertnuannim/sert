"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { updateAuthSettings } from "./actions";

export function AuthSettingsForm({
  sessionMaxAge,
}: {
  sessionMaxAge: string;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          // 🕒 แปลงจาก "นาที" → "วินาที" ก่อนส่งไป server
          const minutes = Number(formData.get("sessionMaxAge")) || 0;
          formData.set("sessionMaxAge", String(minutes * 60));

          const res = await updateAuthSettings(formData);
          if (!res.ok) {
            setResult("❌ Error");
            return;
          }
          setResult("✅ Saved! Logging out…");
          await signOut({ callbackUrl: "/login" });
        });
      }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium mb-2">
          Session Max Age (Minute)
        </label>
        <input
          name="sessionMaxAge"
          defaultValue={Number(sessionMaxAge) / 60} // แปลงจากวินาที → นาที ตอนแสดง
          className="border p-2 rounded w-full"
          type="number"
          min={1}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {pending ? "Saving..." : "Save Settings"}
      </button>

      {result && (
        <p className="text-sm text-green-600 mt-3 transition-opacity">{result}</p>
      )}
    </form>
  );
}
