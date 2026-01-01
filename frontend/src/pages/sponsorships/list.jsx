import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function SponsorshipsList() {
    const [sponsorships, setSponsorships] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSponsorships();
    }, []);

    const fetchSponsorships = async () => {
        try {
            const res = await axios.get(`${API_URL}/sponsorships`);
            setSponsorships(res.data);
        } catch (err) {
            console.error('خطأ في تحميل الكفالات:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>إدارة الكفالات</h2>
                <button className="button" onClick={() => navigate('/sponsorships/create')}>
                    + تسجيل كفالة جديدة
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>جاري التحميل...</div>
                ) : sponsorships.length === 0 ? (
                    <p>لا توجد بيانات</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>اليتيم</th>
                                <th>الكافل</th>
                                <th>نوع الكفالة</th>
                                <th>المبلغ</th>
                                <th>الحالة</th>
                                <th>تاريخ الانتهاء</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sponsorships.map((s) => (
                                <tr key={s.id}>
                                    <td><strong>{s.orphan_name}</strong></td>
                                    <td>{s.sponsor_name}</td>
                                    <td>{s.sponsorship_type}</td>
                                    <td>{s.amount} {s.currency}</td>
                                    <td>
                                        <span className={`tag ${s.status === 'active' ? 'green' : 'red'}`}>
                                            {s.status === 'active' ? 'نشطة' : 'متوقفة'}
                                        </span>
                                    </td>
                                    <td>{s.end_date}</td>
                                    <td>
                                        <button
                                            className="button secondary"
                                            style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                                            onClick={() => navigate(`/sponsorships/${s.id}`)}
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
