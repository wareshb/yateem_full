import { mockStats } from '../../data/mock';

export default function Dashboard() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="section-title">
        <h2>لوحة التحكم</h2>
        <span className="small">نظرة عامة على النظام</span>
      </div>

      <div className="grid cols-4">
        <div className="card">
          <small>الأيتام</small>
          <h2 style={{ margin: '8px 0' }}>{mockStats.orphans}</h2>
          <span className="tag green">+12 هذا الشهر</span>
        </div>
        <div className="card">
          <small>الكفلاء</small>
          <h2 style={{ margin: '8px 0' }}>{mockStats.sponsors}</h2>
          <span className="tag green">+5 هذا الشهر</span>
        </div>
        <div className="card">
          <small>الكفالات النشطة</small>
          <h2 style={{ margin: '8px 0' }}>{mockStats.activeSponsorships}</h2>
          <span className="tag yellow">98% نسبة التغطية</span>
        </div>
        <div className="card">
          <small>الزيارات (شهري)</small>
          <h2 style={{ margin: '8px 0' }}>{mockStats.visitsMonth}</h2>
          <span className="tag green">مكتمل</span>
        </div>
      </div>

      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3>توزيع الأيتام (حسب الحالة)</h3>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mockStats.byStatus.map((s) => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span>{s.label}</span>
                <strong>{s.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>آخر النشاطات</h3>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="activity-item">
              <span className="tag green">كفالة جديدة</span>
              <span>تمت كفالة اليتيم <strong>أحمد علي</strong> بواسطة <strong>مؤسسة الرحمة</strong></span>
              <small style={{ color: 'var(--text-secondary)' }}>منذ 2 ساعة</small>
            </div>
            <div className="activity-item">
              <span className="tag yellow">زيارة ميدانية</span>
              <span>قام الباحث <strong>سالم</strong> بزيارة أسرة <strong>آل محمد</strong></span>
              <small style={{ color: 'var(--text-secondary)' }}>منذ 5 ساعات</small>
            </div>
            <div className="activity-item">
              <span className="tag secondary">مستخدم جديد</span>
              <span>تم تسجيل <strong>منى أحمد</strong> كمدخل بيانات</span>
              <small style={{ color: 'var(--text-secondary)' }}>أمس</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
