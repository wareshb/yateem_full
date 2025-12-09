import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Section, Input, Select, Textarea } from '../../components/FormComponents';

const API_URL = 'http://localhost:4000/api';

export default function SponsorsCreate() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'فرد',
        name: '',
        address: '',
        phone: '',
        email: '',
        sponsorship_type: 'مالية',
        payment_method: 'تحويل',
        conditions: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/sponsors`, formData);
            alert('تم إضافة الكافل بنجاح');
            navigate('/sponsors');
        } catch (err) {
            alert('خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>إضافة كافل جديد</h2>
                <button type="button" className="button secondary" onClick={() => navigate('/sponsors')}>
                    إلغاء
                </button>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <Section title="بيانات الكافل">
                        <Select label="نوع الجهة" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                            <option value="فرد">فرد</option>
                            <option value="جمعية">جمعية</option>
                            <option value="مؤسسة">مؤسسة</option>
                            <option value="منظمة دولية">منظمة دولية</option>
                        </Select>
                        <Input label="اسم الجهة/الكافل" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        <Input label="العنوان" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        <Input label="الهاتف" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        <Input label="البريد الإلكتروني" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </Section>

                    <Section title="تفاصيل الكفالة">
                        <Select label="نوع الكفالة" value={formData.sponsorship_type} onChange={(e) => setFormData({ ...formData, sponsorship_type: e.target.value })}>
                            <option value="مالية">مالية</option>
                            <option value="تعليمية">تعليمية</option>
                            <option value="غذائية">غذائية</option>
                            <option value="صحية">صحية</option>
                        </Select>
                        <Select label="طريقة الدفع" value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}>
                            <option value="تحويل">تحويل</option>
                            <option value="نقد">نقد</option>
                            <option value="كوبونات">كوبونات</option>
                        </Select>
                        <Textarea label="شروط الكفالة" value={formData.conditions} onChange={(e) => setFormData({ ...formData, conditions: e.target.value })} />
                    </Section>

                    <div style={{ gridColumn: '1/-1', marginTop: 20 }}>
                        <button type="submit" className="button" style={{ width: '100%', padding: 16 }}>
                            حفظ بيانات الكافل
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
