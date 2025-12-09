import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function GuardiansList() {
    const [guardians, setGuardians] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGuardians();
    }, []);

    const fetchGuardians = async () => {
        try {
            const res = await axios.get(`${API_URL}/guardians`);
            setGuardians(res.data);
        } catch (err) {
            console.error('خطأ في تحميل المعيلين:', err);
            // Fallback to mock data if API fails for now, or just show empty
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>بيانات المعيلين</h2>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>جاري التحميل...</div>
                ) : guardians.length === 0 ? (
                    <p>لا توجد بيانات</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>النوع</th>
                                <th>الاسم</th>
                                <th>رقم الهاتف</th>
                                <th>المهنة</th>
                                <th>عدد الأيتام</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guardians.map((g, i) => (
                                <tr key={i}>
                                    <td>
                                        <span className={`tag ${g.type === 'mother' ? 'blue' : 'orange'}`}>
                                            {g.type === 'mother' ? 'أم' : 'معيل'}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{g.full_name}</strong>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {g.relationship === 'Mother' ? 'والدة الأيتام' : g.relationship}
                                        </div>
                                    </td>
                                    <td>{g.phone}</td>
                                    <td>{g.job}</td>
                                    <td>
                                        <span className="tag">{g.orphans_count}</span>
                                    </td>
                                    <td>
                                        <span className="tag green">{g.rating || 'جيد'}</span>
                                    </td>
                                    <td>
                                        <button
                                            className="button secondary"
                                            style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                                            onClick={() => navigate(`/guardians/${g.id}?type=${g.type}`)}
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
