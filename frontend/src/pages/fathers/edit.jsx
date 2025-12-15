import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, DatePicker, Select, Card, Row, Col, Divider, message, Spin } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const API_URL = 'http://localhost:4000/api';

export default function FathersEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchFather();
    }, [id]);

    const fetchFather = async () => {
        try {
            const res = await axios.get(`${API_URL}/fathers/${id}`);
            const data = res.data;

            form.setFieldsValue({
                ...data,
                date_of_birth: data.date_of_birth ? dayjs(data.date_of_birth) : null,
                date_of_death: data.date_of_death ? dayjs(data.date_of_death) : null,
                death_certificate_type: data.death_certificate_type || undefined
            });
        } catch (err) {
            message.error('خطأ في تحميل البيانات');
            navigate('/fathers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            const dataToSend = {
                ...values,
                date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
                date_of_death: values.date_of_death ? values.date_of_death.format('YYYY-MM-DD') : null
            };

            await axios.patch(`${API_URL}/fathers/${id}`, dataToSend);
            message.success('تم تحديث البيانات بنجاح');
            navigate(`/fathers/${id}`);
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
                title="تعديل بيانات الأب المتوفي"
                extra={
                    <Button
                        icon={<CloseOutlined />}
                        onClick={() => navigate(`/fathers/${id}`)}
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
                                rules={[{ required: true, message: 'الرجاء إدخال الاسم' }]}
                            >
                                <Input placeholder="الاسم الكامل" />
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
                                    placeholder="تاريخ الميلاد"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="المهنة قبل الوفاة"
                                name="occupation_before_death"
                            >
                                <Input placeholder="المهنة" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="right">بيانات الوفاة</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="تاريخ الوفاة"
                                name="date_of_death"
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    placeholder="تاريخ الوفاة"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="سبب الوفاة"
                                name="cause_of_death"
                            >
                                <Input placeholder="سبب الوفاة" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="نوع شهادة الوفاة"
                                name="death_certificate_type"
                            >
                                <Select placeholder="اختر النوع">
                                    <Option value="مدنية">مدنية</Option>
                                    <Option value="عسكرية">عسكرية</Option>
                                    <Option value="بلاغ وفاة">بلاغ وفاة</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="رقم شهادة الوفاة"
                                name="death_certificate_number"
                            >
                                <Input placeholder="رقم الشهادة" />
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
