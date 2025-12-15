import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, DatePicker, Select, InputNumber, Card, Row, Col, Divider, message, Spin } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const API_URL = 'http://localhost:4000/api';

export default function GuardiansEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type') || 'external';

    useEffect(() => {
        fetchGuardian();
    }, [id]);

    const fetchGuardian = async () => {
        try {
            const res = await axios.get(`${API_URL}/guardians/${id}?type=${type}`);
            const data = res.data;

            // Set form values
            form.setFieldsValue({
                ...data,
                date_of_birth: data.date_of_birth ? dayjs(data.date_of_birth) : null,
                marital_status: data.marital_status || undefined,
                educational_level: data.educational_level || undefined,
                health_condition: data.health_condition || data.health_status || undefined
            });
        } catch (err) {
            message.error('خطأ في تحميل البيانات: ' + (err.response?.data?.message || err.message));
            navigate('/guardians');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            const dataToSend = {
                ...values,
                date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null
            };

            await axios.patch(`${API_URL}/guardians/${id}?type=${type}`, dataToSend);
            message.success('تم تحديث البيانات بنجاح');
            navigate(`/guardians/${id}?type=${type}`);
        } catch (err) {
            message.error('خطأ في التحديث: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="جاري التحميل..." />
            </div>
        );
    }

    return (
        <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
            <Card
                title={
                    <span>
                        تعديل بيانات {type === 'mother' ? 'الأم' : 'المعيل'}
                    </span>
                }
                extra={
                    <Button
                        icon={<CloseOutlined />}
                        onClick={() => navigate(`/guardians/${id}?type=${type}`)}
                    >
                        إلغاء
                    </Button>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Divider orientation="right">البيانات الشخصية</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="الاسم الرباعي"
                                name="full_name"
                                rules={[{ required: true, message: 'الرجاء إدخال الاسم الرباعي' }]}
                            >
                                <Input placeholder="الاسم الرباعي" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="تاريخ الميلاد"
                                name="date_of_birth"
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    placeholder="اختر التاريخ"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="رقم الهوية / البطاقة الشخصية"
                                name="id_number"
                            >
                                <Input placeholder="رقم الهوية" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="الجنسية"
                                name="nationality"
                            >
                                <Input placeholder="الجنسية" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="صلة القرابة"
                                name="relationship"
                            >
                                <Select placeholder="اختر صلة القرابة">
                                    <Option value="Mother">الأم</Option>
                                    <Option value="Uncle">عم</Option>
                                    <Option value="Aunt">عمة</Option>
                                    <Option value="Grandfather">جد</Option>
                                    <Option value="Grandmother">جدة</Option>
                                    <Option value="Brother">أخ</Option>
                                    <Option value="Sister">أخت</Option>
                                    <Option value="Other">أخرى</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="الحالة الاجتماعية"
                                name="marital_status"
                            >
                                <Select placeholder="اختر الحالة الاجتماعية">
                                    <Option value="متزوج">متزوج</Option>
                                    <Option value="أعزب">أعزب</Option>
                                    <Option value="مطلق">مطلق</Option>
                                    <Option value="أرمل">أرمل</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="المستوى التعليمي"
                                name="educational_level"
                            >
                                <Select placeholder="اختر المستوى التعليمي">
                                    <Option value="أمي">أمي</Option>
                                    <Option value="ابتدائي">ابتدائي</Option>
                                    <Option value="إعدادي">إعدادي</Option>
                                    <Option value="ثانوي">ثانوي</Option>
                                    <Option value="جامعي">جامعي</Option>
                                    <Option value="دراسات عليا">دراسات عليا</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="رقم التواصل"
                                name="phone"
                            >
                                <Input placeholder="رقم الهاتف" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="right">معلومات السكن</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="المحافظة"
                                name="province"
                            >
                                <Input placeholder="المحافظة" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="المديرية"
                                name="district"
                            >
                                <Input placeholder="المديرية" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                label="العنوان التفصيلي"
                                name="address"
                            >
                                <Input placeholder="الحي، الشارع، رقم المنزل" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="right">البيانات المهنية والمعيشية</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="المهنة الحالية"
                                name="current_occupation"
                            >
                                <Input placeholder="المهنة" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="مكان العمل"
                                name="work_place"
                            >
                                <Input placeholder="مكان العمل" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="الدخل الشهري (ريال)"
                                name="monthly_income"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="الدخل الشهري"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="الحالة الصحية"
                                name="health_condition"
                            >
                                <Select placeholder="اختر الحالة الصحية">
                                    <Option value="سليم">سليم</Option>
                                    <Option value="مريض">مريض</Option>
                                    <Option value="معاق">معاق</Option>
                                    <Option value="مزمن">مرض مزمن</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="right">معلومات إضافية</Divider>
                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                label="ملاحظات"
                                name="notes"
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="أي ملاحظات إضافية عن المعيل"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={submitting}
                                    block
                                    size="large"
                                >
                                    حفظ التعديلات
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
}
