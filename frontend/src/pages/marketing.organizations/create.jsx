import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Section, Input, DateInput, Textarea } from '../../components/FormComponents';
import { formatDateForServer } from '../../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function MarketingOrganizationsCreate() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        responsible_person: '',
        marketing_date: '',
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                marketing_date: formatDateForServer(formData.marketing_date)
            };
            await axios.post(`${API_URL}/marketing-organizations`, dataToSend);
            alert('تم إضافة جهة التسويق بنجاح');
            navigate('/marketing-organizations');
        } catch (err) {
            alert('حدث خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>إضافة جهة تسويق جديدة</h2>
                <button type="button" className="button secondary" onClick={() => navigate('/marketing-organizations')}>
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
                            حفظ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
