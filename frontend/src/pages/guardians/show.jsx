import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function GuardiansShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [guardian, setGuardian] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGuardian();
    }, [id]);

    const fetchGuardian = async () => {
        try {
            const searchParams = new URLSearchParams(location.search);
            const type = searchParams.get('type') || 'guardian';
            const res = await axios.get(`${API_URL}/guardians/${id}?type=${type}`);
            setGuardian(res.data);
        } catch (err) {
            alert('خطأ في تحميل البيانات');
            navigate('/guardians');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>جاري التحميل...</div>;
    if (!guardian) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>تفاصيل المعيل: {guardian.full_name}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button secondary" onClick={() => navigate('/guardians')}>
                        عودة
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="details-grid">
                    <DetailItem label="النوع" value={guardian.relationship_to_child === 'Mother' ? 'أم' : 'معيل خارجي'} />
                    <DetailItem label="الاسم" value={guardian.full_name} />
                    <DetailItem label="تاريخ الميلاد" value={guardian.date_of_birth} />
                    <DetailItem label="رقم الهوية" value={guardian.id_number || guardian.national_id} />
                    <DetailItem label="صلة القرابة" value={guardian.relationship_to_child} />
                    <DetailItem label="رقم الهاتف" value={guardian.contact_phone || guardian.phone} />
                    <DetailItem label="العنوان" value={guardian.address} />
                    <DetailItem label="المهنة" value={guardian.current_occupation || guardian.occupation} />
                    <DetailItem label="الدخل الشهري" value={guardian.monthly_income} />
                    <DetailItem label="الحالة الصحية" value={guardian.health_status || guardian.health_condition} />
                    <DetailItem label="ملاحظات" value={guardian.notes} />
                </div>
            </div>

            {guardian.orphans?.length > 0 && (
                <div className="card">
                    <h3>الأيتام المكفولين ({guardian.orphans.length})</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>العمر</th>
                                <th>المدرسة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guardian.orphans.map((orphan, i) => (
                                <tr key={i} onClick={() => navigate(`/orphans/${orphan.orphan_id}`)} style={{ cursor: 'pointer' }}>
                                    <td>{orphan.full_name}</td>
                                    <td>{new Date().getFullYear() - new Date(orphan.date_of_birth).getFullYear()}</td>
                                    <td>{orphan.school_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
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
