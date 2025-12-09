import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function DocumentsList() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get(`${API_URL}/documents`);
            setDocuments(res.data);
        } catch (err) {
            console.error('خطأ في تحميل المستندات:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>أرشيف المستندات</h2>
                <button className="button" onClick={() => navigate('/documents/create')}>
                    + رفع مستند جديد
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>جاري التحميل...</div>
                ) : documents.length === 0 ? (
                    <p>لا توجد مستندات</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>اسم المستند</th>
                                <th>النوع</th>
                                <th>خاص بـ</th>
                                <th>تاريخ الرفع</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((d) => (
                                <tr key={d.id}>
                                    <td><strong>{d.title}</strong></td>
                                    <td><span className="tag secondary">{d.type}</span></td>
                                    <td>{d.related_to_name || '-'}</td>
                                    <td>{d.upload_date}</td>
                                    <td>
                                        <button
                                            className="button secondary"
                                            style={{ padding: '4px 12px', fontSize: '0.85rem', marginLeft: 8 }}
                                            onClick={() => window.open(d.url, '_blank')}
                                        >
                                            تحميل
                                        </button>
                                        <button
                                            className="button secondary"
                                            style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                                            onClick={() => navigate(`/documents/${d.id}`)}
                                        >
                                            عرض
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
