export default function Settings() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="section-title">
        <h2>الإعدادات العامة</h2>
        <span className="small">تخصيص النظام والنسخ الاحتياطي</span>
      </div>

      <section className="card">
        <div className="section-title">
          <h2>عام</h2>
          <span className="small">اسم النظام والشعار</span>
        </div>
        <div className="form-grid">
          <Input label="اسم النظام" placeholder="نظام إدارة الأيتام..." />
          <Input label="وصف النظام" placeholder="وصف مختصر" />
          <div className="input">
            <label>الشعار</label>
            <input type="file" />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>إعدادات الكفالة الافتراضية</h2>
          <span className="small">القيم الافتراضية</span>
        </div>
        <div className="form-grid">
          <Input label="المبلغ الافتراضي للكفالة" type="number" />
          <Input label="العملة" as="select">
            <option>دولار</option>
            <option>ريال</option>
          </Input>
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>إعدادات البريد</h2>
          <span className="small">خادم SMTP للإشعارات</span>
        </div>
        <div className="form-grid">
          <Input label="خادم SMTP" placeholder="smtp.mail.com" />
          <Input label="البريد المرسل" placeholder="noreply@example.com" />
          <Input label="كلمة المرور" type="password" />
          <Input label="المنفذ" type="number" />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="button">حفظ الإعدادات</button>
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