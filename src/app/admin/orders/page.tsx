'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  PackageCheck, 
  XCircle, 
  Coins, 
  AlertCircle,
  Filter,
  User,
  Calendar
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const [uRes, oRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/admin/orders').then((r) => r.json()),
      ]);

      if (uRes.user) setUser(uRes.user);
      if (oRes.orders) setOrders(oRes.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    let cancelReason = '';
    if (newStatus === 'CANCELLED') {
      const reason = prompt('Buyurtmani bekor qilish sababini kiriting (o\'quvchiga coinlar to\'liq qaytariladi):');
      if (reason === null) return;
      cancelReason = reason || 'Admin tomonidan bekor qilindi';
    }

    setActionLoading(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          newStatus,
          cancelReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik');

      alert(data.message);
      loadOrders();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !user) return null;

  const filtered = orders.filter((o) => (filter === 'ALL' ? true : o.status === filter));

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/20">
                <ShoppingBag size={24} />
              </span>
              <span>Coin Market Buyurtmalari</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Spetsifikatsiya 8-bandi: Kutilmoqda → Tasdiqlandi → Berildi, yoki Bekor qilish (coinlar avtomatik qaytadi).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3.5 py-2 ios-glass-input rounded-2xl text-xs font-bold text-slate-700 shadow-sm focus:outline-none"
            >
              <option value="ALL">Barcha buyurtmalar ({orders.length})</option>
              <option value="PENDING">Kutilayotganlar</option>
              <option value="APPROVED">Tasdiqlanganlar</option>
              <option value="DELIVERED">Topshirilganlar</option>
              <option value="CANCELLED">Bekor qilinganlar</option>
            </select>
          </div>
        </div>

        {/* Orders Cards Grid */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="liquid-glass-card p-12 rounded-3xl text-center text-slate-400 text-sm font-medium">
              Tanlangan filtr bo'yicha buyurtmalar topilmadi.
            </div>
          ) : (
            filtered.map((o) => (
              <div
                key={o.id}
                className="liquid-glass-card p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={o.product.imageUrl || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300'}
                      alt={o.product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200/80 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-sm flex items-center gap-0.5">
                      <Coins size={10} />
                      <span>{o.coinsPaid}</span>
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-base">{o.product.name}</h3>
                      <span className="font-black text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Coins size={12} /> {o.coinsPaid} coin
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                      <User size={13} className="text-slate-400" />
                      <span>Xaridor:</span>
                      <b className="text-slate-900 font-bold">{o.student.fullName}</b>
                      <span className="font-mono text-slate-400">({o.student.login})</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(o.createdAt).toLocaleDateString('uz-UZ', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {o.student.phone && (
                        <span>• Tel: {o.student.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions and Status */}
                <div className="pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex items-center justify-between md:justify-end gap-2 shrink-0">
                  {o.status === 'PENDING' && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'APPROVED')}
                        disabled={actionLoading === o.id}
                        className="ios-press flex-1 md:flex-none min-h-[42px] px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={15} />
                        <span>Tasdiqlash</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'CANCELLED')}
                        disabled={actionLoading === o.id}
                        className="ios-press flex-1 md:flex-none min-h-[42px] px-3.5 py-2 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle size={15} />
                        <span>Bekor qilish</span>
                      </button>
                    </div>
                  )}

                  {o.status === 'APPROVED' && (
                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                      <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
                        Tasdiqlangan
                      </span>
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'DELIVERED')}
                        disabled={actionLoading === o.id}
                        className="ios-press min-h-[42px] px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                      >
                        <PackageCheck size={16} />
                        <span>Topshirildi</span>
                      </button>
                    </div>
                  )}

                  {o.status === 'DELIVERED' && (
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 border border-emerald-200">
                      <PackageCheck size={15} /> Berildi
                    </span>
                  )}

                  {o.status === 'CANCELLED' && (
                    <div className="text-right">
                      <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1 border border-red-200">
                        <XCircle size={14} /> Bekor qilingan
                      </span>
                      {o.cancelReason && (
                        <div className="text-[10px] text-slate-400 mt-1 italic">
                          Sabab: {o.cancelReason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
