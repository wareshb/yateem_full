import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { DateInput } from '../../components/FormComponents';
import { formatDateForServer, formatDateForDisplay } from '../../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function MarketingOrganizationsShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [org, setOrg] = useState(null);
    const [marketedOrphans, setMarketedOrphans] = useState([]);

    // States for linking orphans logic
    const [orphans, setOrphans] = useState([]);
    const [selectedOrphanIds, setSelectedOrphanIds] = useState([]);
    const [showMarketForm, setShowMarketForm] = useState(false);
    const [showConvertForm, setShowConvertForm] = useState(false);

    const [convertData, setConvertData] = useState({
        sponsorship_type: 'نقدية',
        start_date: formatDateForDisplay(new Date().toISOString().split('T')[0]),
        sponsored_orphan_ids: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [orgRes, marketedRes, orphansRes] = await Promise.all([
                axios.get(`${API_URL}/marketing-organizations/${id}`),
                axios.get(`${API_URL}/marketing-organizations/${id}/orphans`),
                axios.get(`${API_URL}/orphans`)
            ]);
            setOrg(orgRes.data);
            setMarketedOrphans(marketedRes.data);
            setOrphans(orphansRes.data);
        } catch (err) {
            console.error(err);
            navigate('/marketing-organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleMarketOrphans = async () => {
        if (selectedOrphanIds.length === 0) {
            alert('يرجى اختيار أيتام للتسويق');
            return;
        }
        try {
            await axios.post(`${API_URL}/marketing-organizations/${id}/orphans`, {
                orphan_ids: selectedOrphanIds,
                marketing_date: new Date().toISOString().split('T')[0]
            });
            alert(`تم تسويق ${selectedOrphanIds.length} يتيم/أيتام للجهة`);
            setSelectedOrphanIds([]);
            setShowMarketForm(false);
            // Refresh marketed list
            const res = await axios.get(`${API_URL}/marketing-organizations/${id}/orphans`);
            setMarketedOrphans(res.data);
        } catch (err) {
            alert('حدث خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleConvertToSponsor = async () => {
        if (convertData.sponsored_orphan_ids.length === 0) {
            alert('يرجى اختيار الأيتام للكفالة');
            return;
        }
        if (!confirm('هل أنت متأكد من تحويل هذه الجهة (والأيتام المختارين) إلى كافل؟')) return;

        try {
            const dataToSend = {
                ...convertData,
                start_date: formatDateForServer(convertData.start_date)
            };
            await axios.post(`${API_URL}/marketing-organizations/${id}/convert-to-sponsor`, dataToSend);
            alert('تم التحويل إلى جهة كافلة بنجاح');
            setShowConvertForm(false);
            fetchData(); // Refresh all
        } catch (err) {
            alert('حدث خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    const toggleOrphanSelection = (orphanId, isConversion = false) => {
        if (isConversion) {
            setConvertData(prev => ({
                ...prev,
                sponsored_orphan_ids: prev.sponsored_orphan_ids.includes(orphanId)
                    ? prev.sponsored_orphan_ids.filter(id => id !== orphanId)
                    : [...prev.sponsored_orphan_ids, orphanId]
            }));
        } else {
            setSelectedOrphanIds(prev =>
                prev.includes(orphanId) ? prev.filter(id => id !== orphanId) : [...prev, orphanId]
            );
        }
    };

    if (loading) return <div>جاري التحميل...</div>;
    if (!org) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>جهة التسويق: {org.name}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button" onClick={() => navigate(`/marketing-organizations/${id}/edit`)}>تعديل</button>
                    <button className="button secondary" onClick={() => navigate('/marketing-organizations')}>عودة</button>
                </div>
            </div>

            <div className="card">
                <div className="details-grid">
                    <DetailItem label="المسؤول" value={org.responsible_person} />
                    <DetailItem label="الهاتف" value={org.phone} />
                    <DetailItem label="البريد" value={org.email} />
                    <DetailItem label="تاريخ التسويق" value={org.marketing_date} />
                    <DetailItem label="الحالة" value={org.converted_to_sponsor ? 'تم التحويل لكافل' : 'قيد التسويق'} />
                    <DetailItem label="ملاحظات" value={org.notes} fullWidth />
                </div>
            </div>

            <div className="card">
                <div className="section-title" style={{ marginBottom: 16 }}>
                    <h3>الأيتام المسوقين لهذه الجهة</h3>
                    {!org.converted_to_sponsor && (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="button" onClick={() => setShowMarketForm(true)}>+ تسويق أيتام جدد</button>
                            <button className="button" style={{ background: 'var(--accent)' }} onClick={() => {
                                setShowConvertForm(true);
                                // Pre-select all marketed orphans for convenience? No, let user choose.
                                setConvertData(prev => ({ ...prev, sponsored_orphan_ids: [] }));
                            }}>
                                تحويل لجهة كافلة
                            </button>
                        </div>
                    )}
                </div>

                {/* Market New Orphans Form */}
                {showMarketForm && (
                    <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #ddd' }}>
                        <h4>اختر أيتام للتسويق</h4>
                        <div style={{ maxHeight: 200, overflowY: 'auto', margin: '10px 0', border: '1px solid #eee' }}>
                            {orphans.map(o => (
                                <label key={o.id} style={{ display: 'block', padding: 4 }}>
                                    <input type="checkbox" checked={selectedOrphanIds.includes(o.id)} onChange={() => toggleOrphanSelection(o.id)} />
                                    {' '}{o.full_name}
                                </label>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="button" onClick={handleMarketOrphans}>حفظ</button>
                            <button className="button secondary" onClick={() => setShowMarketForm(false)}>إلغاء</button>
                        </div>
                    </div>
                )}

                {/* Convert Form */}
                {showConvertForm && (
                    <div style={{ background: 'rgba(var(--accent-rgb), 0.1)', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid var(--accent)' }}>
                        <h4>تحويل إلى كفالة فعلية</h4>
                        <p className="small">اختر الأيتام الذين قبلت الجهة كفالتهم من القائمة أدناه:</p>
                        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr', marginBottom: 10 }}>
                            <div>
                                <label>نوع الكفالة</label>
                                <select
                                    value={convertData.sponsorship_type}
                                    onChange={e => setConvertData({ ...convertData, sponsorship_type: e.target.value })}
                                    style={{ width: '100%', padding: 8 }}
                                >
                                    <option value="نقدية">نقدية</option>
                                    <option value="دراسية">دراسية</option>
                                    <option value="صحية">صحية</option>
                                </select>
                            </div>
                            <DateInput label="تاريخ البدء" value={convertData.start_date} onChange={e => setConvertData({ ...convertData, start_date: e.target.value })} />
                        </div>

                        <div style={{ maxHeight: 200, overflowY: 'auto', margin: '10px 0', background: 'white', padding: 8 }}>
                            {marketedOrphans.map(o => (
                                <label key={o.id} style={{ display: 'block', padding: 4 }}>
                                    <input
                                        type="checkbox"
                                        checked={convertData.sponsored_orphan_ids.includes(o.id)}
                                        onChange={() => toggleOrphanSelection(o.id, true)}
                                    />
                                    {' '}{o.full_name} ({o.marketing_status})
                                </label>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="button" onClick={handleConvertToSponsor}>إتمام التحويل</button>
                            <button className="button secondary" onClick={() => setShowConvertForm(false)}>إلغاء</button>
                        </div>
                    </div>
                )}

                {/* Marketed Orphans List */}
                {marketedOrphans.length === 0 ? (
                    <p>لا يوجد أيتام مسوقين</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>العمر</th>
                                <th>المحافظة</th>
                                <th>تاريخ التسويق</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {marketedOrphans.map(o => (
                                <tr key={o.id}>
                                    <td>{o.full_name}</td>
                                    <td>{o.age}</td>
                                    <td>{o.province}</td>
                                    <td>{o.marketing_date}</td>
                                    <td><span className="tag yellow">{o.marketing_status}</span></td>
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
