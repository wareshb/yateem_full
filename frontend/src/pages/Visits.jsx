import { mockVisits } from '../data/mock';

export default function Visits() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="section-title">
        <h2>المتابعة الميدانية</h2>
        <span className="small">سجل زيارات الباحثين الاجتماعيين</span>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>اليتيم</th>
              <th>تاريخ الزيارة</th>
              <th>التقييم</th>
              <th>الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {mockVisits.map((v) => (
              <tr key={v.id}>
                <td>{v.orphan}</td>
                <td>{v.date}</td>
                <td><span className="tag yellow">{v.score}/10</span></td>
                <td>{v.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card">
        <div className="section-title">
          <h2>تسجيل زيارة</h2>
          <span className="small">إضافة تقرير زيارة ميدانية جديد</span>
        </div>
        <div className="form-grid">
          <Input label="اليتيم" placeholder="اسم اليتيم" />
          <Input label="تاريخ الزيارة" type="date" />
          <Input label="تقييم الوضع" type="number" placeholder="من 1 إلى 10" />
          <div className="input" style={{ gridColumn: '1/-1' }}>
            <label>تقرير الزيارة</label>
            <textarea rows={3} placeholder="تفاصيل الزيارة والوضع المعيشي..." />
          </div>
          <div className="input" style={{ gridColumn: '1/-1' }}>
            <label>توصيات التدخل</label>
            <textarea rows={3} placeholder="مثال: يحتاج دعم صحي عاجل..." />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="button">حفظ التقرير</button>
        </div>
      </section>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="input">
      <label>{label}</label>
      <input {...props} />
    </div>
  );
}