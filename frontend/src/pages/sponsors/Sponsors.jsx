import { mockSponsors } from '../data/mock';

export default function Sponsors() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="section-title">
        <h2>الجهات الكافلة</h2>
        <span className="small">إدارة الكفلاء والمؤسسات الداعمة</span>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>النوع</th>
              <th>رقم التواصل</th>
              <th>حالة الكفالة</th>
            </tr>
          </thead>
          <tbody>
            {mockSponsors.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td><span className="tag secondary">{s.type}</span></td>
                <td>{s.contact}</td>
                <td>{s.active}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card">
        <div className="section-title">
          <h2>إضافة كافل جديد</h2>
          <span className="small">أفراد / جمعيات / مؤسسات / منظمات</span>
        </div>
        <div className="form-grid">
          <Input label="نوع الجهة" as="select">
            <option>فرد</option>
            <option>جمعية</option>
            <option>مؤسسة</option>
            <option>منظمة دولية</option>
          </Input>
          <Input label="اسم الجهة/الكافل" placeholder="الاسم الكامل" />
          <Input label="العنوان" placeholder="المحافظة - الحي" />
          <Input label="الهاتف" placeholder="01xxxxxx" />
          <Input label="البريد الإلكتروني" placeholder="info@example.org" />
          <Input label="نوع الكفالة" as="select">
            <option>مالية</option>
            <option>تعليمية</option>
            <option>غذائية</option>
            <option>صحية</option>
          </Input>
          <Input label="طريقة الدفع" as="select">
            <option>تحويل</option>
            <option>نقد</option>
            <option>كوبونات</option>
          </Input>
          <Input label="شروط الكفالة" placeholder="مثال: تقارير دورية مطلوبة" />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="button">حفظ بيانات الكافل</button>
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