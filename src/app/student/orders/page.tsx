'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { ShoppingBag, Clock, CheckCircle2, PackageCheck, XCircle, ArrowRight, Coins } from 'lucide-react';

export default function StudentOrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/student/orders').then((r) => r.json()),
    ]).then(([userData, orderData]) => {
      if (userData.user) setUser(userData.user);
      if (orderData.orders) setOrders(orderData.orders);
      setLoading(false);
    });
  }, []);

  if (loading || !user) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100/90 text-amber-800 border border-amber-300/80 font-bold text-xs flex items-center gap-1">
            <Clock size={13} /> Kutilmoqda
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-100/90 text-blue-800 border border-blue-300/80 font-bold text-xs flex items-center gap-1">
            <CheckCircle2 size={13} /> Tasdiqlandi
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 font-bold text-xs flex items-center gap-1">
            <PackageCheck size={13} /> Berildi
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full bg-red-100/90 text-red-800 border border-red-300/80 font-bold text-xs flex items-center gap-1">
            <XCircle size={13} /> Bekor qilindi
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <ShoppingBag size={24} />
              </span>
              <span>Mening Buyurtmalarim</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Do'kondan xarid qilgan mahsulotlaringiz holatini shu yerdan kuzatib boring.
            </p>
          </div>

          <Link
            href="/student/market"
            className="ios-press px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-start sm:self-auto"
          >
            <ShoppingBag size={15} />
            <span>Do'konga o'tish</span>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="liquid-glass-card rounded-[32px] p-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="font-black text-slate-800 text-base">Hozircha buyurtmalar yo'q</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
              Sizda hali Coin Market orqali berilgan buyurtmalar mavjud emas. Tangalaringizga yangi mahsulotlar xarid qiling!
            </p>
            <Link
              href="/student/market"
              className="ios-press mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-emerald-700 transition-colors"
            >
              <span>Do'konni ochish</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="liquid-glass-card rounded-[28px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={o.product.imageUrl || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300'}
                    alt={o.product.name}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{o.product.name}</h4>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>
                        Buyurtma sanasi:{' '}
                        {new Date(o.createdAt).toLocaleDateString('uz-UZ', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs font-black text-amber-600">
                      <Coins size={13} />
                      <span>{o.coinsPaid} coin to'landi</span>
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  {getStatusBadge(o.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
