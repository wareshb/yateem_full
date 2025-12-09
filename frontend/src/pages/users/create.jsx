import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Section, Input, Select } from '../../components/FormComponents';

const API_URL = 'http://localhost:4000/api';

export default function UsersCreate() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        email: '',
        password: '',
        role: 'moderator',
        status: 'active'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/users`, formData);
            alert('تم إضافة المستخدم بنجاح');
            navigate('/users');
        } catch (err) {
            alert('خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>إضافة مستخدم جديد</h2>
                <button type="button" className="button secondary" onClick={() => navigate('/users')}>
                    إلغاء
                </button>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <Section title="بيانات المستخدم">
                        <Input label="الاسم الكامل" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                        <Input label="اسم المستخدم" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                        <Input label="البريد الإلكتروني" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                        <Input label="كلمة المرور" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    </Section>

                    <Section title="الصلاحيات والحالة">
                        <Select label="الدور / الصلاحية" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                            <option value="admin">مدير النظام</option>
                            <option value="moderator">وحدة اللوائح والنظم</option>
                            <option value="researcher">وحدة الأبحاث</option>
                            <option value="finance">الوحدة المالية</option>
                        </Select>
                        <Select label="حالة الحساب" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </Select>
                    </Section>

                    <div style={{ gridColumn: '1/-1', marginTop: 20 }}>
                        <button type="submit" className="button" style={{ width: '100%', padding: 16 }}>
                            حفظ المستخدم
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
