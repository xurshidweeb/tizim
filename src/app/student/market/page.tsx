'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  ShoppingBag, 
  Coins, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function StudentMarketPage() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      const [userRes, prodRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/student/market'),
      ]);

      const userData = await userRes.json();
      const prodData = await prodRes.json();

      if (userData.user) setUser(userData.user);
      if (prodData.products) setProducts(prodData.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBuy = async (product: any) => {
    if (user.coinBalance < product.priceCoins) {
      setNotification({
        type: 'error',
        message: `Kechirasiz, balansingizda yetarli coin yo'q (${user.coinBalance}/${product.priceCoins} coin). Yana ${product.priceCoins - user.coinBalance} coin to'plashingiz kerak!`,
      });
      return;
    }

    if (!confirm(`Haqiqatan ham "${product.name}" mahsulotini ${product.priceCoins} coinga xarid qilmoqchimisiz?`)) {
      return;
    }

    setActionLoading(product.id);
    setNotification(null);

    try {
      const res = await fetch('/api/student/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xaridda xatolik');

      setNotification({ type: 'success', message: data.message });
      setUser((prev: any) => ({ ...prev, coinBalance: data.newBalance }));
      // Qoldiqni yangilash
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stockQuantity: p.stockQuantity - 1 } : p))
      );
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetGoal = async (product: any) => {
    setActionLoading(product.id + '-goal');
    setNotification(null);

    try {
      const res = await fetch('/api/student/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Maqsad belgilashda xatolik');

      setNotification({ type: 'success', message: data.message });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header with Liquid Glass Balance Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 liquid-glass-card p-6 rounded-[32px]">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <ShoppingBag size={24} />
              </span>
              <span>IT Time Coin Market Do'koni</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Darslardagi faollik va 110+ ball orqali to'plangan coinlaringizga ajoyib sovg'alarni xarid qiling!
            </p>
          </div>

          <div className="px-5 py-3 rounded-2xl liquid-glass-gold flex items-center gap-3 shrink-0 shadow-lg text-slate-950">
            <Coins size={26} className="text-amber-950" />
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-amber-950/70">Mavjud Balans</div>
              <div className="text-2xl font-black text-amber-950 leading-tight">{user.coinBalance} coin</div>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold shadow-md ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Product Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            const canAfford = user.coinBalance >= p.priceCoins;

            return (
              <div
                key={p.id}
                className="liquid-glass-card rounded-[28px] overflow-hidden flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="relative h-48 sm:h-52 w-full bg-slate-100/60 overflow-hidden">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full liquid-glass-gold text-amber-950 font-black text-xs flex items-center gap-1 shadow-lg">
                      <Coins size={13} className="text-amber-950" />
                      <span>{p.priceCoins} coin</span>
                    </div>

                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-slate-800 font-bold text-[11px] flex items-center gap-1 shadow-sm">
                      <Package size={12} className="text-slate-500" />
                      <span>Qoldiq: {p.stockQuantity} dona</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {p.description || "IT Time Academy maxsus mukofot mahsuloti."}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2.5">
                  <button
                    onClick={() => handleBuy(p)}
                    disabled={actionLoading === p.id || p.stockQuantity <= 0}
                    className={`ios-press w-full min-h-[44px] py-2.5 px-4 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                      canAfford
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25'
                        : 'bg-slate-200/80 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag size={15} />
                    <span>
                      {actionLoading === p.id
                        ? 'Xarid qilinmoqda...'
                        : p.stockQuantity <= 0
                        ? 'Tugagan'
                        : canAfford
                        ? 'Xarid qilish'
                        : `Coin yetarli emas (-${p.priceCoins - user.coinBalance})`}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSetGoal(p)}
                    disabled={actionLoading === p.id + '-goal'}
                    className="ios-press w-full min-h-[40px] py-2 px-4 rounded-2xl border border-slate-300/80 hover:border-amber-400 bg-white/70 hover:bg-amber-50/50 text-slate-700 hover:text-amber-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Target size={14} className="text-amber-500" />
                    <span>Maqsad qilib belgilash</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
