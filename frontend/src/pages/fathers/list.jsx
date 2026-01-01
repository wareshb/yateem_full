import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Space, Input, Button, Tag, Avatar, Typography, Tooltip, Row, Col, Popconfirm, message, Popover, Checkbox } from 'antd';
import {
    UserOutlined,
    SearchOutlined,
    PlusOutlined,
    ExportOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    SettingOutlined,
    ManOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const API_URL = 'http://localhost:4000/api';

export default function FathersList() {
    const [fathers, setFathers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchFathers();
    }, []);

    const fetchFathers = async () => {
        try {
            const res = await axios.get(`${API_URL}/fathers`);
            setFathers(res.data);
        } catch (err) {
            console.error('خطأ في تحميل الآباء:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            // Note: Deleting a father might be restricted if they have orphans linked.
            // Backend logic should handle cascade or restriction.
            await axios.delete(`${API_URL}/fathers/${id}`);
            message.success('تم حذف سجل الأب بنجاح');
            fetchFathers();
        } catch (err) {
            message.error('فشل الحذف: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredFathers = useMemo(() => {
        if (!searchText) return fathers;
        const lowerSearch = searchText.toLowerCase();
        return fathers.filter(father =>
            (father.full_name || '').toLowerCase().includes(lowerSearch) ||
            (father.occupation_before_death || '').toLowerCase().includes(lowerSearch)
        );
    }, [fathers, searchText]);

    const [visibleColumns, setVisibleColumns] = useState([
        'date_of_death', 'cause_of_death', 'orphans_count', 'occupation_before_death'
    ]);

    const columnOptions = [
        { label: 'تاريخ الوفاة', value: 'date_of_death' },
        { label: 'سبب الوفاة', value: 'cause_of_death' },
        { label: 'المهنة قبل الوفاة', value: 'occupation_before_death' },
        { label: 'نوع شهادة الوفاة', value: 'death_certificate_type' },
        { label: 'رقم شهادة الوفاة', value: 'death_certificate_number' },
        { label: 'تاريخ الميلاد', value: 'date_of_birth' },
        { label: 'عدد الأيتام', value: 'orphans_count' }
    ];

    // Helper for sorting
    const sorter = (key) => (a, b) => (a[key] || '').toString().localeCompare((b[key] || '').toString());

    const baseColumns = [
        {
            title: 'الاسم',
            dataIndex: 'full_name',
            key: 'full_name',
            width: 250,
            sorter: sorter('full_name'),
            render: (text) => (
                <Space>
                    <Avatar style={{ backgroundColor: '#1890ff' }} icon={<ManOutlined />}>
                        {text ? text.charAt(0) : 'F'}
                    </Avatar>
                    <Text strong>{text}</Text>
                </Space>
            ),
            fixed: 'left'
        },
        {
            title: 'تاريخ الوفاة',
            dataIndex: 'date_of_death',
            key: 'date_of_death',
            width: 120,
            sorter: sorter('date_of_death'),
            render: (text) => <Text>{text ? dayjs(text).format('DD/MM/YYYY') : '-'}</Text>
        },
        {
            title: 'سبب الوفاة',
            dataIndex: 'cause_of_death',
            key: 'cause_of_death',
            width: 150,
            sorter: sorter('cause_of_death'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'المهنة قبل الوفاة',
            dataIndex: 'occupation_before_death',
            key: 'occupation_before_death',
            width: 150,
            sorter: sorter('occupation_before_death'),
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
            title: 'تاريخ الميلاد',
            dataIndex: 'date_of_birth',
            key: 'date_of_birth',
            width: 120,
            sorter: sorter('date_of_birth'),
            render: (text) => <Text>{text ? dayjs(text).format('DD/MM/YYYY') : '-'}</Text>
        },
        {
            title: 'نوع شهادة الوفاة',
            dataIndex: 'death_certificate_type',
            key: 'death_certificate_type',
            width: 150,
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'رقم شهادة الوفاة',
            dataIndex: 'death_certificate_number',
            key: 'death_certificate_number',
            width: 150,
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
                            onClick={() => navigate(`/fathers/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="تعديل">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<EditOutlined style={{ color: '#faad14' }} />}
                            onClick={() => navigate(`/fathers/${record.id}/edit`)}
                        />
                    </Tooltip>
                    <Tooltip title="حذف">
                        <Popconfirm
                            title="هل أنت متأكد من حذف هذا السجل؟"
                            description="سيؤدي هذا إلى إلغاء ربط الأيتام بهذا الأب."
                            onConfirm={() => handleDelete(record.id)}
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
            if (col.key === 'full_name' || col.key === 'actions') return true;
            return visibleColumns.includes(col.key);
        });
    }, [visibleColumns, fathers]);

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
                                placeholder="البحث في الآباء..."
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
                    {/* Note: Typically fathers are added via Orphan creation, but if standalone add is needed: */}
                    {/* <Col>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/fathers/create')}>
                            إضافة أب
                        </Button>
                    </Col> */}
                </Row>
            </div>

            <Table
                columns={columns}
                dataSource={filteredFathers}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
                pagination={{
                    pageSize: 10,
                    showTotal: (total, range) => `${range[0]}-${range[1]} من ${total} أب`,
                    showSizeChanger: true
                }}
            />
        </div>
    );
}
