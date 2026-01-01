import { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, message, Select, DatePicker, Card, Tooltip, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UsergroupAddOutlined, DollarOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

export default function Organizations() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    // Create/Edit Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);
    const [form] = Form.useForm();

    // Action Modals State (Sponsorship/Marketing)
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [actionType, setActionType] = useState(null); // 'sponsorship' or 'marketing'
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [orphans, setOrphans] = useState([]); // For selection
    const [actionForm] = Form.useForm();

    useEffect(() => {
        fetchOrganizations();
        fetchOrphans(); // Pre-fetch orphans for selection
    }, [searchText, typeFilter]);

    const fetchOrganizations = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:4000/api/organizations', {
                params: { search: searchText, type: typeFilter === 'all' ? undefined : typeFilter }
            });
            setOrganizations(res.data);
        } catch (error) {
            message.error('فشل في جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrphans = async () => {
        try {
            // Assuming there's an endpoint to get simple orphan list
            const res = await axios.get('http://localhost:4000/api/orphans');
            setOrphans(res.data);
        } catch (error) {
            console.error('Error fetching orphans');
        }
    };

    // --- CRUD Operations ---
    const handleAdd = () => {
        setEditingOrg(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingOrg(record);
        form.setFieldsValue({
            ...record,
            start_date: record.start_date ? moment(record.start_date) : null,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'هل أنت متأكد من الحذف؟',
            content: 'لا يمكن التراجع عن هذا الإجراء',
            okText: 'نعم، احذف',
            cancelText: 'إلغاء',
            okType: 'danger',
            onOk: async () => {
                try {
                    await axios.delete(`http://localhost:4000/api/organizations/${id}`);
                    message.success('تم الحذف بنجاح');
                    fetchOrganizations();
                } catch (error) {
                    message.error('فشل الحذف');
                }
            },
        });
    };

    const onFinish = async (values) => {
        try {
            // Convert moment to YYYY-MM-DD
            const payload = {
                ...values,
                start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
            };

            if (editingOrg) {
                await axios.put(`http://localhost:4000/api/organizations/${editingOrg.id}`, payload);
                message.success('تم التحديث بنجاح');
            } else {
                await axios.post('http://localhost:4000/api/organizations', payload);
                message.success('تمت الإضافة بنجاح');
            }
            setIsModalVisible(false);
            fetchOrganizations();
        } catch (error) {
            message.error('حدث خطأ أثناء الحفظ');
        }
    };

    // --- Action Operations (Sponsorship/Marketing) ---
    const openActionModal = (org, type) => {
        setSelectedOrg(org);
        setActionType(type);
        setActionModalVisible(true);
        actionForm.resetFields();
    };

    const handleActionFinish = async (values) => {
        try {
            const payload = {
                orphan_ids: values.orphan_ids,
                notes: values.notes,
                [actionType === 'sponsorship' ? 'start_date' : 'marketing_date']: values.date ? values.date.format('YYYY-MM-DD') : undefined
            };

            const endpoint = actionType === 'sponsorship' ? 'sponsorships' : 'marketing';
            await axios.post(`http://localhost:4000/api/organizations/${selectedOrg.id}/${endpoint}`, payload);

            message.success(actionType === 'sponsorship' ? 'تمت إضافة الكفالة بنجاح' : 'تمت إضافة التسويق بنجاح');
            setActionModalVisible(false);
            // Optionally update org list if status changed (e.g. became sponsor)
            fetchOrganizations();
        } catch (error) {
            message.error('فشل تنفيذ العملية');
        }
    };

    const columns = [
        {
            title: 'اسم الجهة',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <strong>{text}</strong>
                    <Space size={4}>
                        {record.is_sponsor === 1 && <Tag color="green">كافلة</Tag>}
                        {record.is_marketing === 1 && <Tag color="blue">تسويق</Tag>}
                    </Space>
                </Space>
            )
        },
        { title: 'المسؤول', dataIndex: 'responsible_person', key: 'responsible_person' },
        { title: 'الهاتف', dataIndex: 'phone', key: 'phone' },
        { title: 'البريد الإلكتروني', dataIndex: 'email', key: 'email', responsive: ['md'] },
        {
            title: 'الإجراءات',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="تعديل"><Button icon={<EditOutlined />} onClick={() => handleEdit(record)} /></Tooltip>
                    <Tooltip title="إضافة كفالة"><Button icon={<DollarOutlined />} style={{ color: 'green', borderColor: 'green' }} onClick={() => openActionModal(record, 'sponsorship')} /></Tooltip>
                    <Tooltip title="إضافة تسويق"><Button icon={<UsergroupAddOutlined />} style={{ color: '#1890ff', borderColor: '#1890ff' }} onClick={() => openActionModal(record, 'marketing')} /></Tooltip>
                    <Tooltip title="حذف"><Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} /></Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <h2>الجهات (الكافلة والتسويق)</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>إضافة جهة جديدة</Button>
            </div>

            <Card bordered={false} style={{ marginBottom: 24 }}>
                <Space wrap>
                    <Input
                        placeholder="بحث بالاسم، الهاتف، البريد..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                    <Select defaultValue="all" style={{ width: 150 }} onChange={setTypeFilter}>
                        <Option value="all">الكل</Option>
                        <Option value="sponsor">جهات كافلة</Option>
                        <Option value="marketing">جهات تسويق</Option>
                    </Select>
                </Space>
            </Card>

            <Table
                columns={columns}
                dataSource={organizations}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Create/Edit Modal */}
            <Modal
                title={editingOrg ? "تعديل بيانات الجهة" : "إضافة جهة جديدة"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="اسم الجهة" rules={[{ required: true, message: 'الاسم مطلوب' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="responsible_person" label="المسؤول عن قطاع الأيتام">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phone" label="رقم الهاتف">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="email" label="البريد الإلكتروني">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="start_date" label="تاريخ بدء التعامل">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="notes" label="ملاحظات">
                                <TextArea rows={3} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="نشاط الجهة" style={{ marginBottom: 0 }}>
                                <Space>
                                    <Form.Item name="is_sponsor" valuePropName="checked" noStyle>
                                        <Input type="checkbox" style={{ width: 20 }} /> جهة كافلة
                                    </Form.Item>
                                    <span style={{ margin: '0 10px' }}></span>
                                    <Form.Item name="is_marketing" valuePropName="checked" noStyle>
                                        <Input type="checkbox" style={{ width: 20 }} /> جهة تسويق
                                    </Form.Item>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>

                    <div style={{ marginTop: 20, textAlign: 'left' }}>
                        <Button onClick={() => setIsModalVisible(false)} style={{ marginLeft: 8 }}>إلغاء</Button>
                        <Button type="primary" htmlType="submit">حفظ</Button>
                    </div>
                </Form>
            </Modal>

            {/* Action Modal (Sponsor/Market) */}
            <Modal
                title={actionType === 'sponsorship' ? "إضافة مجموعة كفالة" : "إضافة مجموعة تسويق"}
                open={actionModalVisible}
                onCancel={() => setActionModalVisible(false)}
                footer={null}
            >
                <Form form={actionForm} layout="vertical" onFinish={handleActionFinish}>
                    <Form.Item
                        name="orphan_ids"
                        label="الأيتام"
                        rules={[{ required: true, message: 'يجب اختيار يتيم واحد على الأقل' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="اختر الأيتام..."
                            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                            {orphans.map(orphan => (
                                <Option key={orphan.id} value={orphan.id}>{orphan.full_name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="date" label={actionType === 'sponsorship' ? "تاريخ بدء الكفالة" : "تاريخ التسويق"} initialValue={moment()}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="notes" label="ملاحظات">
                        <TextArea rows={2} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>
                        {actionType === 'sponsorship' ? "حفظ الكفالة" : "حفظ التسويق"}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
}
