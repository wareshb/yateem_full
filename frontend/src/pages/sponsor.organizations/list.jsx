import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function SponsorOrganizationsList() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const res = await axios.get(`${API_URL}/sponsor-organizations`);
            setOrganizations(res.data);
        } catch (err) {
            console.error('فشل تحميل الجهات الكافلة:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>الجهات الكافلة (المؤسسات)</h2>
                <button className="button" onClick={() => navigate('/sponsor-organizations/create')}>
                    + إضافة جهة كافلة
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>جاري التحميل...</div>
                ) : organizations.length === 0 ? (
                    <p>لا توجد بيانات</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>اسم الجهة</th>
                                <th>نوع الكفالة</th>
                                <th>المسؤول</th>
                                <th>الهاتف</th>
                                <th>البريد</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map((org) => (
                                <tr key={org.id}>
                                    <td><strong>{org.name}</strong></td>
                                    <td><span className="tag green">{org.sponsorship_type}</span></td>
                                    <td>{org.responsible_person || '-'}</td>
                                    <td>{org.phone || '-'}</td>
                                    <td>{org.email || '-'}</td>
                                    <td>
                                        <button
                                            className="button secondary"
                                            style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                                            onClick={() => navigate(`/sponsor-organizations/${org.id}`)}
                                        >
                                            عرض التفاصيل
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
