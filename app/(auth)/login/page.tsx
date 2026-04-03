"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Tên đăng nhập hoặc mật khẩu không đúng");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#ffbf00]">TradeFlow</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Hệ thống quản lý xuất nhập khẩu
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 space-y-4"
        >
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#141414] border border-[#2a2a2a] rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-[#ffbf00]/50"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#141414] border border-[#2a2a2a] rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-[#ffbf00]/50"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#ffbf00] text-black font-medium rounded-lg hover:bg-[#cc9900] disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="text-xs text-zinc-600 text-center mt-4">
            Demo: admin / Admin@123
          </p>
        </form>
      </div>
    </div>
  );
}
