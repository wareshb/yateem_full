import { mockGuardians } from '../data/mock';

export default function Guardians() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="section-title">
        <h2>بيانات المعيلين</h2>
        <span className="small">إدارة بيانات المعيلين وسجل الزيارات</span>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>المهنة</th>
              <th>الدخل الشهري</th>
              <th>عدد الأيتام</th>
              <th>التقييم</th>
            </tr>
          </thead>
          <tbody>
            {mockGuardians.map((g) => (
              <tr key={g.id}>
                <td>{g.name}</td>
                <td>{g.phone}</td>
                <td>{g.job}</td>
                <td>${g.income}</td>
                <td>{g.children}</td>
                <td><span className="tag green">{g.rating}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card">
        <div className="section-title">
          <h2>إضافة/تعديل معيل</h2>
          <span className="small">أدخل بيانات المعيل الجديد أدناه</span>
        </div>
        <div className="form-grid">
          <Input label="الاسم الرباعي" placeholder="مثال: محمد علي أحمد" />
          <Input label="تاريخ الميلاد" type="date" />
          <Input label="رقم الهوية" placeholder="010112233" />
          <Input label="صلة القرابة" placeholder="عم / خال / جد" />
          <Input label="رقم التواصل" placeholder="77xxxxxxx" />
          <Input label="العنوان" placeholder="المحافظة - المديرية - الحي" />
          <Input label="المهنة" placeholder="مدرس / تاجر" />
          <Input label="الدخل الشهري" type="number" />
          <Input label="الحالة الصحية" placeholder="جيد" />
          <div className="input" style={{ gridColumn: '1/-1' }}>
            <label>ملاحظات</label>
            <textarea rows={3} placeholder="تفاصيل إضافية..." />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="button">حفظ البيانات</button>
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