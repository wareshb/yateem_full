import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { DateInput } from '../../components/FormComponents';
import { formatDateForServer } from '../../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function SponsorOrganizationsShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [org, setOrg] = useState(null);
    const [sponsoredOrphans, setSponsoredOrphans] = useState([]);

    // States for linking orphans logic
    const [orphans, setOrphans] = useState([]);
    const [selectedOrphanIds, setSelectedOrphanIds] = useState([]);
    const [showLinkForm, setShowLinkForm] = useState(false);
    const [startDate, setStartDate] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [orgRes, sponsoredRes, orphansRes] = await Promise.all([
                axios.get(`${API_URL}/sponsor-organizations/${id}`),
                axios.get(`${API_URL}/sponsor-organizations/${id}/orphans`),
                axios.get(`${API_URL}/orphans`)
            ]);
            setOrg(orgRes.data);
            setSponsoredOrphans(sponsoredRes.data);
            setOrphans(orphansRes.data);
        } catch (err) {
            console.error(err);
            navigate('/sponsor-organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleLinkOrphans = async () => {
        if (selectedOrphanIds.length === 0) {
            alert('يرجى اختيار أيتام للكفالة');
            return;
        }
        try {
            await axios.post(`${API_URL}/sponsor-organizations/${id}/orphans`, {
                orphan_ids: selectedOrphanIds,
                start_date: formatDateForServer(startDate) || new Date().toISOString().split('T')[0]
            });
            alert(`تم ربط ${selectedOrphanIds.length} يتيم/أيتام بالجهة`);
            setSelectedOrphanIds([]);
            setShowLinkForm(false);
            // Refresh sponsored list
            const res = await axios.get(`${API_URL}/sponsor-organizations/${id}/orphans`);
            setSponsoredOrphans(res.data);
        } catch (err) {
            alert('حدث خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    const toggleOrphanSelection = (orphanId) => {
        setSelectedOrphanIds(prev =>
            prev.includes(orphanId) ? prev.filter(id => id !== orphanId) : [...prev, orphanId]
        );
    };

    if (loading) return <div>جاري التحميل...</div>;
    if (!org) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>الجهة الكافلة: {org.name}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button" onClick={() => navigate(`/sponsor-organizations/${id}/edit`)}>تعديل</button>
                    <button className="button secondary" onClick={() => navigate('/sponsor-organizations')}>عودة</button>
                </div>
            </div>

            <div className="card">
                <div className="details-grid">
                    <DetailItem label="المسؤول" value={org.responsible_person} />
                    <DetailItem label="نوع الكفالة" value={org.sponsorship_type} />
                    <DetailItem label="الهاتف" value={org.phone} />
                    <DetailItem label="البريد" value={org.email} />
                    <DetailItem label="تاريخ البدء" value={org.start_date} />
                    <DetailItem label="ملاحظات" value={org.notes} fullWidth />
                </div>
            </div>

            <div className="card">
                <div className="section-title" style={{ marginBottom: 16 }}>
                    <h3>الأيتام المكفولين من هذه الجهة</h3>
                    <button className="button" onClick={() => setShowLinkForm(true)}>+ إضافة أيتام للكفالة</button>
                </div>

                {/* Link New Orphans Form */}
                {showLinkForm && (
                    <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #ddd' }}>
                        <h4>اختر أيتام للكفالة</h4>
                        <div style={{ margin: '10px 0' }}>
                            <DateInput label="تاريخ بدء الكفالة" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div style={{ maxHeight: 200, overflowY: 'auto', margin: '10px 0', border: '1px solid #eee', background: 'white' }}>
                            {orphans.map(o => (
                                <label key={o.id} style={{ display: 'block', padding: 4 }}>
                                    <input type="checkbox" checked={selectedOrphanIds.includes(o.id)} onChange={() => toggleOrphanSelection(o.id)} />
                                    {' '}{o.full_name}
                                </label>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="button" onClick={handleLinkOrphans}>حفظ</button>
                            <button className="button secondary" onClick={() => setShowLinkForm(false)}>إلغاء</button>
                        </div>
                    </div>
                )}

                {/* Sponsored Orphans List */}
                {sponsoredOrphans.length === 0 ? (
                    <p>لا يوجد أيتام مكفولين</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>العمر</th>
                                <th>المحافظة</th>
                                <th>تاريخ بدء الكفالة</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sponsoredOrphans.map(o => (
                                <tr key={o.id}>
                                    <td>{o.full_name}</td>
                                    <td>{o.age}</td>
                                    <td>{o.province}</td>
                                    <td>{o.start_date}</td>
                                    <td><span className="tag green">{o.sponsorship_status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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
