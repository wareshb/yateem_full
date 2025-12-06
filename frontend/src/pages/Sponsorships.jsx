import { mockSponsorships } from '../data/mock';

export default function Sponsorships() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="section-title">
        <h2>إدارة الكفالات</h2>
        <span className="small">تسجيل ومتابعة الكفالات المالية والعينية</span>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>اليتيم</th>
              <th>الكافل</th>
              <th>نوع الكفالة</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th>الموعد القادم</th>
            </tr>
          </thead>
          <tbody>
            {mockSponsorships.map((s) => (
              <tr key={s.id}>
                <td>{s.orphan}</td>
                <td>{s.sponsor}</td>
                <td>{s.type}</td>
                <td>${s.amount}</td>
                <td>
                  <span className={s.status === 'active' ? 'tag green' : 'tag yellow'}>
                    {s.status === 'active' ? 'نشطة' : 'متوقفة'}
                  </span>
                </td>
                <td>{s.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card">
        <div className="section-title">
          <h2>تسجيل كفالة جديدة</h2>
          <span className="small">ربط طفل بكافل وتحديد خطة الدفع</span>
        </div>
        <div className="form-grid">
          <Input label="اليتيم" placeholder="اسم اليتيم" />
          <Input label="الكافل" placeholder="اسم الكافل" />
          <Input label="نوع الكفالة" as="select">
            <option>مالية</option>
            <option>تعليمية</option>
            <option>غذائية</option>
            <option>صحية</option>
          </Input>
          <Input label="المبلغ (شهرياً)" type="number" />
          <Input label="العملة" as="select">
            <option>دولار</option>
            <option>ريال</option>
          </Input>
          <Input label="تكرار الدفع" as="select">
            <option>شهري</option>
            <option>ربع سنوي</option>
            <option>سنوي</option>
          </Input>
          <Input label="تاريخ البدء" type="date" />
          <Input label="تاريخ الانتهاء" type="date" />
          <Input label="حالة الكفالة" as="select">
            <option>نشطة</option>
            <option>متوقفة</option>
            <option>منتهية</option>
          </Input>
          <div className="input" style={{ gridColumn: '1/-1' }}>
            <label>ملاحظات</label>
            <textarea rows={3} placeholder="شروط خاصة أو ملاحظات..." />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="button">حفظ الكفالة</button>
        </div>
      </section>
    </div>
  );
}

function Input({ label, as = 'input', children, ...props }) {
  if (as === 'select') {
    return (
      <div className="input">
        <label>{label}</label>
        <select {...props}>{children}</select>
      </div>
    );
  }
  return (
    <div className="input">
      <label>{label}</label>
      <input {...props} />
    </div>
  );
}