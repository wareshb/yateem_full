import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Section, Input, Select, DateInput, Textarea } from '../../components/FormComponents';
import { formatDateForServer, formatDateForDisplay } from '../../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function VisitsEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [orphans, setOrphans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [visitRes, orphansRes] = await Promise.all([
                    axios.get(`${API_URL}/visits/${id}`),
                    axios.get(`${API_URL}/orphans`)
                ]);

                const data = visitRes.data;
                setFormData({
                    ...data,
                    visit_date: formatDateForDisplay(data.visit_date)
                });
                setOrphans(orphansRes.data);
            } catch (err) {
                alert('خطأ في تحميل البيانات');
                navigate('/visits');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                visit_date: formatDateForServer(formData.visit_date)
            };

            await axios.put(`${API_URL}/visits/${id}`, dataToSend);
            alert('تم تحديث الزيارة بنجاح');
            navigate(`/visits/${id}`);
        } catch (err) {
            alert('خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div>جاري التحميل...</div>;
    if (!formData) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>تعديل بيانات الزيارة</h2>
                <button type="button" className="button secondary" onClick={() => navigate(`/visits/${id}`)}>
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
                            حفظ التعديلات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
