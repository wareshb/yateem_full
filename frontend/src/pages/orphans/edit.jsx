// ملف edit.jsx سيكون مشابه لـ create.jsx ولكن مع تحميل البيانات الموجودة
// يمكن استخدام نفس كود create.jsx مع تعديل بسيط لتحميل البيانات

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Section, Input, Select, Checkbox, Textarea, DateInput } from '../../components/FormComponents';
import { formatDateForServer, formatDateForDisplay } from '../../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function OrphansEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrphanData();
    }, [id]);

    const fetchOrphanData = async () => {
        try {
            const res = await axios.get(`${API_URL}/orphans/${id}`);
            const data = res.data;

            // Map flat API response to nested structure for form
            setFormData({
                ...data,
                date_of_birth: formatDateForDisplay(data.date_of_birth),

                // Construct Father Data
                father_data: {
                    full_name: data.father_name,
                    date_of_birth: formatDateForDisplay(data.father_dob),
                    date_of_death: formatDateForDisplay(data.date_of_death),
                    cause_of_death: data.cause_of_death,
                    death_certificate_type: data.death_certificate_type,
                    death_certificate_number: data.death_certificate_number,
                    occupation_before_death: data.occupation_before_death
                },

                // Construct Mother Data
                mother_data: {
                    full_name: data.mother_name,
                    id_type: data.mother_id_type,
                    id_number: data.mother_id_number,
                    marital_status: data.mother_marital_status,
                    occupation: data.mother_occupation,
                    can_read_write: data.mother_can_read_write,
                    phone_1: data.mother_phone_1,
                    phone_2: data.mother_phone_2,
                    is_custodian: data.mother_is_custodian_flag
                },

                // Construct Guardian Data
                guardian_data: {
                    full_name: data.guardian_name,
                    relationship_to_orphan: data.relationship_to_orphan,
                    id_type: data.guardian_id_type,
                    id_number: data.guardian_id_number,
                    phone: data.guardian_phone,
                    current_occupation: data.guardian_occupation
                },

                // Construct Residence Data
                residence_data: {
                    country: data.residence_country,
                    province: data.residence_province,
                    district: data.residence_district,
                    neighborhood_or_street: data.neighborhood_or_street,
                    residence_condition: data.residence_condition
                },

                siblings: data.siblings?.map(sib => ({
                    ...sib,
                    date_of_birth: formatDateForDisplay(sib.date_of_birth)
                })) || []
            });
        } catch (err) {
            console.error(err);
            alert('خطأ في تحميل البيانات');
            navigate('/orphans');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // تحويل التواريخ للإرسال
            const dataToSend = {
                ...formData,
                date_of_birth: formatDateForServer(formData.date_of_birth),
                father_data: {
                    ...formData.father_data,
                    date_of_birth: formatDateForServer(formData.father_data?.date_of_birth),
                    date_of_death: formatDateForServer(formData.father_data?.date_of_death)
                },
                siblings: formData.siblings?.map(sib => ({
                    ...sib,
                    date_of_birth: formatDateForServer(sib.date_of_birth)
                }))
            };

            await axios.put(`${API_URL}/orphans/${id}`, dataToSend);
            alert('تم تحديث بيانات اليتيم بنجاح');
            navigate(`/orphans/${id}`);
        } catch (err) {
            alert('خطأ: ' + (err.response?.data?.message || err.message));
        }
    };

    const addSibling = () => {
        setFormData({
            ...formData,
            siblings: [...(formData.siblings || []), {
                full_name: '',
                date_of_birth: '',
                gender: 'male',
                grade_level: '',
                school_name: '',
                academic_rating: '',
                memorizes_quran: false,
                quran_parts_memorized: 0
            }]
        });
    };

    const removeSibling = (index) => {
        const newSiblings = formData.siblings.filter((_, i) => i !== index);
        setFormData({ ...formData, siblings: newSiblings });
    };

    const updateSibling = (index, field, value) => {
        const newSiblings = [...formData.siblings];
        newSiblings[index][field] = value;
        setFormData({ ...formData, siblings: newSiblings });
    };

    if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>جاري التحميل...</div>;
    if (!formData) return null;

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="section-title">
                <h2>تعديل بيانات اليتيم: {formData.full_name}</h2>
                <button type="button" className="button secondary" onClick={() => navigate(`/orphans/${id}`)}>
                    إلغاء
                </button>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    {/* البيانات الشخصية */}
                    <Section title="البيانات الشخصية">
                        <Input label="معرف اليتيم" value={formData.orphan_id} readOnly style={{ backgroundColor: '#f5f5f5' }} />
                        <Input label="الاسم الكامل" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                        <DateInput label="تاريخ الميلاد" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
                        <Select label="الجنس" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                        </Select>
                        <Input label="الجنسية" value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} />
                        <Select label="نوع الهوية" value={formData.id_type} onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}>
                            <option value="">-- اختر --</option>
                            <option value="شهادة ميلاد">شهادة ميلاد</option>
                            <option value="بطاقة شخصية">بطاقة شخصية</option>
                            <option value="جواز سفر">جواز سفر</option>
                        </Select>
                        <Input label="رقم الهوية" value={formData.id_number} onChange={(e) => setFormData({ ...formData, id_number: e.target.value })} />
                    </Section>

                    {/* بيانات الميلاد */}
                    <Section title="بيانات الميلاد">
                        <Input label="دولة الميلاد" value={formData.birth_country} onChange={(e) => setFormData({ ...formData, birth_country: e.target.value })} />
                        <Input label="محافظة الميلاد" value={formData.birth_province} onChange={(e) => setFormData({ ...formData, birth_province: e.target.value })} />
                        <Input label="عزلة الميلاد" value={formData.birth_district} onChange={(e) => setFormData({ ...formData, birth_district: e.target.value })} />
                        <Input label="حي الميلاد" value={formData.birth_neighborhood} onChange={(e) => setFormData({ ...formData, birth_neighborhood: e.target.value })} />
                    </Section>

                    {/* بيانات الأصل */}
                    <Section title="بيانات الأصل">
                        <Input label="دولة الأصل" value={formData.origin_country} onChange={(e) => setFormData({ ...formData, origin_country: e.target.value })} />
                        <Input label="محافظة الأصل" value={formData.origin_province} onChange={(e) => setFormData({ ...formData, origin_province: e.target.value })} />
                        <Input label="عزلة الأصل" value={formData.origin_district} onChange={(e) => setFormData({ ...formData, origin_district: e.target.value })} />
                    </Section>

                    {/* بيانات الإخوة */}
                    <Section title="بيانات الإخوة">
                        <Input label="عدد الإخوة الذكور" type="number" value={formData.male_siblings_count} onChange={(e) => setFormData({ ...formData, male_siblings_count: e.target.value })} />
                        <Input label="عدد الإخوة الإناث" type="number" value={formData.female_siblings_count} onChange={(e) => setFormData({ ...formData, female_siblings_count: e.target.value })} />
                        <Checkbox label="يعيش مع إخوته" checked={formData.lives_with_siblings} onChange={(e) => setFormData({ ...formData, lives_with_siblings: e.target.checked })} />
                    </Section>

                    {/* الحالة الصحية */}
                    <Section title="الحالة الصحية">
                        <Select label="الحالة الصحية" value={formData.health_condition} onChange={(e) => setFormData({ ...formData, health_condition: e.target.value })}>
                            <option value="سليم">سليم</option>
                            <option value="مريض">مريض</option>
                        </Select>
                        {formData.health_condition === 'مريض' && (
                            <>
                                <Select label="نوع المرض" value={formData.illness_type} onChange={(e) => setFormData({ ...formData, illness_type: e.target.value })}>
                                    <option value="">-- اختر --</option>
                                    <option value="إعاقة">إعاقة</option>
                                    <option value="مرض مزمن">مرض مزمن</option>
                                    <option value="أخرى">أخرى</option>
                                </Select>
                                <Textarea label="ملاحظات حول المرض" value={formData.illness_notes} onChange={(e) => setFormData({ ...formData, illness_notes: e.target.value })} />
                            </>
                        )}
                    </Section>

                    {/* الحالة التعليمية */}
                    <Section title="الحالة التعليمية">
                        <Checkbox label="يدرس حالياً" checked={formData.is_studying} onChange={(e) => setFormData({ ...formData, is_studying: e.target.checked })} />
                        {formData.is_studying ? (
                            <>
                                <Input label="الصف الدراسي" value={formData.grade_level} onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })} />
                                <Input label="اسم المدرسة" value={formData.school_name} onChange={(e) => setFormData({ ...formData, school_name: e.target.value })} />
                                <Select label="نوع المدرسة" value={formData.school_type} onChange={(e) => setFormData({ ...formData, school_type: e.target.value })}>
                                    <option value="حكومي">حكومي</option>
                                    <option value="أهلي">أهلي</option>
                                </Select>
                                <Select label="التقدير الدراسي" value={formData.academic_rating} onChange={(e) => setFormData({ ...formData, academic_rating: e.target.value })}>
                                    <option value="">-- اختر --</option>
                                    <option value="ممتاز">ممتاز</option>
                                    <option value="جيد جدا">جيد جداً</option>
                                    <option value="جيد">جيد</option>
                                    <option value="مقبول">مقبول</option>
                                    <option value="ضعيف">ضعيف</option>
                                </Select>
                            </>
                        ) : (
                            <Textarea label="سبب عدم الدراسة" value={formData.not_studying_reason} onChange={(e) => setFormData({ ...formData, not_studying_reason: e.target.value })} />
                        )}
                    </Section>

                    {/* حفظ القرآن */}
                    <Section title="حفظ القرآن الكريم">
                        <Checkbox label="يحفظ القرآن" checked={formData.memorizes_quran} onChange={(e) => setFormData({ ...formData, memorizes_quran: e.target.checked })} />
                        {formData.memorizes_quran ? (
                            <>
                                <Input label="اسم المركز" value={formData.quran_center_name} onChange={(e) => setFormData({ ...formData, quran_center_name: e.target.value })} />
                                <Input label="عدد الأجزاء المحفوظة" type="number" step="0.5" value={formData.quran_parts_memorized} onChange={(e) => setFormData({ ...formData, quran_parts_memorized: e.target.value })} />
                            </>
                        ) : (
                            <Textarea label="سبب عدم الحفظ" value={formData.not_memorizing_reason} onChange={(e) => setFormData({ ...formData, not_memorizing_reason: e.target.value })} />
                        )}
                    </Section>

                    {/* بيانات الأب */}
                    <Section title="بيانات والد اليتيم">
                        <Input label="اسم الأب الكامل" value={formData.father_data?.full_name} onChange={(e) => setFormData({ ...formData, father_data: { ...formData.father_data, full_name: e.target.value } })} />
                        <DateInput label="تاريخ ميلاد الأب" value={formData.father_data?.date_of_birth} onChange={(e) => setFormData({ ...formData, father_data: { ...formData.father_data, date_of_birth: e.target.value } })} />
                        <DateInput label="تاريخ الوفاة" value={formData.father_data?.date_of_death} onChange={(e) => setFormData({ ...formData, father_data: { ...formData.father_data, date_of_death: e.target.value } })} />
                        <Input label="سبب الوفاة" value={formData.father_data?.cause_of_death} onChange={(e) => setFormData({ ...formData, father_data: { ...formData.father_data, cause_of_death: e.target.value } })} />
                        <Select label="نوع شهادة الوفاة" value={formData.father_data?.death_certificate_type} onChange={(e) => setFormData({ ...formData, father_data: { ...formData.father_data, death_certificate_type: e.target.value } })}>
                            <option value="مدنية">مدنية</option>
                            <option value="عسكرية">عسكرية</option>
                            <option value="بلاغ وفاة">بلاغ وفاة</option>
                        </Select>
                        <Input label="رقم شهادة الوفاة" value={formData.father_data?.death_certificate_number} onChange={(e) => setFormData({ ...formData, father_data: { ...formData.father_data, death_certificate_number: e.target.value } })} />
                        <Input label="العمل قبل الوفاة" value={formData.father_data?.occupation_before_death} onChange={(e) => setFormData({ ...formData, father_data: { ...formData.father_data, occupation_before_death: e.target.value } })} />
                    </Section>

                    {/* بيانات الأم */}
                    <Section title="بيانات والدة اليتيم">
                        <Input label="اسم الأم الكامل" value={formData.mother_data?.full_name} onChange={(e) => setFormData({ ...formData, mother_data: { ...formData.mother_data, full_name: e.target.value } })} />
                        <Input label="نوع الهوية" value={formData.mother_data?.id_type} onChange={(e) => setFormData({ ...formData, mother_data: { ...formData.mother_data, id_type: e.target.value } })} />
                        <Input label="رقم الهوية" value={formData.mother_data?.id_number} onChange={(e) => setFormData({ ...formData, mother_data: { ...formData.mother_data, id_number: e.target.value } })} />
                        <Input label="الحالة الاجتماعية" value={formData.mother_data?.marital_status} onChange={(e) => setFormData({ ...formData, mother_data: { ...formData.mother_data, marital_status: e.target.value } })} />
                        <Input label="العمل" value={formData.mother_data?.occupation} onChange={(e) => setFormData({ ...formData, mother_data: { ...formData.mother_data, occupation: e.target.value } })} />
                        <Checkbox label="تقرأ وتكتب" checked={formData.mother_data?.can_read_write} onChange={(e) => setFormData({ ...formData, mother_data: { ...formData.mother_data, can_read_write: e.target.checked } })} />
                        <Input label="رقم هاتف 1" value={formData.mother_data?.phone_1} onChange={(e) => setFormData({ ...formData, mother_data: { ...formData.mother_data, phone_1: e.target.value } })} />
                        <Input label="رقم هاتف 2" value={formData.mother_data?.phone_2} onChange={(e) => setFormData({ ...formData, mother_data: { ...formData.mother_data, phone_2: e.target.value } })} />
                        <Checkbox label="الأم هي الحاضنة" checked={formData.mother_is_custodian} onChange={(e) => setFormData({ ...formData, mother_is_custodian: e.target.checked })} />
                    </Section>

                    {/* بيانات المعيل (conditional) */}
                    {!formData.mother_is_custodian && (
                        <Section title="بيانات معيل اليتيم">
                            <Input label="اسم المعيل" value={formData.guardian_data?.full_name} onChange={(e) => setFormData({ ...formData, guardian_data: { ...formData.guardian_data, full_name: e.target.value } })} />
                            <Input label="صلة القرابة" value={formData.guardian_data?.relationship_to_orphan} onChange={(e) => setFormData({ ...formData, guardian_data: { ...formData.guardian_data, relationship_to_orphan: e.target.value } })} />
                            <Input label="نوع الهوية" value={formData.guardian_data?.id_type} onChange={(e) => setFormData({ ...formData, guardian_data: { ...formData.guardian_data, id_type: e.target.value } })} />
                            <Input label="رقم الهوية" value={formData.guardian_data?.id_number} onChange={(e) => setFormData({ ...formData, guardian_data: { ...formData.guardian_data, id_number: e.target.value } })} />
                            <Input label="رقم الهاتف" value={formData.guardian_data?.phone} onChange={(e) => setFormData({ ...formData, guardian_data: { ...formData.guardian_data, phone: e.target.value } })} />
                            <Input label="العمل الحالي" value={formData.guardian_data?.current_occupation} onChange={(e) => setFormData({ ...formData, guardian_data: { ...formData.guardian_data, current_occupation: e.target.value } })} />
                        </Section>
                    )}

                    {/* بيانات السكن */}
                    <Section title="بيانات مكان السكن">
                        <Input label="الدولة" value={formData.residence_data?.country} onChange={(e) => setFormData({ ...formData, residence_data: { ...formData.residence_data, country: e.target.value } })} />
                        <Input label="المحافظة" value={formData.residence_data?.province} onChange={(e) => setFormData({ ...formData, residence_data: { ...formData.residence_data, province: e.target.value } })} />
                        <Input label="المديرية" value={formData.residence_data?.district} onChange={(e) => setFormData({ ...formData, residence_data: { ...formData.residence_data, district: e.target.value } })} />
                        <Input label="الحي/الشارع" value={formData.residence_data?.neighborhood_or_street} onChange={(e) => setFormData({ ...formData, residence_data: { ...formData.residence_data, neighborhood_or_street: e.target.value } })} />
                        <Select label="حالة السكن" value={formData.residence_data?.residence_condition} onChange={(e) => setFormData({ ...formData, residence_data: { ...formData.residence_data, residence_condition: e.target.value } })}>
                            <option value="جيدة">جيدة</option>
                            <option value="متوسطة">متوسطة</option>
                            <option value="ضعيفة">ضعيفة</option>
                        </Select>
                    </Section>

                    <div style={{ gridColumn: '1/-1', marginTop: 20 }}>
                        <button type="submit" className="button" style={{ width: '100%', padding: 16 }}>
                            تحديث بيانات اليتيم
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
