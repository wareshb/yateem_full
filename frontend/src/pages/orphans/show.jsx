import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDateForDisplay } from '../../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function OrphansShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [orphan, setOrphan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrphanDetails();
    }, [id]);

    const fetchOrphanDetails = async () => {
        try {
            const res = await axios.get(`${API_URL}/orphans/${id}`);
            setOrphan(res.data);
        } catch (err) {
            alert('خطأ في تحميل التفاصيل');
            navigate('/orphans');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>جاري التحميل...</div>;
    if (!orphan) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>تفاصيل اليتيم: {orphan.full_name}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button" onClick={() => navigate(`/orphans/${id}/edit`)}>
                        تعديل
                    </button>
                    <button className="button secondary" onClick={() => navigate('/orphans')}>
                        عودة
                    </button>
                </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                <div className="details-grid">
                    <DetailSection title="البيانات الشخصية">
                        <DetailItem label="المعرف" value={orphan.orphan_id} />
                        <DetailItem label="الاسم" value={orphan.full_name} />
                        <DetailItem label="تاريخ الميلاد" value={formatDateForDisplay(orphan.date_of_birth)} />
                        <DetailItem label="العمر" value={orphan.age || calculateAge(orphan.date_of_birth)} />
                        <DetailItem label="الجنس" value={orphan.gender === 'male' ? 'ذكر' : 'أنثى'} />
                        <DetailItem label="الجنسية" value={orphan.nationality} />
                    </DetailSection>

                    <DetailSection title="بيانات الأب">
                        <DetailItem label="الاسم" value={orphan.father_name} />
                        <DetailItem label="تاريخ الوفاة" value={formatDateForDisplay(orphan.date_of_death)} />
                        <DetailItem label="سبب الوفاة" value={orphan.cause_of_death} />
                    </DetailSection>

                    <DetailSection title="بيانات الأم">
                        <DetailItem label="الاسم" value={orphan.mother_name} />
                        <DetailItem label="الهاتف" value={orphan.mother_phone_1} />
                        <DetailItem label="حاضنة؟" value={orphan.mother_is_custodian_flag ? 'نعم' : 'لا'} />
                    </DetailSection>

                    {orphan.guardian_name && (
                        <DetailSection title="بيانات المعيل">
                            <DetailItem label="الاسم" value={orphan.guardian_name} />
                            <DetailItem label="صلة القرابة" value={orphan.relationship_to_orphan} />
                            <DetailItem label="الهاتف" value={orphan.guardian_phone} />
                        </DetailSection>
                    )}

                    <DetailSection title="بيانات السكن">
                        <DetailItem label="المحافظة" value={orphan.residence_province} />
                        <DetailItem label="المديرية" value={orphan.residence_district} />
                        <DetailItem label="الحي" value={orphan.neighborhood_or_street} />
                        <DetailItem label="حالة السكن" value={orphan.residence_condition} />
                    </DetailSection>

                    <DetailSection title="الحالة الصحية">
                        <DetailItem label="الحالة الصحية" value={orphan.health_condition} />
                        {orphan.illness_type && <DetailItem label="النوع" value={orphan.illness_type} />}
                        {orphan.illness_notes && <DetailItem label="ملاحظات" value={orphan.illness_notes} />}
                    </DetailSection>

                    <DetailSection title="الحالة التعليمية">
                        <DetailItem label="يدرس؟" value={orphan.is_studying ? 'نعم' : 'لا'} />
                        {orphan.is_studying && (
                            <>
                                <DetailItem label="الصف" value={orphan.grade_level} />
                                <DetailItem label="المدرسة" value={orphan.school_name} />
                                <DetailItem label="التقدير" value={orphan.academic_rating} />
                            </>
                        )}
                    </DetailSection>

                    <DetailSection title="حفظ القرآن">
                        <DetailItem label="يحفظ؟" value={orphan.memorizes_quran ? 'نعم' : 'لا'} />
                        {orphan.memorizes_quran && (
                            <>
                                <DetailItem label="المركز" value={orphan.quran_center_name} />
                                <DetailItem label="الأجزاء" value={orphan.quran_parts_memorized} />
                            </>
                        )}
                    </DetailSection>

                    {orphan.siblings?.length > 0 && (
                        <DetailSection title={`الإخوة والأخوات (${orphan.siblings.length})`} fullWidth>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>المعرف</th>
                                        <th>الاسم</th>
                                        <th>العمر</th>
                                        <th>الصف</th>
                                        <th>المدرسة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orphan.siblings.map((sib, i) => (
                                        <tr
                                            key={i}
                                            onClick={() => sib.id && navigate(`/orphans/${sib.id}`)}
                                            style={{ cursor: sib.id ? 'pointer' : 'default', transition: 'background-color 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td>{sib.orphan_id || '-'}</td>
                                            <td>{sib.full_name}</td>
                                            <td>{calculateAge(sib.date_of_birth)} سنة</td>
                                            <td>{sib.grade_level || '-'}</td>
                                            <td>{sib.school_name || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </DetailSection>
                    )}

                    {orphan.sponsorships?.length > 0 && (
                        <DetailSection title="الكفالات" fullWidth>
                            {orphan.sponsorships.map((sp, i) => (
                                <div key={i} style={{ padding: 12, background: 'var(--bg)', borderRadius: 6, marginBottom: 8 }}>
                                    <strong>{sp.sponsor_name}</strong> - {sp.sponsorship_type} - {formatDateForDisplay(sp.start_date)}
                                </div>
                            ))}
                        </DetailSection>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailSection({ title, children, fullWidth }) {
    return (
        <div style={{ gridColumn: fullWidth ? '1/-1' : 'auto', padding: 16, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <h5 style={{ margin: '0 0 12px 0', color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>{title}</h5>
            <div style={{ display: 'grid', gap: 8 }}>
                {children}
            </div>
        </div>
    );
}

function DetailItem({ label, value }) {
    return value ? (
        <div style={{ display: 'flex', gap: 8 }}>
            <strong style={{ minWidth: 100 }}>{label}:</strong>
            <span>{value}</span>
        </div>
    ) : null;
}

function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return '-';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
