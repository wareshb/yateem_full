import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function SponsorshipsShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sponsorship, setSponsorship] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSponsorship();
    }, [id]);

    const fetchSponsorship = async () => {
        try {
            const res = await axios.get(`${API_URL}/sponsorships/${id}`);
            setSponsorship(res.data);
        } catch (err) {
            alert('خطأ في تحميل البيانات');
            navigate('/sponsorships');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>جاري التحميل...</div>;
    if (!sponsorship) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>تفاصيل الكفالة</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button" onClick={() => navigate(`/sponsorships/${id}/edit`)}>
                        تعديل
                    </button>
                    <button className="button secondary" onClick={() => navigate('/sponsorships')}>
                        عودة
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="details-grid">
                    <DetailItem label="اليتيم" value={sponsorship.orphan_name} />
                    <DetailItem label="الكافل" value={sponsorship.sponsor_name} />
                    <DetailItem label="نوع الكفالة" value={sponsorship.sponsorship_type} />
                    <DetailItem label="المبلغ" value={`${sponsorship.amount} ${sponsorship.currency}`} />
                    <DetailItem label="تكرار الدفع" value={sponsorship.payment_frequency} />
                    <DetailItem label="تاريخ البدء" value={sponsorship.start_date} />
                    <DetailItem label="تاريخ الانتهاء" value={sponsorship.end_date} />
                    <DetailItem label="الحالة" value={sponsorship.status === 'active' ? 'نشطة' : (sponsorship.status === 'suspended' ? 'متوقفة' : 'منتهية')} />
                    <DetailItem label="ملاحظات" value={sponsorship.notes} />
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value }) {
    return (
        <div style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <strong style={{ minWidth: 120 }}>{label}:</strong>
            <span>{value || '-'}</span>
        </div>
    );
}
