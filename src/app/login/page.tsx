'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      router.push(data.redirectTo);
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="min-h-screen flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden login-gradient items-center justify-center">
          {/* Abstract decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/5 blur-xl" />
            <div className="absolute bottom-32 right-16 w-80 h-80 rounded-full bg-white/5 blur-xl" />
            <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-white/8 blur-lg" />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 login-grid-pattern opacity-10" />

          {/* Content */}
          <div className="relative z-10 text-center text-white px-12 max-w-lg">
            <Image
                src="/K-168.png"
                width={140}
                height={52}
                alt="EXIT"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="mx-auto mb-8"
            />
            <div className="mt-12 flex items-center justify-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-300" />
                <span>실시간 모니터링</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-300" />
                <span>통합 대시보드</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex justify-center mb-8 lg:hidden">
              <Image
                  src="/K-168.png"
                  width={140}
                  height={52}
                  alt="EXIT"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  className="mx-auto mb-8"
              />
            </div>
            <div className="mb-10">
              <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
              <p className="mt-2 text-sm text-gray-500">계정 정보를 입력하여 시작하세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                  아이디
                </label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] focus:bg-white"
                    placeholder="아이디를 입력하세요"
                    required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  비밀번호
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] focus:bg-white"
                    placeholder="비밀번호를 입력하세요"
                    required
                />
              </div>

              {error && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
              )}

              <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-medium text-sm hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-[var(--primary)]/25 active:scale-[0.98]"
              >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  로그인 중...
                </span>
                ) : '로그인'}
              </button>
            </form>

            <p className="mt-10 text-center text-xs text-gray-400">
              EXIT Ad Management Platform
            </p>
          </div>
        </div>
      </div>
  );
}
