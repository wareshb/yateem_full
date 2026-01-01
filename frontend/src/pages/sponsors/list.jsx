import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function SponsorsList() {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSponsors();
    }, []);

    const fetchSponsors = async () => {
        try {
            const res = await axios.get(`${API_URL}/sponsors`);
            setSponsors(res.data);
        } catch (err) {
            console.error('خطأ في تحميل الكفلاء:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>الجهات الكافلة</h2>
                <button className="button" onClick={() => navigate('/sponsors/create')}>
                    + إضافة كافل
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>جاري التحميل...</div>
                ) : sponsors.length === 0 ? (
                    <p>لا توجد بيانات</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>النوع</th>
                                <th>رقم التواصل</th>
                                <th>حالة الكفالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sponsors.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.name}</td>
                                    <td><span className="tag secondary">{s.type}</span></td>
                                    <td>{s.phone || s.contact}</td>
                                    <td>{s.active ? 'نشط' : 'غير نشط'}</td>
                                    <td>
                                        <button
                                            className="button secondary"
                                            style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                                            onClick={() => navigate(`/sponsors/${s.id}`)}
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
