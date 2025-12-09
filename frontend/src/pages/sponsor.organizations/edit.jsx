import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Section, Input, Select, DateInput, Textarea } from '../../components/FormComponents';
import { formatDateForDisplay, formatDateForServer } from '../../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function SponsorOrganizationsEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrganization();
    }, [id]);

    const fetchOrganization = async () => {
        try {
            const res = await axios.get(`${API_URL}/sponsor-organizations/${id}`);
            const data = res.data;
            setFormData({
                ...data,
                start_date: formatDateForDisplay(data.start_date)
            });
        } catch (err) {
            alert('خطأ في تحميل البيانات');
            navigate('/sponsor-organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                start_date: formatDateForServer(formData.start_date)
            };
            await axios.put(`${API_URL}/sponsor-organizations/${id}`, dataToSend);
            alert('تم تحديث البيانات بنجاح');
            navigate(`/sponsor-organizations/${id}`);
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
                <button type="button" className="button secondary" onClick={() => navigate(`/sponsor-organizations/${id}`)}>
                    إلغاء
                </button>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <Section title="بيانات الجهة">
                        <Input label="اسم الجهة" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        <Input label="البريد الإلكتروني" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <Input label="رقم الهاتف" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        <Select label="نوع الكفالة" value={formData.sponsorship_type} onChange={(e) => setFormData({ ...formData, sponsorship_type: e.target.value })}>
                            <option value="نقدية">نقدية</option>
                            <option value="دراسية">دراسية</option>
                            <option value="صحية">صحية</option>
                            <option value="نقدية,دراسية">نقدية ودراسية</option>
                            <option value="نقدية,صحية">نقدية وصحية</option>
                        </Select>
                        <Input label="المسؤول عن قطاع الأيتام" value={formData.responsible_person} onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })} />
                        <DateInput label="تاريخ بدء التعامل" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
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
