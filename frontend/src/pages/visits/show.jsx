import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function VisitsShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [visit, setVisit] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVisit();
    }, [id]);

    const fetchVisit = async () => {
        try {
            const res = await axios.get(`${API_URL}/visits/${id}`);
            setVisit(res.data);
        } catch (err) {
            alert('خطأ في تحميل البيانات');
            navigate('/visits');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>جاري التحميل...</div>;
    if (!visit) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>تفاصيل الزيارة</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button" onClick={() => navigate(`/visits/${id}/edit`)}>
                        تعديل
                    </button>
                    <button className="button secondary" onClick={() => navigate('/visits')}>
                        عودة
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="details-grid">
                    <DetailItem label="اليتيم" value={visit.orphan_name} />
                    <DetailItem label="الباحث" value={visit.researcher_name} />
                    <DetailItem label="تاريخ الزيارة" value={visit.visit_date} />
                    <DetailItem label="نوع الزيارة" value={visit.visit_type} />
                    <DetailItem label="الغرض" value={visit.visit_purpose} />
                    <DetailItem label="الحالة" value={visit.status === 'completed' ? 'مكتملة' : (visit.status === 'scheduled' ? 'مجدولة' : 'ملغاة')} />
                    <DetailItem label="الملاحظات والنتائج" value={visit.findings} fullWidth />
                    <DetailItem label="التوصيات" value={visit.recommendations} fullWidth />
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value, fullWidth }) {
    return (
        <div style={{
            display: 'flex',
            gap: 8,
            padding: '8px 0',
            borderBottom: '1px solid #eee',
            gridColumn: fullWidth ? '1/-1' : 'auto',
            flexDirection: fullWidth ? 'column' : 'row'
        }}>
            <strong style={{ minWidth: 120 }}>{label}:</strong>
            <span style={{ whiteSpace: fullWidth ? 'pre-wrap' : 'normal' }}>{value || '-'}</span>
        </div>
    );
}
