import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function VisitsList() {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try {
            const res = await axios.get(`${API_URL}/visits`);
            setVisits(res.data);
        } catch (err) {
            console.error('خطأ في تحميل الزيارات:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>سجل الزيارات الميدانية</h2>
                <button className="button" onClick={() => navigate('/visits/create')}>
                    + تسجيل زيارة جديدة
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>جاري التحميل...</div>
                ) : visits.length === 0 ? (
                    <p>لا توجد بيانات</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>اليتيم</th>
                                <th>الباحث</th>
                                <th>تاريخ الزيارة</th>
                                <th>نوع الزيارة</th>
                                <th>النتيجة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visits.map((v) => (
                                <tr key={v.id}>
                                    <td><strong>{v.orphan_name}</strong></td>
                                    <td>{v.researcher_name}</td>
                                    <td>{v.visit_date}</td>
                                    <td>{v.visit_type}</td>
                                    <td>
                                        <span className={`tag ${v.outcome === 'positive' ? 'green' : 'red'}`}>
                                            {v.outcome_text}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="button secondary"
                                            style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                                            onClick={() => navigate(`/visits/${v.id}`)}
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
