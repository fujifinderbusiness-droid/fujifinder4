import React, { useState } from 'react';
import { 
  Camera, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, navigateTo } = useData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginAdmin(email, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Gagal masuk. Periksa kembali email dan kata sandi admin Anda.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#FAF9F6] flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-white selection:text-black">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pt-2 sm:pt-4">
        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Website</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full text-[10px] text-[#AAA] tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Area Terbatas</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-[#141414] border border-[#262626] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white text-[#0E0E0E] mb-2 shadow-sm">
              <Camera className="w-6 h-6" />
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white">
              FujiFinder CMS
            </h1>
            <p className="text-xs text-[#888] max-w-xs mx-auto leading-relaxed">
              Masuk untuk mengelola ulasan kamera, artikel editorial, skor uji lab, dan konfigurasi afiliasi.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2 text-left animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#BBB] uppercase tracking-wider text-[10px]">
                Email Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  autoComplete="email"
                  required
                  className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-white text-white rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm placeholder:text-[#555] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#BBB] uppercase tracking-wider text-[10px]">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-white text-white rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#777] hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-white hover:bg-neutral-200 text-[#0E0E0E] font-bold text-xs sm:text-sm tracking-wide rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="w-full max-w-md mx-auto text-center pb-2 text-[11px] text-[#666]">
        FujiFinder Editorial Platform • Dilindungi Autentikasi Pengelola Konten
      </div>
    </div>
  );
};
