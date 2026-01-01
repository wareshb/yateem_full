import { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Card, message, Tabs, Table, Modal, Space, Select, Descriptions, Tag, Image } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, BankOutlined, SettingOutlined, MailOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TabPane } = Tabs;
const { Option } = Select;

export default function Settings() {
    const [form] = Form.useForm();
    const [bankForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(null);
    const [settingsData, setSettingsData] = useState({});

    // Bank Accounts State
    const [banks, setBanks] = useState([]);
    const [isBankModalVisible, setIsBankModalVisible] = useState(false);

    const [activeTab, setActiveTab] = useState('4');

    useEffect(() => {
        fetchSettings();
        fetchBanks();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:4000/api/settings');
            form.setFieldsValue(res.data);
            setSettingsData(res.data);
            if (res.data.org_logo) {
                setLogoUrl(`http://localhost:4000${res.data.org_logo}`);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            message.error('فشل في جلب الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const fetchBanks = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/settings/banks');
            setBanks(res.data);
        } catch (error) {
            console.error('Error fetching banks:', error);
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            await axios.put('http://localhost:4000/api/settings', values);
            message.success('تم حفظ الإعدادات بنجاح');
            fetchSettings(); // Refresh local state
            setActiveTab('4'); // Switch to Info tab
        } catch (error) {
            console.error('Error updating settings:', error);
            message.error('فشل في حفظ الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (info) => {
        const formData = new FormData();
        formData.append('logo', info.file);

        try {
            const res = await axios.post('http://localhost:4000/api/settings/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setLogoUrl(`http://localhost:4000${res.data.url}`);
            message.success('تم رفع الشعار بنجاح');
        } catch (error) {
            message.error('فشل رفع الشعار');
        }
    };

    // Bank Handlers
    const handleAddBank = async (values) => {
        try {
            await axios.post('http://localhost:4000/api/settings/banks', values);
            message.success('تم إضافة الحساب البنكي');
            setIsBankModalVisible(false);
            bankForm.resetFields();
            fetchBanks();
            setActiveTab('4'); // Switch to Info tab
        } catch (error) {
            message.error('فشل إضافة الحساب البنكي');
        }
    };

    const handleDeleteBank = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/api/settings/banks/${id}`);
            message.success('تم حذف الحساب البنكي');
            fetchBanks();
        } catch (error) {
            message.error('فشل حذف الحساب البنكي');
        }
    };

    const bankColumns = [
        { title: 'اسم البنك', dataIndex: 'bank_name', key: 'bank_name' },
        { title: 'رقم الحساب', dataIndex: 'account_number', key: 'account_number' },
        { title: 'IBAN', dataIndex: 'iban', key: 'iban' },
        { title: 'العملة', dataIndex: 'currency', key: 'currency' },
        {
            title: 'إجراءات',
            key: 'action',
            render: (_, record) => (
                <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteBank(record.id)}>حذف</Button>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
                <h2>إعدادات النظام</h2>
                <span className="text-muted">تخصيص بيانات المؤسسة والحسابات البنكية</span>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab={<span><InfoCircleOutlined /> عرض المعلومات</span>} key="4">
                    <Card bordered={false}>
                        <Descriptions title="بيانات المؤسسة" bordered column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
                            <Descriptions.Item label="اسم المؤسسة">{settingsData.org_name || '-'}</Descriptions.Item>
                            <Descriptions.Item label="الوصف">{settingsData.org_description || '-'}</Descriptions.Item>
                            <Descriptions.Item label="الشعار">
                                {logoUrl ? <Image width={100} src={logoUrl} /> : <Tag>لا يوجد شعار</Tag>}
                            </Descriptions.Item>
                        </Descriptions>

                        <Descriptions title="العنوان والتواصل" bordered layout="vertical" style={{ marginTop: 24 }}>
                            <Descriptions.Item label="الدولة">{settingsData.address_country || '-'}</Descriptions.Item>
                            <Descriptions.Item label="المدينة">{settingsData.address_city || '-'}</Descriptions.Item>
                            <Descriptions.Item label="الشارع">{settingsData.address_street || '-'}</Descriptions.Item>
                            <Descriptions.Item label="هاتف 1">{settingsData.phone_1 || '-'}</Descriptions.Item>
                            <Descriptions.Item label="هاتف 2">{settingsData.phone_2 || '-'}</Descriptions.Item>
                            <Descriptions.Item label="البريد الإلكتروني">{settingsData.email || '-'}</Descriptions.Item>
                            <Descriptions.Item label="الموقع الإلكتروني">{settingsData.website || '-'}</Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24 }}>
                            <h3>الحسابات البنكية</h3>
                            <Table
                                columns={bankColumns.filter(c => c.key !== 'action')}
                                dataSource={banks}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                bordered
                            />
                        </div>
                    </Card>
                </TabPane>

                <TabPane tab={<span><SettingOutlined /> عام</span>} key="1">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <div className="grid-2">
                            <Card title="بيانات المؤسسة" bordered={false}>
                                <Form.Item name="org_name" label="اسم المؤسسة" rules={[{ required: true }]}>
                                    <Input placeholder="أدخل اسم المؤسسة" />
                                </Form.Item>
                                <Form.Item name="org_description" label="وصف المؤسسة">
                                    <Input.TextArea rows={3} placeholder="وصف مختصر..." />
                                </Form.Item>
                                <Form.Item label="شعار المؤسسة">
                                    <Upload beforeUpload={() => false} onChange={handleLogoUpload} showUploadList={false}>
                                        <Button icon={<UploadOutlined />}>رفع شعار</Button>
                                    </Upload>
                                    {logoUrl && <img src={logoUrl} alt="Logo" style={{ marginTop: 10, maxWidth: 100, borderRadius: 8 }} />}
                                </Form.Item>
                            </Card>

                            <Card title="بيانات التواصل والعنوان" bordered={false}>
                                <div className="form-row">
                                    <Form.Item name="address_country" label="الدولة" style={{ flex: 1 }}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="address_city" label="المدينة" style={{ flex: 1 }}>
                                        <Input />
                                    </Form.Item>
                                </div>
                                <Form.Item name="address_street" label="الشارع">
                                    <Input />
                                </Form.Item>
                                <div className="form-row">
                                    <Form.Item name="phone_1" label="هاتف 1" style={{ flex: 1 }}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="phone_2" label="هاتف 2" style={{ flex: 1 }}>
                                        <Input />
                                    </Form.Item>
                                </div>
                                <Form.Item name="email" label="البريد الإلكتروني">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="website" label="الموقع الإلكتروني">
                                    <Input />
                                </Form.Item>
                            </Card>
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <Button type="primary" htmlType="submit" loading={loading} size="large">
                                حفظ التغييرات
                            </Button>
                        </div>
                    </Form>
                </TabPane>

                <TabPane tab={<span><BankOutlined /> الحسابات البنكية</span>} key="2">
                    <Card
                        title="قائمة الحسابات البنكية"
                        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsBankModalVisible(true)}>إضافة حساب</Button>}
                        bordered={false}
                    >
                        <Table columns={bankColumns} dataSource={banks} rowKey="id" />
                    </Card>
                </TabPane>

                <TabPane tab={<span><MailOutlined /> إعدادات البريد (SMTP)</span>} key="3">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Card bordered={false}>
                            <div className="grid-2">
                                <Form.Item name="smtp_host" label="خادم SMTP">
                                    <Input placeholder="smtp.example.com" />
                                </Form.Item>
                                <Form.Item name="smtp_port" label="المنفذ (Port)">
                                    <Input type="number" placeholder="587" />
                                </Form.Item>
                                <Form.Item name="smtp_user" label="اسم المستخدم">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="smtp_pass" label="كلمة المرور">
                                    <Input.Password />
                                </Form.Item>
                            </div>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                حفظ إعدادات البريد
                            </Button>
                        </Card>
                    </Form>
                </TabPane>
            </Tabs>

            <Modal
                title="إضافة حساب بنكي"
                open={isBankModalVisible}
                onCancel={() => setIsBankModalVisible(false)}
                footer={null}
            >
                <Form form={bankForm} layout="vertical" onFinish={handleAddBank}>
                    <Form.Item name="bank_name" label="اسم البنك" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="account_number" label="رقم الحساب" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="iban" label="IBAN">
                        <Input />
                    </Form.Item>
                    <Form.Item name="currency" label="العملة" initialValue="USD">
                        <Select>
                            <Option value="USD">دولار أمريكي (USD)</Option>
                            <Option value="YER">ريال يمني (YER)</Option>
                            <Option value="SAR">ريال سعودي (SAR)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            إضافة
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <style jsx>{`
                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                .form-row {
                    display: flex;
                    gap: 16px;
                }
                @media (max-width: 768px) {
                    .grid-2 {
                        grid-template-columns: 1fr;
                    }
                    .form-row {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}
