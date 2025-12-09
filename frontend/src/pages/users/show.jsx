import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function UsersShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            const res = await axios.get(`${API_URL}/users/${id}`);
            setUser(res.data);
        } catch (err) {
            alert('خطأ في تحميل البيانات');
            navigate('/users');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>جاري التحميل...</div>;
    if (!user) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>تفاصيل المستخدم: {user.username}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button" onClick={() => navigate(`/users/${id}/edit`)}>
                        تعديل
                    </button>
                    <button className="button secondary" onClick={() => navigate('/users')}>
                        عودة
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="details-grid">
                    <DetailItem label="الاسم الكامل" value={user.full_name} />
                    <DetailItem label="اسم المستخدم" value={user.username} />
                    <DetailItem label="البريد الإلكتروني" value={user.email} />
                    <DetailItem label="الدور" value={user.role === 'admin' ? 'مدير النظام' : 'مشرف'} />
                    <DetailItem label="الحالة" value={user.status === 'active' ? 'نشط' : 'غير نشط'} />
                    <DetailItem label="تاريخ الإنشاء" value={new Date(user.created_at).toLocaleDateString()} />
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
