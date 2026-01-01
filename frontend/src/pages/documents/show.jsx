import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function DocumentsShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocument();
    }, [id]);

    const fetchDocument = async () => {
        try {
            const res = await axios.get(`${API_URL}/documents/${id}`);
            setDocument(res.data);
        } catch (err) {
            alert('خطأ في تحميل البيانات');
            navigate('/documents');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>جاري التحميل...</div>;
    if (!document) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>تفاصيل المستند: {document.title}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button" onClick={() => window.open(document.url, '_blank')}>
                        تحميل الملف
                    </button>
                    <button className="button secondary" onClick={() => navigate('/documents')}>
                        عودة
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="details-grid">
                    <DetailItem label="العنوان" value={document.title} />
                    <DetailItem label="النوع" value={document.type} />
                    <DetailItem label="خاص بـ" value={document.related_to_name} />
                    <DetailItem label="تاريخ الرفع" value={document.upload_date} />
                    <DetailItem label="الوصف" value={document.description} fullWidth />
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
            <span>{value || '-'}</span>
        </div>
    );
}
