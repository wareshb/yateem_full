import { useState, useEffect } from 'react';
import axios from 'axios';
import DateInput from '../components/DateInput';
import { formatDateForDisplay, formatDateForServer } from '../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function MarketingOrganizations() {
    const [organizations, setOrganizations] = useState([]);
    const [orphans, setOrphans] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [marketedOrphans, setMarketedOrphans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showMarketForm, setShowMarketForm] = useState(false);
    const [showConvertForm, setShowConvertForm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        responsible_person: '',
        marketing_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const [selectedOrphanIds, setSelectedOrphanIds] = useState([]);
    const [convertData, setConvertData] = useState({
        sponsorship_type: 'نقدية',
        start_date: formatDateForDisplay(new Date().toISOString().split('T')[0]),
        sponsored_orphan_ids: []
    });

    useEffect(() => {
        fetchOrganizations();
        fetchOrphans();
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

    const fetchOrphans = async () => {
        try {
            const res = await axios.get(`${API_URL}/orphans`);
            setOrphans(res.data);
        } catch (err) {
            console.error('فشل تحميل الأيتام:', err);
        }
    };

    const fetchMarketedOrphans = async (orgId) => {
        try {
            const res = await axios.get(`${API_URL}/marketing-organizations/${orgId}/orphans`);
            setMarketedOrphans(res.data);
            setSelectedOrg(orgId);
        } catch (err) {
            console.error('فشل تحميل الأيتام المسوقين:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                marketing_date: formatDateForServer(formData.marketing_date)
            };
            await axios.post(`${API_URL}/marketing-organizations`, dataToSend);
            alert('تم إضافة جهة التسويق بنجاح');
            setFormData({
                name: '',
                email: '',
                phone: '',
                responsible_person: '',
                marketing_date: formatDateForDisplay(new Date().toISOString().split('T')[0]),
                notes: ''
            });
            setShowAddForm(false);
            fetchOrganizations();
        } catch (err) {
            alert('حدث خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleMarketOrphans = async () => {
        if (selectedOrphanIds.length === 0) {
            alert('يرجى اختيار أيتام للتسويق');
            return;
        }

        try {
            await axios.post(`${API_URL}/marketing-organizations/${selectedOrg}/orphans`, {
                orphan_ids: selectedOrphanIds,
                marketing_date: new Date().toISOString().split('T')[0]
            });
            alert(`تم تسويق ${selectedOrphanIds.length} يتيم/أيتام للجهة`);
            setSelectedOrphanIds([]);
            setShowMarketForm(false);
            fetchMarketedOrphans(selectedOrg);
        } catch (err) {
            alert('حدث خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleConvertToSponsor = async () => {
        if (convertData.sponsored_orphan_ids.length === 0) {
            alert('يرجى اختيار الأيتام الذين ستقوم الجهة بكفالتهم');
            return;
        }

        if (!confirm('هل أنت متأكد من تحويل هذه الجهة إلى جهة كافلة؟')) {
            return;
        }

        try {
            const dataToSend = {
                ...convertData,
                start_date: formatDateForServer(convertData.start_date)
            };
            await axios.post(`${API_URL}/marketing-organizations/${selectedOrg}/convert-to-sponsor`, dataToSend);
            alert('تم التحويل إلى جهة كافلة بنجاح');
            setShowConvertForm(false);
            fetchOrganizations();
            fetchMarketedOrphans(selectedOrg);
        } catch (err) {
            alert('حدث خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    const toggleOrphanSelection = (orphanId, forConversion = false) => {
        if (forConversion) {
            setConvertData(prev => ({
                ...prev,
                sponsored_orphan_ids: prev.sponsored_orphan_ids.includes(orphanId)
                    ? prev.sponsored_orphan_ids.filter(id => id !== orphanId)
                    : [...prev.sponsored_orphan_ids, orphanId]
            }));
        } else {
            setSelectedOrphanIds(prev =>
                prev.includes(orphanId)
                    ? prev.filter(id => id !== orphanId)
                    : [...prev, orphanId]
            );
        }
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>جهات التسويق</h2>
                <button className="button" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'إلغاء' : '+ إضافة جهة تسويق'}
                </button>
            </div>

            {showAddForm && (
                <div className="card">
                    <h3>إضافة جهة تسويق جديدة</h3>
                    <form className="form-grid" onSubmit={handleSubmit}>
                        <Input label="اسم الجهة" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        <Input label="البريد الإلكتروني" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <Input label="رقم الهاتف" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        <Input label="المسؤول عن قطاع الأيتام" value={formData.responsible_person} onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })} />
                        <DateInput label="تاريخ التسويق" value={formData.marketing_date} onChange={(e) => setFormData({ ...formData, marketing_date: e.target.value })} />
                        <div className="input" style={{ gridColumn: '1/-1' }}>
                            <label>ملاحظات</label>
                            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
                        </div>
                        <div style={{ gridColumn: '1/-1' }}>
                            <button type="submit" className="button">حفظ</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                {loading ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>جاري التحميل...</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>اسم الجهة</th>
                                <th>المسؤول</th>
                                <th>الهاتف</th>
                                <th>البريد</th>
                                <th>تم التحويل</th>
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
                                            onClick={() => {
                                                fetchMarketedOrphans(org.id);
                                                setShowMarketForm(false);
                                                setShowConvertForm(false);
                                            }}
                                        >
                                            عرض الأيتام
                                        </button>
                                        {!org.converted_to_sponsor && (
                                            <>
                                                <button
                                                    className="button"
                                                    style={{ padding: '4px 12px', fontSize: '0.85rem', marginLeft: 8 }}
                                                    onClick={() => {
                                                        setSelectedOrg(org.id);
                                                        setShowMarketForm(true);
                                                        setShowConvertForm(false);
                                                    }}
                                                >
                                                    + تسويق أيتام
                                                </button>
                                                <button
                                                    className="button"
                                                    style={{ padding: '4px 12px', fontSize: '0.85rem', marginLeft: 8, background: 'var(--accent)' }}
                                                    onClick={() => {
                                                        setSelectedOrg(org.id);
                                                        fetchMarketedOrphans(org.id);
                                                        setShowConvertForm(true);
                                                        setShowMarketForm(false);
                                                    }}
                                                >
                                                    تحويل لجهة كافلة
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showMarketForm && selectedOrg && (
                <div className="card">
                    <h3>اختيار الأيتام للتسويق</h3>
                    <p className="small">تم اختيار {selectedOrphanIds.length} يتيم</p>
                    <div style={{ maxHeight: 400, overflowY: 'auto', marginTop: 12 }}>
                        {orphans.map((orphan) => (
                            <label key={orphan.id} style={{ display: 'block', padding: '8px 0', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedOrphanIds.includes(orphan.id)}
                                    onChange={() => toggleOrphanSelection(orphan.id, false)}
                                    style={{ marginLeft: 8 }}
                                />
                                {orphan.full_name} - {orphan.age} سنة - {orphan.province || orphan.city || 'غير محدد'}
                            </label>
                        ))}
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                        <button className="button" onClick={handleMarketOrphans}>
                            تسويق الأيتام المحددين
                        </button>
                        <button className="button secondary" onClick={() => { setShowMarketForm(false); setSelectedOrphanIds([]); }}>
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {showConvertForm && selectedOrg && (
                <div className="card" style={{ background: 'rgba(var(--accent-rgb), 0.1)' }}>
                    <h3>تحويل إلى جهة كافلة</h3>
                    <p>اختر الأيتام الذين ستقوم الجهة بكفالتهم من الأيتام المسوقين</p>
                    <div className="form-grid" style={{ marginTop: 12 }}>
                        <Input
                            label="نوع الكفالة"
                            value={convertData.sponsorship_type}
                            onChange={(e) => setConvertData({ ...convertData, sponsorship_type: e.target.value })}
                            as="select"
                        >
                            <option value="نقدية">نقدية</option>
                            <option value="دراسية">دراسية</option>
                            <option value="صحية">صحية</option>
                        </Input>
                        <DateInput
                            label="تاريخ بدء الكفالة"
                            value={convertData.start_date}
                            onChange={(e) => setConvertData({ ...convertData, start_date: e.target.value })}
                        />
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <p className="small"><strong>الأيتام المسوقين (تم اختيار {convertData.sponsored_orphan_ids.length}):</strong></p>
                        <div style={{ maxHeight: 300, overflowY: 'auto', marginTop: 8 }}>
                            {marketedOrphans.map((orphan) => (
                                <label key={orphan.id} style={{ display: 'block', padding: '8px 0', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={convertData.sponsored_orphan_ids.includes(orphan.id)}
                                        onChange={() => toggleOrphanSelection(orphan.id, true)}
                                        style={{ marginLeft: 8 }}
                                    />
                                    {orphan.full_name} - {orphan.age} سنة
                                </label>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                        <button className="button" onClick={handleConvertToSponsor}>
                            تحويل وبدء الكفالة
                        </button>
                        <button className="button secondary" onClick={() => setShowConvertForm(false)}>
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {selectedOrg && !showMarketForm && !showConvertForm && (
                <div className="card">
                    <h3>الأيتام المسوقين</h3>
                    {marketedOrphans.length === 0 ? (
                        <p>لم يتم تسويق أيتام لهذه الجهة بعد</p>
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
                                {marketedOrphans.map((o) => (
                                    <tr key={o.id}>
                                        <td>{o.full_name}</td>
                                        <td>{o.age} سنة</td>
                                        <td>{o.province || '-'}</td>
                                        <td>{o.marketing_date}</td>
                                        <td><span className="tag yellow">{o.marketing_status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

function Input({ label, as = 'input', children, ...props }) {
    if (as === 'select') {
        return (
            <div className="input">
                <label>{label}</label>
                <select {...props}>{children}</select>
            </div>
        );
    }
    return (
        <div className="input">
            <label>{label}</label>
            <input {...props} />
        </div>
    );
}
