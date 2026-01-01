import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function SponsorsShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sponsor, setSponsor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSponsor();
    }, [id]);

    const fetchSponsor = async () => {
        try {
            const res = await axios.get(`${API_URL}/sponsors/${id}`);
            setSponsor(res.data);
        } catch (err) {
            alert('خطأ في تحميل البيانات');
            navigate('/sponsors');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>جاري التحميل...</div>;
    if (!sponsor) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>تفاصيل الكافل: {sponsor.name}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button" onClick={() => navigate(`/sponsors/${id}/edit`)}>
                        تعديل
                    </button>
                    <button className="button secondary" onClick={() => navigate('/sponsors')}>
                        عودة
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="details-grid">
                    <DetailItem label="الاسم" value={sponsor.name} />
                    <DetailItem label="النوع" value={sponsor.type} />
                    <DetailItem label="العنوان" value={sponsor.address} />
                    <DetailItem label="الهاتف" value={sponsor.phone} />
                    <DetailItem label="البريد الإلكتروني" value={sponsor.email} />
                    <DetailItem label="نوع الكفالة" value={sponsor.sponsorship_type} />
                    <DetailItem label="طريقة الدفع" value={sponsor.payment_method} />
                    <DetailItem label="شروط الكفالة" value={sponsor.conditions} />
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
