import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Section, Input, DateInput, Textarea } from '../../components/FormComponents';
import { formatDateForDisplay, formatDateForServer } from '../../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function MarketingOrganizationsEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrganization();
    }, [id]);

    const fetchOrganization = async () => {
        try {
            const res = await axios.get(`${API_URL}/marketing-organizations/${id}`);
            const data = res.data;
            setFormData({
                ...data,
                marketing_date: formatDateForDisplay(data.marketing_date)
            });
        } catch (err) {
            alert('خطأ في تحميل البيانات');
            navigate('/marketing-organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                marketing_date: formatDateForServer(formData.marketing_date)
            };
            await axios.put(`${API_URL}/marketing-organizations/${id}`, dataToSend);
            alert('تم تحديث البيانات بنجاح');
            navigate(`/marketing-organizations/${id}`);
        } catch (err) {
            alert('حدث خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div>جاري التحميل...</div>;
    if (!formData) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>تعديل بيانات الجهة: {formData.name}</h2>
                <button type="button" className="button secondary" onClick={() => navigate(`/marketing-organizations/${id}`)}>
                    إلغاء
                </button>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <Section title="بيانات الجهة">
                        <Input label="اسم الجهة" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        <Input label="البريد الإلكتروني" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <Input label="رقم الهاتف" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        <Input label="المسؤول عن قطاع الأيتام" value={formData.responsible_person} onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })} />
                        <DateInput label="تاريخ التسويق" value={formData.marketing_date} onChange={(e) => setFormData({ ...formData, marketing_date: e.target.value })} />
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
