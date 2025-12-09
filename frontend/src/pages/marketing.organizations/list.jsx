import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function MarketingOrganizationsList() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const res = await axios.get(`${API_URL}/marketing-organizations`);
            setOrganizations(res.data);
        } catch (err) {
            console.error('فشل تحميل جهات التسويق:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>جهات التسويق</h2>
                <button className="button" onClick={() => navigate('/marketing-organizations/create')}>
                    + إضافة جهة تسويق
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
                                <th>المسؤول</th>
                                <th>الهاتف</th>
                                <th>البريد</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map((org) => (
                                <tr key={org.id}>
                                    <td><strong>{org.name}</strong></td>
                                    <td>{org.responsible_person || '-'}</td>
                                    <td>{org.phone || '-'}</td>
                                    <td>{org.email || '-'}</td>
                                    <td>
                                        {org.converted_to_sponsor ? (
                                            <span className="tag green">✓ تم التحويل</span>
                                        ) : (
                                            <span className="tag yellow">قيد التسويق</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="button secondary"
                                            style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                                            onClick={() => navigate(`/marketing-organizations/${org.id}`)}
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
