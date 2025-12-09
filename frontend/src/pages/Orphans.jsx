import { useState, useEffect } from 'react';
import axios from 'axios';
import DateInput from '../components/DateInput';
import { formatDateForDisplay, formatDateForServer } from '../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

export default function Orphans() {
  const [orphans, setOrphans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());

  useEffect(() => {
    fetchOrphans();
  }, []);

  const fetchOrphans = async () => {
    try {
      const res = await axios.get(`${API_URL}/orphans`);
      setOrphans(res.data);
    } catch (err) {
      console.error('خطأ في تحميل الأيتام:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // تحويل التواريخ من dd/mm/yyyy إلى yyyy-mm-dd قبل الإرسال
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

      await axios.post(`${API_URL}/orphans`, dataToSend);
      alert('تم إضافة اليتيم بنجاح');
      setFormData(getEmptyForm());
      setShowForm(false);
      fetchOrphans();
    } catch (err) {
      alert('خطأ: ' + (err.response?.data?.message || err.message));
    }
  };

  const viewOrphanDetails = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/orphans/${id}`);
      setViewDetails(res.data);
    } catch (err) {
      alert('خطأ في تحميل التفاصيل');
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

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="section-title">
        <h2>بيانات الأيتام</h2>
        <button className="button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'إلغاء' : '+ إضافة يتيم'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>إضافة يتيم جديد</h3>
          <form onSubmit={handleSubmit}>
            {/* البيانات الشخصية */}
            <Section title="البيانات الشخصية">
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

            {/* إدارة الإخوة/الأخوات */}
            <Section title="بيانات الإخوة والأخوات" action={<button type="button" className="button secondary" onClick={addSibling}>+ إضافة أخ/أخت</button>}>
              {formData.siblings?.map((sibling, index) => (
                <div key={index} style={{ border: '1px solid var(--border)', padding: 16, borderRadius: 8, marginBottom: 12, background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <strong>أخ/أخت #{index + 1}</strong>
                    <button type="button" className="button secondary" style={{ padding: '4px 12px' }} onClick={() => removeSibling(index)}>حذف</button>
                  </div>
                  <div className="form-grid">
                    <Input label="الاسم" value={sibling.full_name} onChange={(e) => updateSibling(index, 'full_name', e.target.value)} />
                    <DateInput label="تاريخ الميلاد" value={sibling.date_of_birth} onChange={(e) => updateSibling(index, 'date_of_birth', e.target.value)} />
                    <Select label="الجنس" value={sibling.gender} onChange={(e) => updateSibling(index, 'gender', e.target.value)}>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </Select>
                    <Input label="الصف الدراسي" value={sibling.grade_level} onChange={(e) => updateSibling(index, 'grade_level', e.target.value)} />
                    <Input label="المدرسة" value={sibling.school_name} onChange={(e) => updateSibling(index, 'school_name', e.target.value)} />
                    <Input label="عدد الأجزاء" type="number" step="0.5" value={sibling.quran_parts_memorized} onChange={(e) => updateSibling(index, 'quran_parts_memorized', e.target.value)} />
                  </div>
                </div>
              ))}
            </Section>

            <div style={{ gridColumn: '1/-1', marginTop: 20 }}>
              <button type="submit" className="button" style={{ width: '100%', padding: 16 }}>
                حفظ بيانات اليتيم
              </button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة الأيتام */}
      <div className="card">
        <h3>قائمة الأيتام ({orphans.length})</h3>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center' }}>جاري التحميل...</div>
        ) : orphans.length === 0 ? (
          <p>لا توجد بيانات</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>المعرف</th>
                <th>الاسم</th>
                <th>العمر</th>
                <th>الجنس</th>
                <th>المحافظة</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orphans.map((orphan) => (
                <tr key={orphan.id}>
                  <td>{orphan.orphan_id || orphan.uid}</td>
                  <td><strong>{orphan.full_name}</strong></td>
                  <td>{orphan.age || calculateAge(orphan.date_of_birth)} سنة</td>
                  <td>{orphan.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                  <td>{orphan.residence_province || orphan.province || '-'}</td>
                  <td>
                    {orphan.sponsor_name ? (
                      <span className="tag green">مكفول</span>
                    ) : (
                      <span className="tag yellow">غير مكفول</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="button secondary"
                      style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                      onClick={() => viewOrphanDetails(orphan.id)}
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

      {/* عرض التفاصيل الكاملة */}
      {viewDetails && (
        <div className="card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3>تفاصيل اليتيم: {viewDetails.full_name}</h3>
            <button className="button secondary" onClick={() => setViewDetails(null)}>إغلاق</button>
          </div>

          <div className="details-grid">
            <DetailSection title="البيانات الشخصية">
              <DetailItem label="المعرف" value={viewDetails.orphan_id} />
              <DetailItem label="الاسم" value={viewDetails.full_name} />
              <DetailItem label="تاريخ الميلاد" value={viewDetails.date_of_birth} />
              <DetailItem label="العمر" value={viewDetails.age || calculateAge(viewDetails.date_of_birth)} />
              <DetailItem label="الجنس" value={viewDetails.gender === 'male' ? 'ذكر' : 'أنثى'} />
              <DetailItem label="الجنسية" value={viewDetails.nationality} />
            </DetailSection>

            <DetailSection title="بيانات الأب">
              <DetailItem label="الاسم" value={viewDetails.father_name} />
              <DetailItem label="تاريخ الوفاة" value={viewDetails.date_of_death} />
              <DetailItem label="سبب الوفاة" value={viewDetails.cause_of_death} />
            </DetailSection>

            <DetailSection title="بيانات الأم">
              <DetailItem label="الاسم" value={viewDetails.mother_name} />
              <DetailItem label="الهاتف" value={viewDetails.mother_phone_1} />
              <DetailItem label="حاضنة؟" value={viewDetails.mother_is_custodian_flag ? 'نعم' : 'لا'} />
            </DetailSection>

            {viewDetails.guardian_name && (
              <DetailSection title="بيانات المعيل">
                <DetailItem label="الاسم" value={viewDetails.guardian_name} />
                <DetailItem label="صلة القرابة" value={viewDetails.relationship_to_orphan} />
                <DetailItem label="الهاتف" value={viewDetails.guardian_phone} />
              </DetailSection>
            )}

            <DetailSection title="بيانات السكن">
              <DetailItem label="المحافظة" value={viewDetails.residence_province} />
              <DetailItem label="المديرية" value={viewDetails.residence_district} />
              <DetailItem label="الحي" value={viewDetails.neighborhood_or_street} />
              <DetailItem label="الحالة" value={viewDetails.residence_condition} />
            </DetailSection>

            <DetailSection title="الحالة الصحية">
              <DetailItem label="الحالة" value={viewDetails.health_condition} />
              {viewDetails.illness_type && <DetailItem label="النوع" value={viewDetails.illness_type} />}
              {viewDetails.illness_notes && <DetailItem label="ملاحظات" value={viewDetails.illness_notes} />}
            </DetailSection>

            <DetailSection title="الحالة التعليمية">
              <DetailItem label="يدرس؟" value={viewDetails.is_studying ? 'نعم' : 'لا'} />
              {viewDetails.is_studying && (
                <>
                  <DetailItem label="الصف" value={viewDetails.grade_level} />
                  <DetailItem label="المدرسة" value={viewDetails.school_name} />
                  <DetailItem label="التقدير" value={viewDetails.academic_rating} />
                </>
              )}
            </DetailSection>

            <DetailSection title="حفظ القرآن">
              <DetailItem label="يحفظ؟" value={viewDetails.memorizes_quran ? 'نعم' : 'لا'} />
              {viewDetails.memorizes_quran && (
                <>
                  <DetailItem label="المركز" value={viewDetails.quran_center_name} />
                  <DetailItem label="الأجزاء" value={viewDetails.quran_parts_memorized} />
                </>
              )}
            </DetailSection>

            {viewDetails.siblings?.length > 0 && (
              <DetailSection title={`الإخوة والأخوات (${viewDetails.siblings.length})`} fullWidth>
                <table className="table">
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>العمر</th>
                      <th>الصف</th>
                      <th>المدرسة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewDetails.siblings.map((sib, i) => (
                      <tr key={i}>
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

            {viewDetails.sponsorships?.length > 0 && (
              <DetailSection title="الكفالات" fullWidth>
                {viewDetails.sponsorships.map((sp, i) => (
                  <div key={i} style={{ padding: 12, background: 'var(--bg)', borderRadius: 6, marginBottom: 8 }}>
                    <strong>{sp.sponsor_name}</strong> - {sp.sponsorship_type} - {sp.start_date}
                  </div>
                ))}
              </DetailSection>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function Section({ title, children, action }) {
  return (
    <div style={{ gridColumn: '1/-1', marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '12px 0', borderBottom: '2px solid var(--accent)' }}>
        <h4 style={{ margin: 0, color: 'var(--accent)' }}>{title}</h4>
        {action}
      </div>
      <div className="form-grid">
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="input">
      <label>{label}</label>
      <input {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div className="input">
      <label>{label}</label>
      <select {...props}>{children}</select>
    </div>
  );
}

function Checkbox({ label, ...props }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, gridColumn: '1/-1', cursor: 'pointer' }}>
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div className="input" style={{ gridColumn: '1/-1' }}>
      <label>{label}</label>
      <textarea rows={3} {...props} />
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

function getEmptyForm() {
  return {
    full_name: '',
    date_of_birth: '',
    gender: 'male',
    nationality: 'يمني',
    id_type: '',
    id_number: '',
    birth_country: 'اليمن',
    birth_province: '',
    birth_district: '',
    birth_neighborhood: '',
    origin_country: 'اليمن',
    origin_province: '',
    origin_district: '',
    male_siblings_count: 0,
    female_siblings_count: 0,
    lives_with_siblings: true,
    health_condition: 'سليم',
    illness_type: '',
    illness_notes: '',
    is_studying: true,
    grade_level: '',
    school_name: '',
    school_type: 'حكومي',
    academic_rating: '',
    not_studying_reason: '',
    memorizes_quran: false,
    quran_center_name: '',
    quran_parts_memorized: 0,
    not_memorizing_reason: '',
    father_data: {
      full_name: '',
      date_of_birth: '',
      date_of_death: '',
      cause_of_death: '',
      death_certificate_type: 'مدنية',
      death_certificate_number: '',
      occupation_before_death: ''
    },
    mother_data: {
      full_name: '',
      id_type: '',
      id_number: '',
      marital_status: 'أرملة',
      occupation: '',
      can_read_write: false,
      phone_1: '',
      phone_2: ''
    },
    mother_is_custodian: true,
    guardian_data: {
      full_name: '',
      relationship_to_orphan: '',
      id_type: '',
      id_number: '',
      phone: '',
      current_occupation: ''
    },
    residence_data: {
      country: 'اليمن',
      province: '',
      district: '',
      neighborhood_or_street: '',
      residence_condition: 'متوسطة'
    },
    siblings: []
  };
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