import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Space, Input, Button, Tag, Avatar, Typography, Tooltip, Row, Col, Popconfirm, message, Popover, Checkbox } from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    SearchOutlined,
    PlusOutlined,
    ExportOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    SettingOutlined,
    WomanOutlined,
    TeamOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const API_URL = 'http://localhost:4000/api';

export default function GuardiansList() {
    const [guardians, setGuardians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchGuardians();
    }, []);

    const fetchGuardians = async () => {
        try {
            const res = await axios.get(`${API_URL}/guardians`);
            setGuardians(res.data);
        } catch (err) {
            console.error('خطأ في تحميل المعيلين:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, type) => {
        try {
            await axios.delete(`${API_URL}/guardians/${id}?type=${type}`);
            message.success('تم حذف المعيل بنجاح');
            fetchGuardians();
        } catch (err) {
            message.error('فشل الحذف: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredGuardians = useMemo(() => {
        if (!searchText) return guardians;
        const lowerSearch = searchText.toLowerCase();
        return guardians.filter(guardian =>
            (guardian.full_name || '').toLowerCase().includes(lowerSearch) ||
            (guardian.phone || '').toLowerCase().includes(lowerSearch) ||
            (guardian.job || '').toLowerCase().includes(lowerSearch) ||
            (guardian.relationship || '').toLowerCase().includes(lowerSearch)
        );
    }, [guardians, searchText]);

    const [visibleColumns, setVisibleColumns] = useState([
        'phone', 'job', 'relationship', 'orphans_count', 'rating'
    ]);

    const columnOptions = [
        { label: 'رقم الهاتف', value: 'phone' },
        { label: 'المهنة', value: 'job' },
        { label: 'العلاقة', value: 'relationship' },
        { label: 'عدد الأيتام', value: 'orphans_count' },
        { label: 'التقييم', value: 'rating' },
        { label: 'العنوان', value: 'address' },
        { label: 'الدخل الشهري', value: 'monthly_income' },
        { label: 'رقم الهوية', value: 'id_number' },
        { label: 'الجنسية', value: 'nationality' }
    ];

    // Helper for unique filters
    const getFilters = (data, key) => {
        const unique = [...new Set(data.map(item => item[key]).filter(Boolean))];
        return unique.sort().map(value => ({ text: value, value }));
    };

    // Helper for sorting
    const sorter = (key) => (a, b) => (a[key] || '').toString().localeCompare((b[key] || '').toString());

    // Generic OnFilter
    const onFilter = (key) => (value, record) => record[key] === value;

    const baseColumns = [
        {
            title: 'النوع',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            filters: [
                { text: 'أم', value: 'mother' },
                { text: 'معيل خارجي', value: 'external' }
            ],
            onFilter: (value, record) => record.type === value,
            render: (type) => (
                <Tag color={type === 'mother' ? 'blue' : 'orange'} icon={type === 'mother' ? <WomanOutlined /> : <TeamOutlined />}>
                    {type === 'mother' ? 'أم' : 'معيل خارجي'}
                </Tag>
            ),
            fixed: 'left'
        },
        {
            title: 'الاسم',
            dataIndex: 'full_name',
            key: 'full_name',
            width: 250,
            sorter: sorter('full_name'),
            render: (text, record) => (
                <Space>
                    <Avatar
                        style={{ backgroundColor: record.type === 'mother' ? '#1890ff' : '#fa8c16' }}
                        icon={record.type === 'mother' ? <WomanOutlined /> : <UserOutlined />}
                    >
                        {text ? text.charAt(0) : 'U'}
                    </Avatar>
                    <Text strong>{text}</Text>
                </Space>
            ),
            fixed: 'left'
        },
        {
            title: 'رقم الهاتف',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
            sorter: sorter('phone'),
            render: (text) => (
                <Space>
                    <PhoneOutlined style={{ color: '#52c41a' }} />
                    <Text>{text || '-'}</Text>
                </Space>
            )
        },
        {
            title: 'المهنة',
            dataIndex: 'job',
            key: 'job',
            width: 150,
            sorter: sorter('job'),
            filters: getFilters(guardians, 'job'),
            onFilter: onFilter('job'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'العلاقة',
            dataIndex: 'relationship',
            key: 'relationship',
            width: 150,
            sorter: sorter('relationship'),
            filters: getFilters(guardians, 'relationship'),
            onFilter: onFilter('relationship'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'عدد الأيتام',
            dataIndex: 'orphans_count',
            key: 'orphans_count',
            width: 120,
            sorter: (a, b) => (a.orphans_count || 0) - (b.orphans_count || 0),
            render: (count) => (
                <Tag color="cyan">{count || 0} يتيم</Tag>
            )
        },
        {
            title: 'التقييم',
            dataIndex: 'rating',
            key: 'rating',
            width: 100,
            sorter: sorter('rating'),
            filters: getFilters(guardians, 'rating'),
            onFilter: onFilter('rating'),
            render: (rating) => (
                <Tag color="green">{rating || 'جيد'}</Tag>
            )
        },
        {
            title: 'العنوان',
            dataIndex: 'address',
            key: 'address',
            width: 200,
            sorter: sorter('address'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'الدخل الشهري',
            dataIndex: 'monthly_income',
            key: 'monthly_income',
            width: 120,
            sorter: (a, b) => (parseFloat(a.monthly_income) || 0) - (parseFloat(b.monthly_income) || 0),
            render: (income) => <Text>{income ? `${income} ريال` : '-'}</Text>
        },
        {
            title: 'رقم الهوية',
            dataIndex: 'id_number',
            key: 'id_number',
            width: 150,
            sorter: sorter('id_number'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'الجنسية',
            dataIndex: 'nationality',
            key: 'nationality',
            width: 120,
            sorter: sorter('nationality'),
            filters: getFilters(guardians, 'nationality'),
            onFilter: onFilter('nationality'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'الإجراءات',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="عرض التفاصيل">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => navigate(`/guardians/${record.id}?type=${record.type}`)}
                        />
                    </Tooltip>
                    <Tooltip title="تعديل">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<EditOutlined style={{ color: '#faad14' }} />}
                            onClick={() => navigate(`/guardians/${record.id}/edit?type=${record.type}`)}
                        />
                    </Tooltip>
                    <Tooltip title="حذف">
                        <Popconfirm
                            title="هل أنت متأكد من حذف هذا السجل؟"
                            onConfirm={() => handleDelete(record.id, record.type)}
                            okText="نعم"
                            cancelText="لا"
                        >
                            <Button
                                type="text"
                                shape="circle"
                                icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    const columns = useMemo(() => {
        return baseColumns.filter(col => {
            if (col.key === 'type' || col.key === 'full_name' || col.key === 'actions') return true;
            return visibleColumns.includes(col.key);
        });
    }, [visibleColumns, guardians]);

    const columnSelectorContent = (
        <div style={{ width: 200 }}>
            <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                <Text strong>اختر الأعمدة</Text>
            </div>
            <div style={{ padding: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                <Checkbox.Group
                    options={columnOptions}
                    value={visibleColumns}
                    onChange={setVisibleColumns}
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                />
            </div>
        </div>
    );

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
            <div style={{ marginBottom: 16 }}>
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Space>
                            <Input
                                placeholder="البحث في المعيلين..."
                                prefix={<SearchOutlined />}
                                onChange={e => setSearchText(e.target.value)}
                                style={{ width: 300 }}
                            />
                            <Button icon={<ExportOutlined />}>تصدير</Button>
                            <Popover
                                content={columnSelectorContent}
                                title={null}
                                trigger="click"
                                placement="bottomRight"
                            >
                                <Button icon={<SettingOutlined />}>الأعمدة</Button>
                            </Popover>
                        </Space>
                    </Col>
                    <Col>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/guardians/create')}>
                            إضافة معيل
                        </Button>
                    </Col>
                </Row>
            </div>

            <Table
                columns={columns}
                dataSource={filteredGuardians}
                rowKey={(record) => record.id || record._id}
                loading={loading}
                scroll={{ x: 'max-content' }}
                pagination={{
                    pageSize: 10,
                    showTotal: (total, range) => `${range[0]}-${range[1]} من ${total} معيل`,
                    showSizeChanger: true
                }}
            />
        </div>
    );
}
