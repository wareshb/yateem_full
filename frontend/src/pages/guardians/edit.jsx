import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Section, Input, DateInput, Textarea } from '../../components/FormComponents';
import { formatDateForServer, formatDateForDisplay } from '../../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function GuardiansEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // Updated import
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type') || 'guardian';

    useEffect(() => {
        fetchGuardian();
    }, [id]);

    const fetchGuardian = async () => {
        try {
            const res = await axios.get(`${API_URL}/guardians/${id}?type=${type}`);
            const data = res.data;
            setFormData({
                ...data,
                date_of_birth: formatDateForDisplay(data.date_of_birth)
            });
        } catch (err) {
            alert('خطأ في تحميل البيانات');
            navigate('/guardians');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                date_of_birth: formatDateForServer(formData.date_of_birth)
            };

            await axios.patch(`${API_URL}/guardians/${id}?type=${type}`, dataToSend);
            alert('تم تحديث البيانات بنجاح');
            navigate(`/guardians/${id}?type=${type}`);
        } catch (err) {
            alert('خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div>جاري التحميل...</div>;
    if (!formData) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>
                    تعديل بيانات {type === 'mother' ? 'الأم' : 'المعيل'}: {formData.full_name}
                    <span className={`tag ${type === 'mother' ? 'blue' : 'orange'}`} style={{ marginRight: 10, fontSize: '0.8rem' }}>
                        {type === 'mother' ? 'أم' : 'معيل'}
                    </span>
                </h2>
                <button type="button" className="button secondary" onClick={() => navigate(`/guardians/${id}?type=${type}`)}>
                    إلغاء
                </button>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <Section title="البيانات الشخصية">
                        <Input label="الاسم الرباعي" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                        <DateInput label="تاريخ الميلاد" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
                        <Input label="رقم الهوية" value={formData.id_number} onChange={(e) => setFormData({ ...formData, id_number: e.target.value })} />
                        <Input label="صلة القرابة" value={formData.relationship} onChange={(e) => setFormData({ ...formData, relationship: e.target.value })} />
                        <Input label="رقم التواصل" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        <Input label="العنوان" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    </Section>

                    <Section title="البيانات المهنية والمعيشية">
                        <Input label="المهنة" value={formData.current_occupation} onChange={(e) => setFormData({ ...formData, current_occupation: e.target.value })} />
                        <Input label="الدخل الشهري" type="number" value={formData.monthly_income} onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })} />
                        <Input label="الحالة الصحية" value={formData.health_condition} onChange={(e) => setFormData({ ...formData, health_condition: e.target.value })} />
                        <Textarea label="ملاحظات" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
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
