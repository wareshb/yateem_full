import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Section, Input, Select, DateInput, Textarea } from '../../components/FormComponents';
import { formatDateForServer } from '../../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function SponsorshipsCreate() {
    const navigate = useNavigate();
    const [orphans, setOrphans] = useState([]);
    const [sponsors, setSponsors] = useState([]);
    const [formData, setFormData] = useState({
        orphan_id: '',
        sponsor_id: '',
        sponsorship_type: 'مالية',
        amount: '',
        currency: 'ريال يمني',
        payment_frequency: 'شهري',
        start_date: '',
        end_date: '',
        status: 'active',
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orphansRes, sponsorsRes] = await Promise.all([
                    axios.get(`${API_URL}/orphans`),
                    axios.get(`${API_URL}/sponsors`)
                ]);
                setOrphans(orphansRes.data);
                setSponsors(sponsorsRes.data);
            } catch (err) {
                console.error('خطأ في تحميل البيانات:', err);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                start_date: formatDateForServer(formData.start_date),
                end_date: formatDateForServer(formData.end_date)
            };

            await axios.post(`${API_URL}/sponsorships`, dataToSend);
            alert('تم تسجيل الكفالة بنجاح');
            navigate('/sponsorships');
        } catch (err) {
            alert('خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>تسجيل كفالة جديدة</h2>
                <button type="button" className="button secondary" onClick={() => navigate('/sponsorships')}>
                    إلغاء
                </button>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <Section title="أطراف الكفالة">
                        <Select label="اليتيم" value={formData.orphan_id} onChange={(e) => setFormData({ ...formData, orphan_id: e.target.value })} required>
                            <option value="">-- اختر اليتيم --</option>
                            {orphans.map(o => (
                                <option key={o.id} value={o.id}>{o.full_name}</option>
                            ))}
                        </Select>
                        <Select label="الكافل" value={formData.sponsor_id} onChange={(e) => setFormData({ ...formData, sponsor_id: e.target.value })} required>
                            <option value="">-- اختر الكافل --</option>
                            {sponsors.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </Select>
                    </Section>

                    <Section title="تفاصيل الكفالة">
                        <Select label="نوع الكفالة" value={formData.sponsorship_type} onChange={(e) => setFormData({ ...formData, sponsorship_type: e.target.value })}>
                            <option value="مالية">مالية</option>
                            <option value="تعليمية">تعليمية</option>
                            <option value="غذائية">غذائية</option>
                            <option value="صحية">صحية</option>
                        </Select>
                        <Input label="المبلغ" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                        <Select label="العملة" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
                            <option value="ريال يمني">ريال يمني</option>
                            <option value="ريال سعودي">ريال سعودي</option>
                            <option value="دولار أمريكي">دولار أمريكي</option>
                        </Select>
                        <Select label="تكرار الدفع" value={formData.payment_frequency} onChange={(e) => setFormData({ ...formData, payment_frequency: e.target.value })}>
                            <option value="شهري">شهري</option>
                            <option value="ربع سنوي">ربع سنوي</option>
                            <option value="نصف سنوي">نصف سنوي</option>
                            <option value="سنوي">سنوي</option>
                            <option value="مرة واحدة">مرة واحدة</option>
                        </Select>
                        <DateInput label="تاريخ البدء" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                        <DateInput label="تاريخ الانتهاء" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                        <Select label="حالة الكفالة" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                            <option value="active">نشطة</option>
                            <option value="suspended">متوقفة</option>
                            <option value="expired">منتهية</option>
                        </Select>
                        <Textarea label="ملاحظات" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                    </Section>

                    <div style={{ gridColumn: '1/-1', marginTop: 20 }}>
                        <button type="submit" className="button" style={{ width: '100%', padding: 16 }}>
                            حفظ الكفالة
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
