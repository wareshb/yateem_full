import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Section, Input, Select, DateInput, Textarea } from '../../components/FormComponents';
import { formatDateForServer } from '../../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function VisitsCreate() {
    const navigate = useNavigate();
    const [orphans, setOrphans] = useState([]);
    const [formData, setFormData] = useState({
        orphan_id: '',
        researcher_name: '',
        visit_date: '',
        visit_type: 'دورية', // دورية / طارئة / تقييم
        visit_purpose: '',
        findings: '',
        recommendations: '',
        status: 'completed'
    });

    useEffect(() => {
        const fetchOrphans = async () => {
            try {
                const res = await axios.get(`${API_URL}/orphans`);
                setOrphans(res.data);
            } catch (err) {
                console.error('خطأ في تحميل الأيتام:', err);
            }
        };
        fetchOrphans();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                visit_date: formatDateForServer(formData.visit_date)
            };

            await axios.post(`${API_URL}/visits`, dataToSend);
            alert('تم تسجيل الزيارة بنجاح');
            navigate('/visits');
        } catch (err) {
            alert('خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>تسجيل زيارة ميدانية جديدة</h2>
                <button type="button" className="button secondary" onClick={() => navigate('/visits')}>
                    إلغاء
                </button>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <Section title="بيانات الزيارة">
                        <Select label="اليتيم" value={formData.orphan_id} onChange={(e) => setFormData({ ...formData, orphan_id: e.target.value })} required>
                            <option value="">-- اختر اليتيم --</option>
                            {orphans.map(o => (
                                <option key={o.id} value={o.id}>{o.full_name}</option>
                            ))}
                        </Select>
                        <Input label="اسم الباحث/الزائر" value={formData.researcher_name} onChange={(e) => setFormData({ ...formData, researcher_name: e.target.value })} required />
                        <DateInput label="تاريخ الزيارة" value={formData.visit_date} onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })} />
                        <Select label="نوع الزيارة" value={formData.visit_type} onChange={(e) => setFormData({ ...formData, visit_type: e.target.value })}>
                            <option value="دورية">دورية</option>
                            <option value="طارئة">طارئة</option>
                            <option value="تقييم">تقييم</option>
                            <option value="توزيع مساعدات">توزيع مساعدات</option>
                        </Select>
                        <Input label="الغرض من الزيارة" value={formData.visit_purpose} onChange={(e) => setFormData({ ...formData, visit_purpose: e.target.value })} />
                    </Section>

                    <Section title="نتائج الزيارة">
                        <Textarea label="الملاحظات والنتائج" value={formData.findings} onChange={(e) => setFormData({ ...formData, findings: e.target.value })} rows={4} />
                        <Textarea label="التوصيات" value={formData.recommendations} onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })} rows={4} />
                        <Select label="حالة الزيارة" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                            <option value="completed">مكتملة</option>
                            <option value="scheduled">مجدولة (لم تتم بعد)</option>
                            <option value="cancelled">ملغاة</option>
                        </Select>
                    </Section>

                    <div style={{ gridColumn: '1/-1', marginTop: 20 }}>
                        <button type="submit" className="button" style={{ width: '100%', padding: 16 }}>
                            حفظ الزيارة
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
