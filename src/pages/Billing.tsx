import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import Swal from 'sweetalert2';
import { ApiClient } from '../services/apiClient';

interface BillingProps {
  student: Student;
  onNavigateHome: () => void;
}

interface Receipt {
  id: number | string;
  receiptNo: string;
  date: string;
  amount: number;
  type: string;
  status: string;
  paymentMethod: string;
  for_month?: string;
}

export const Billing: React.FC<BillingProps> = ({ student, onNavigateHome }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [overview, setOverview] = useState({
    remaining_amount: student.remaining_amount ?? 0,
    subscription_type: student.subscription_type ?? 'monthly',
    monthly_price: student.monthly_price ?? 350,
    exemption_type: student.exemption_type ?? 'no_exemption',
    is_clean: (student.remaining_amount ?? 0) <= 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student?.id) {
      setLoading(true);
      ApiClient.get<any>(`/parent/student/${student.id}/billing`)
        .then((res) => {
          if (Array.isArray(res?.receipts)) {
            setReceipts(res.receipts);
          }
          if (res?.overview) {
            setOverview(res.overview);
          }
        })
        .catch((err) => {
          console.warn('[Billing] Failed to fetch live billing:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [student?.id]);

  const handlePrintReceipt = (r: Receipt) => {
    Swal.fire({
      title: 'إيصال سداد رقم ' + r.receiptNo,
      html: `
        <div class="text-right space-y-2 font-['Cairo'] text-xs p-2">
          <p class="flex justify-between border-b pb-1"><strong>الطالب:</strong> <span>${student.name}</span></p>
          <p class="flex justify-between border-b pb-1"><strong>البيان:</strong> <span>${r.type}</span></p>
          <p class="flex justify-between border-b pb-1"><strong>المبلغ:</strong> <span class="font-black text-emerald-700">${r.amount} ج.م</span></p>
          <p class="flex justify-between border-b pb-1"><strong>تاريخ السداد:</strong> <span>${r.date}</span></p>
          <p class="flex justify-between border-b pb-1"><strong>وسيلة الدفع:</strong> <span>${r.paymentMethod}</span></p>
          <p class="text-emerald-700 font-black pt-2 text-center flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-circle-check text-emerald-600"></i> معتمد ومسجل بالنظام الإلكتروني
          </p>
        </div>
      `,
      confirmButtonText: 'طباعة الإيصال',
      showCancelButton: true,
      cancelButtonText: 'إغلاق',
      confirmButtonColor: '#065F46',
    });
  };

  return (
    <div className="space-y-4 pb-28 font-['Cairo'] selection:bg-emerald-700 selection:text-white">
      {/* ── Standalone Top Back Button Bar ── */}
      <div className="flex items-center justify-start">
        <button
          onClick={onNavigateHome}
          className="px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-100 flex items-center gap-2 text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
          title="رجوع للرئيسية"
        >
          <i className="fa-solid fa-arrow-right text-xs text-amber-600" />
          <span>رجوع</span>
        </button>
      </div>

      {/* ── Top Header Banner ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="text-right space-y-0.5">
            <h2 className="text-lg font-black text-slate-900 leading-tight">الحساب والاشتراك الشهري</h2>
            <p className="text-xs font-semibold text-slate-500">متابعة الفواتير والإيصالات المدفوعة</p>
          </div>

          <div className="px-3 py-1.5 bg-[#e8f6f0] text-[#065A4B] border border-[#b2e2d0] rounded-full text-xs font-black shrink-0 flex items-center gap-1.5">
            <i className="fa-solid fa-shield-check text-emerald-600 text-xs" />
            <span>حالة الحساب: {overview.is_clean ? 'سليم' : 'يوجد متبقي'}</span>
          </div>
        </div>

        {/* Amber Underline Accent Divider */}
        <div className="w-full h-1 bg-gradient-to-r from-amber-500/80 via-amber-300/40 to-transparent mt-4 rounded-full" />
      </div>

      {/* ── Account Status Overview Card ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-xs text-right">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">المبلغ المتبقي على الطالب</span>
            <span className="text-2xl font-black text-[#065A4B]">
              {overview.remaining_amount > 0 ? `${overview.remaining_amount} ج.م` : '0 ج.م (خالص المسدد)'}
            </span>
          </div>
          <span className="px-3 py-1.5 bg-[#e8f6f0] border border-[#b2e2d0] text-[#065A4B] rounded-xl text-xs font-black">
            {overview.exemption_type === 'full_exemption' ? 'إعفاء كامل' : (overview.subscription_type === 'monthly' ? 'اشتراك شهري' : 'اشتراك للحصة')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/80">
            <span className="text-[11px] font-bold text-slate-400 block mb-0.5">نظام السداد الحالي</span>
            <span className="font-black text-slate-800">
              {overview.subscription_type === 'monthly' ? 'اشتراك 8 حصص شهرية' : 'سداد بالحصة الدراسية'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/80">
            <span className="text-[11px] font-bold text-slate-400 block mb-0.5">قيمة الاشتراك</span>
            <span className="font-black text-[#065A4B]">{overview.monthly_price} ج.م / شهر</span>
          </div>
        </div>
      </div>

      {/* ── Receipts History List ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 px-1 flex items-center justify-start gap-2">
          <i className="fa-solid fa-receipt text-[#d97706]" />
          سجل إيصالات السداد بالسنتر
        </h3>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold space-y-2">
            <i className="fa-solid fa-circle-notch animate-spin text-lg text-emerald-600 block" />
            جاري تحميل الإيصالات...
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold bg-white border border-slate-100 rounded-3xl p-6">
            لا توجد إيصالات أو مدفوعات مسجلة حالياً
          </div>
        ) : (
          receipts.map((r) => (
            <div
              key={r.id}
              onClick={() => handlePrintReceipt(r)}
              className="bg-white border border-slate-100 border-b-2 border-b-amber-500/30 rounded-3xl p-4 flex items-center justify-between shadow-xs hover:border-amber-500/50 transition-all cursor-pointer active:scale-98 text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] border border-[#fde68a] text-[#d97706] flex items-center justify-center shrink-0 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-[#d97706] text-white flex items-center justify-center text-xs font-black">
                    <i className="fa-solid fa-file-invoice" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-slate-900">{r.type}</h4>
                  <p className="text-[11px] font-bold text-slate-500">{r.date} • {r.paymentMethod}</p>
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="text-base font-black text-[#065A4B] block">{r.amount} ج.م</span>
                <span className="text-[10px] font-black text-[#065A4B] bg-[#e8f6f0] px-2 py-0.5 rounded-md border border-[#b2e2d0] inline-flex items-center gap-1 mt-0.5">
                  <i className="fa-solid fa-circle-check text-emerald-600 text-[9px]" />
                  {r.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
