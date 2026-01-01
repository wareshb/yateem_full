import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Section, Input, DateInput, Textarea } from '../../components/FormComponents';
import { formatDateForServer } from '../../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function GuardiansCreate() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        date_of_birth: '',
        id_number: '',
        relationship: '', // صلة القرابة
        phone: '',
        address: '',
        current_occupation: '',
        monthly_income: '',
        health_condition: '',
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                date_of_birth: formatDateForServer(formData.date_of_birth)
            };

            await axios.post(`${API_URL}/guardians`, dataToSend);
            alert('تم إضافة المعيل بنجاح');
            navigate('/guardians');
        } catch (err) {
            alert('خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>إضافة معيل جديد</h2>
                <button type="button" className="button secondary" onClick={() => navigate('/guardians')}>
                    إلغاء
                </button>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <Section title="البيانات الشخصية">
                        <Input label="الاسم الرباعي" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                        <DateInput label="تاريخ الميلاد" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
                        <Input label="رقم الهوية" value={formData.id_number} onChange={(e) => setFormData({ ...formData, id_number: e.target.value })} />
                        <Input label="صلة القرابة" value={formData.relationship} onChange={(e) => setFormData({ ...formData, relationship: e.target.value })} placeholder="عم / خال / جد" />
                        <Input label="رقم التواصل" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        <Input label="العنوان" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="المحافظة - المديرية - الحي" />
                    </Section>

                    <Section title="البيانات المهنية والمعيشية">
                        <Input label="المهنة" value={formData.current_occupation} onChange={(e) => setFormData({ ...formData, current_occupation: e.target.value })} />
                        <Input label="الدخل الشهري" type="number" value={formData.monthly_income} onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })} />
                        <Input label="الحالة الصحية" value={formData.health_condition} onChange={(e) => setFormData({ ...formData, health_condition: e.target.value })} />
                        <Textarea label="ملاحظات" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                    </Section>

                    <div style={{ gridColumn: '1/-1', marginTop: 20 }}>
                        <button type="submit" className="button" style={{ width: '100%', padding: 16 }}>
                            حفظ البيانات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
