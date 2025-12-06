import { mockDocuments } from '../data/mock';

export default function Documents() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="section-title">
        <h2>إدارة الوثائق</h2>
        <span className="small">مركز الملفات والمستندات المرفوعة</span>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>المالك</th>
              <th>التصنيف</th>
              <th>تاريخ الإضافة</th>
            </tr>
          </thead>
          <tbody>
            {mockDocuments.map((d) => (
              <tr key={d.id}>
                <td>{d.label}</td>
                <td>{d.owner}</td>
                <td>{d.category}</td>
                <td>{d.added}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card">
        <div className="section-title">
          <h2>رفع مستند</h2>
          <span className="small">إضافة ملف جديد للنظام</span>
        </div>
        <div className="form-grid">
          <Input label="نوع المالك" as="select">
            <option>يتيم</option>
            <option>كافل</option>
            <option>معيل</option>
            <option>زيارة</option>
            <option>أخرى</option>
          </Input>
          <Input label="اسم المالك" placeholder="اسم اليتيم / الكافل / المعيل" />
          <div className="input">
            <label>ملف المرفق</label>
            <input type="file" />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="button">رفع</button>
          <button className="button secondary" style={{ marginInlineStart: 8 }}>مسح الفلاتر</button>
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