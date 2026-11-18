"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: { ok?: boolean; error?: string } = await r.json();
      if (!r.ok) {
        setError(data.error ?? "Sign-in failed");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Could not reach sign-in service");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-9 space-y-5">
      <div>
        <label htmlFor="admin-email" className="label-field">Work email</label>
        <input id="admin-email" className="input-field" required type="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          autoComplete="username" placeholder="you@sapphirequesttravel.com"/>
      </div>
      <div>
        <label htmlFor="admin-password" className="label-field">Password</label>
        <div className="relative mt-2">
          <input
            id="admin-password"
            className="input-field pr-14"
            required
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            aria-pressed={passwordVisible}
            aria-controls="admin-password"
            onClick={() => setPasswordVisible((value) => !value)}
            className="absolute inset-y-0 right-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-[#edf4ff] hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire"
          >
            {passwordVisible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button disabled={busy} type="submit" className="w-full">
        {busy ? <Loader2 size={17} className="animate-spin" /> : <LockKeyhole size={16} />}
        Sign in <ArrowRight size={16}/>
      </Button>
      <p className="text-center text-xs leading-6 text-muted">
        Private access for authorised Sapphire Quest staff only. Contact your administrator for account help.
      </p>
    </form>
  );
}
