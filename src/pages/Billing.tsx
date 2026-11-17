import React, { useState, useEffect } from 'react';
import { Check, Receipt as ReceiptIcon, Wallet } from 'lucide-react';
import { Student } from '../types';
import { Dialog } from '../lib/dialog';
import { ApiClient } from '../services/apiClient';
import { Badge, EmptyState, KeyValueList, ListRow, LoadingBlock, MetricCard, SectionTitle, StatusPill } from '../components/ui';

interface BillingProps {
  student: Student;
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

const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export const Billing: React.FC<BillingProps> = ({ student }) => {
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
    if (!student?.id) return;
    setLoading(true);
    ApiClient.get<any>(`/parent/student/${student.id}/billing`)
      .then((res) => {
        if (Array.isArray(res?.receipts)) setReceipts(res.receipts);
        if (res?.overview) setOverview(res.overview);
      })
      .catch((err) => console.warn('[Billing] Failed to fetch live billing:', err))
      .finally(() => setLoading(false));
  }, [student?.id]);

  const showReceipt = (r: Receipt) => {
    const row = (k: string, v: string) =>
      `<div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #E8E3D7"><span style="color:#5E5C53">${k}</span><b>${esc(v)}</b></div>`;
    Dialog.fire({
      title: `إيصال رقم ${r.receiptNo}`,
      html: `<div style="text-align:right;font-size:14px">
        ${row('الطالب', student.name)}${row('البيان', r.type)}${row('المبلغ', `${r.amount} ج.م`)}
        ${row('التاريخ', r.date)}${row('وسيلة الدفع', r.paymentMethod)}</div>`,
      confirmButtonText: 'إغلاق',
    });
  };

  const exempt = overview.exemption_type === 'full_exemption';
  const plan = exempt ? 'إعفاء كامل' : overview.subscription_type === 'monthly' ? 'اشتراك شهري' : 'اشتراك بالحصة';

  return (
    <div className="space-y-5">
      <MetricCard
        icon={Wallet}
        label="المبلغ المتبقي"
        tone="warning"
        value={overview.remaining_amount > 0 ? overview.remaining_amount : 0}
        unit="ج.م"
        pill={
          overview.is_clean ? (
            <StatusPill tone="success" icon={Check}>
              الحساب مسدد
            </StatusPill>
          ) : (
            <StatusPill tone="warning">يوجد متبقي</StatusPill>
          )
        }
      />

      <KeyValueList
        items={[
          { label: 'نظام السداد', value: plan },
          { label: 'قيمة الاشتراك', value: `${overview.monthly_price} ج.م / شهر` },
        ]}
      />

      <section className="space-y-3">
        <SectionTitle>الإيصالات</SectionTitle>
        {loading ? (
          <LoadingBlock label="جارٍ تحميل الإيصالات" />
        ) : receipts.length === 0 ? (
          <EmptyState icon={ReceiptIcon} title="لا توجد إيصالات بعد" hint="ستظهر هنا مدفوعاتك المسجلة" />
        ) : (
          <ul className="space-y-3">
            {receipts.map((r) => (
              <li key={r.id}>
                <ListRow
                  icon={ReceiptIcon}
                  tone="warning"
                  title={r.type}
                  meta={`${r.date} · ${r.paymentMethod}`}
                  badge={<Badge tone="success">{r.status}</Badge>}
                  trailing={<span className="text-title tabular">{r.amount} ج.م</span>}
                  onClick={() => showReceipt(r)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
