import { useState, useEffect } from 'react';
import axios from 'axios';
import DateInput from '../components/DateInput';
import { formatDateForDisplay, formatDateForServer } from '../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function SponsorOrganizations() {
    const [organizations, setOrganizations] = useState([]);
    const [orphans, setOrphans] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [sponsoredOrphans, setSponsoredOrphans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showLinkForm, setShowLinkForm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        sponsorship_type: 'نقدية',
        responsible_person: '',
        start_date: formatDateForDisplay(new Date().toISOString().split('T')[0]),
        notes: ''
    });

    const [selectedOrphanIds, setSelectedOrphanIds] = useState([]);

    useEffect(() => {
        fetchOrganizations();
        fetchOrphans();
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

    const fetchOrphans = async () => {
        try {
            const res = await axios.get(`${API_URL}/orphans`);
            setOrphans(res.data);
        } catch (err) {
            console.error('فشل تحميل الأيتام:', err);
        }
    };

    const fetchSponsoredOrphans = async (orgId) => {
        try {
            const res = await axios.get(`${API_URL}/sponsor-organizations/${orgId}/orphans`);
            setSponsoredOrphans(res.data);
            setSelectedOrg(orgId);
        } catch (err) {
            console.error('فشل تحميل الأيتام المكفولين:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                start_date: formatDateForServer(formData.start_date)
            };
            await axios.post(`${API_URL}/sponsor-organizations`, dataToSend);
            alert('تم إضافة الجهة الكافلة بنجاح');
            setFormData({
                name: '',
                email: '',
                phone: '',
                sponsorship_type: 'نقدية',
                responsible_person: '',
                start_date: formatDateForDisplay(new Date().toISOString().split('T')[0]),
                notes: ''
            });
            setShowAddForm(false);
            fetchOrganizations();
        } catch (err) {
            alert('حدث خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleLinkOrphans = async () => {
        if (selectedOrphanIds.length === 0) {
            alert('يرجى اختيار أيتام للكفالة');
            return;
        }

        try {
            await axios.post(`${API_URL}/sponsor-organizations/${selectedOrg}/orphans`, {
                orphan_ids: selectedOrphanIds,
                start_date: new Date().toISOString().split('T')[0]
            });
            alert(`تم ربط ${selectedOrphanIds.length} يتيم/أيتام بالجهة`);
            setSelectedOrphanIds([]);
            setShowLinkForm(false);
            fetchSponsoredOrphans(selectedOrg);
        } catch (err) {
            alert('حدث خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    const toggleOrphanSelection = (orphanId) => {
        setSelectedOrphanIds(prev =>
            prev.includes(orphanId)
                ? prev.filter(id => id !== orphanId)
                : [...prev, orphanId]
        );
    };

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>الجهات الكافلة</h2>
                <button className="button" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'إلغاء' : '+ إضافة جهة كافلة'}
                </button>
            </div>

            {showAddForm && (
                <div className="card">
                    <h3>إضافة جهة كافلة جديدة</h3>
                    <form className="form-grid" onSubmit={handleSubmit}>
                        <Input label="اسم الجهة" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        <Input label="البريد الإلكتروني" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <Input label="رقم الهاتف" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        <Input label="نوع الكفالة" value={formData.sponsorship_type} onChange={(e) => setFormData({ ...formData, sponsorship_type: e.target.value })} as="select">
                            <option value="نقدية">نقدية</option>
                            <option value="دراسية">دراسية</option>
                            <option value="صحية">صحية</option>
                            <option value="نقدية,دراسية">نقدية ودراسية</option>
                            <option value="نقدية,صحية">نقدية وصحية</option>
                        </Input>
                        <Input label="المسؤول عن قطاع الأيتام" value={formData.responsible_person} onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })} />
                        <DateInput label="تاريخ بدء الكفالة" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
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
                                            onClick={() => {
                                                fetchSponsoredOrphans(org.id);
                                                setShowLinkForm(false);
                                            }}
                                        >
                                            عرض الأيتام
                                        </button>
                                        <button
                                            className="button"
                                            style={{ padding: '4px 12px', fontSize: '0.85rem', marginLeft: 8 }}
                                            onClick={() => {
                                                setSelectedOrg(org.id);
                                                setShowLinkForm(true);
                                            }}
                                        >
                                            + إضافة أيتام
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showLinkForm && selectedOrg && (
                <div className="card">
                    <h3>اختيار الأيتام للكفالة</h3>
                    <p className="small">تم اختيار {selectedOrphanIds.length} يتيم</p>
                    <div style={{ maxHeight: 400, overflowY: 'auto', marginTop: 12 }}>
                        {orphans.map((orphan) => (
                            <label key={orphan.id} style={{ display: 'block', padding: '8px 0', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedOrphanIds.includes(orphan.id)}
                                    onChange={() => toggleOrphanSelection(orphan.id)}
                                    style={{ marginLeft: 8 }}
                                />
                                {orphan.full_name} - {orphan.age} سنة - {orphan.province || orphan.city || 'غير محدد'}
                            </label>
                        ))}
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                        <button className="button" onClick={handleLinkOrphans}>
                            ربط الأيتام المحددين
                        </button>
                        <button className="button secondary" onClick={() => { setShowLinkForm(false); setSelectedOrphanIds([]); }}>
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {selectedOrg && !showLinkForm && (
                <div className="card">
                    <h3>الأيتام المكفولين</h3>
                    {sponsoredOrphans.length === 0 ? (
                        <p>لا توجد كفالات لهذه الجهة بعد</p>
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
                                {sponsoredOrphans.map((o) => (
                                    <tr key={o.id}>
                                        <td>{o.full_name}</td>
                                        <td>{o.age} سنة</td>
                                        <td>{o.province || '-'}</td>
                                        <td>{o.start_date}</td>
                                        <td><span className="tag green">{o.sponsorship_status}</span></td>
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
