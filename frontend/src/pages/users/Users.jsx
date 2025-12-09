import { mockUsers } from '../data/mock';

export default function Users() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="section-title">
        <h2>المستخدمين والصلاحيات</h2>
        <span className="small">إدارة حسابات النظام والأدوار</span>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الدور</th>
              <th>البريد الإلكتروني</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td><span className="tag secondary">{u.role}</span></td>
                <td>{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card">
        <div className="section-title">
          <h2>إضافة مستخدم</h2>
          <span className="small">إدارة فريق العمل والصلاحيات</span>
        </div>
        <div className="form-grid">
          <Input label="الاسم" placeholder="الاسم الكامل" />
          <Input label="البريد الإلكتروني" placeholder="name@example.com" />
          <Input label="الدور" as="select">
            <option value="admin">مدير النظام</option>
            <option value="social_worker">باحث اجتماعي</option>
            <option value="data_entry">مدخل بيانات</option>
            <option value="accountant">محاسب</option>
            <option value="auditor">مراقب</option>
          </Input>
          <Input label="كلمة المرور" type="password" />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="button">حفظ المستخدم</button>
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