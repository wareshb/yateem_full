import { mockStats } from '../../data/mock';
import { DateInput, Input } from '../../components/FormComponents';

export default function Reports() {
    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>التقارير والإحصائيات</h2>
                <span className="small">تحليل البيانات وتصدير التقارير PDF / Excel</span>
            </div>

            <div className="grid cols-3">
                {mockStats.byStatus.map((item) => (
                    <div className="card" key={item.label}>
                        <small>{item.label}</small>
                        <h3 style={{ margin: '6px 0' }}>{item.value}</h3>
                        <span className="tag secondary">حالة</span>
                    </div>
                ))}
            </div>

            <section className="card">
                <div className="section-title">
                    <h2>تصدير تقرير</h2>
                    <span className="small">حدد نوع التقرير والفترة الزمنية</span>
                </div>
                <div className="form-grid">
                    <Input label="نوع التقرير" as="select">
                        <option>عدد الأطفال حسب الفئة العمرية</option>
                        <option>التقارير الجغرافية</option>
                        <option>الكفالات المنتهية</option>
                        <option>الحالات الحرجة</option>
                        <option>تقرير الباحثين الاجتماعيين</option>
                    </Input>
                    <DateInput label="من تاريخ" />
                    <DateInput label="إلى تاريخ" />
                    <Input label="المحافظة" placeholder="الكل" />
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                    <button className="button">عرض التقرير</button>
                    <button className="button secondary">تصدير PDF</button>
                    <button className="button secondary">تصدير Excel</button>
                </div>
            </section>
        </div>
    );
}
