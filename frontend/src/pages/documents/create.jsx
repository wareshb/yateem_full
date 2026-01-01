import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Section, Input, Select, Textarea } from '../../components/FormComponents';

const API_URL = 'http://localhost:4000/api';

export default function DocumentsCreate() {
    const navigate = useNavigate();
    const [orphans, setOrphans] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        type: 'شهادة ميلاد',
        related_to: 'orphan',
        related_id: '',
        description: '',
        file: null
    });

    useEffect(() => {
        const fetchOrphans = async () => {
            try {
                const res = await axios.get(`${API_URL}/orphans`);
                setOrphans(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrphans();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // In a real app, you'd use FormData here to upload the file
            // const data = new FormData();
            // data.append('file', formData.file);
            // ... append other fields

            // For this mock/demo, we'll just send JSON
            await axios.post(`${API_URL}/documents`, formData);
            alert('تم رفع المستند بنجاح');
            navigate('/documents');
        } catch (err) {
            alert('خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>رفع مستند جديد</h2>
                <button type="button" className="button secondary" onClick={() => navigate('/documents')}>
                    إلغاء
                </button>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <Section title="بيانات المستند">
                        <Input label="عنوان المستند" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                        <Select label="نوع المستند" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                            <option value="شهادة ميلاد">شهادة ميلاد</option>
                            <option value="بطاقة شخصية">بطاقة شخصية</option>
                            <option value="شهادة وفاه">شهادة وفاة</option>
                            <option value="تقرير طبي">تقرير طبي</option>
                            <option value="شهادة مدرسية">شهادة مدرسية</option>
                            <option value="أخرى">أخرى</option>
                        </Select>
                        <Select label="خاص بـ" value={formData.related_to} onChange={(e) => setFormData({ ...formData, related_to: e.target.value })}>
                            <option value="orphan">يتيم</option>
                            <option value="sponsor">كافل</option>
                            <option value="general">عام</option>
                        </Select>

                        {formData.related_to === 'orphan' && (
                            <Select label="اليتيم" value={formData.related_id} onChange={(e) => setFormData({ ...formData, related_id: e.target.value })}>
                                <option value="">-- اختر --</option>
                                {orphans.map(o => (
                                    <option key={o.id} value={o.id}>{o.full_name}</option>
                                ))}
                            </Select>
                        )}

                        <div className="input" style={{ gridColumn: '1/-1' }}>
                            <label>ملف المستند</label>
                            <input type="file" onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })} />
                        </div>

                        <Textarea label="وصف / ملاحظات" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </Section>

                    <div style={{ gridColumn: '1/-1', marginTop: 20 }}>
                        <button type="submit" className="button" style={{ width: '100%', padding: 16 }}>
                            رفع المستند
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
