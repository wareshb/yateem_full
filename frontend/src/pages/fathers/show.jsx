import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Descriptions,
    Card,
    Button,
    Table,
    Space,
    Typography,
    Popover,
    Checkbox,
    Spin,
    Divider,
    Avatar,
    Tag,
    Tooltip
} from 'antd';
import {
    EditOutlined,
    ArrowRightOutlined,
    UserOutlined,
    ManOutlined,
    WomanOutlined,
    SettingOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const API_URL = 'http://localhost:4000/api';

export default function FathersShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [father, setFather] = useState(null);
    const [loading, setLoading] = useState(true);

    // Orphans Table State
    const [visibleColumns, setVisibleColumns] = useState([
        'age', 'gender', 'school_name', 'grade_level', 'status'
    ]);

    useEffect(() => {
        fetchFather();
    }, [id]);

    const fetchFather = async () => {
        try {
            const res = await axios.get(`${API_URL}/fathers/${id}`);
            // Ensure orphans array exists even if backend returns undefined
            setFather({ ...res.data, orphans: res.data.orphans || [] });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Helper Functions for Orphans Table ---
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 0;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const sorter = (key) => (a, b) => (a[key] || '').toString().localeCompare((b[key] || '').toString());

    // --- Column Definitions ---
    const columnOptions = [
        { label: 'العمر', value: 'age' },
        { label: 'الجنس', value: 'gender' },
        { label: 'المدرسة', value: 'school_name' },
        { label: 'الصف', value: 'grade_level' },
        { label: 'التقدير', value: 'academic_rating' },
        { label: 'الحالة الصحية', value: 'health_condition' },
        { label: 'أجزاء القرآن', value: 'quran_parts_memorized' },
        { label: 'الحالة', value: 'status' }
    ];

    const baseColumns = [
        {
            title: 'الاسم',
            dataIndex: 'full_name',
            key: 'full_name',
            width: 200,
            sorter: sorter('full_name'),
            render: (text) => (
                <Space>
                    <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />}>
                        {text ? text.charAt(0) : 'U'}
                    </Avatar>
                    <Text strong>{text}</Text>
                </Space>
            ),
            fixed: 'left'
        },
        {
            title: 'العمر',
            key: 'age',
            width: 80,
            sorter: (a, b) => calculateAge(a.date_of_birth) - calculateAge(b.date_of_birth),
            render: (_, record) => <Text>{calculateAge(record.date_of_birth)}</Text>
        },
        {
            title: 'الجنس',
            dataIndex: 'gender',
            key: 'gender',
            width: 80,
            render: (gender) => (
                <Space>
                    {gender === 'male' ? <ManOutlined style={{ color: '#1890ff' }} /> : <WomanOutlined style={{ color: '#eb2f96' }} />}
                    <Text>{gender === 'male' ? 'ذكر' : 'أنثى'}</Text>
                </Space>
            )
        },
        {
            title: 'المدرسة',
            dataIndex: 'school_name',
            key: 'school_name',
            width: 150,
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'الصف',
            dataIndex: 'grade_level',
            key: 'grade_level',
            width: 100,
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'التقدير',
            dataIndex: 'academic_rating',
            key: 'academic_rating',
            width: 100,
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'الحالة الصحية',
            dataIndex: 'health_condition',
            key: 'health_condition',
            width: 120,
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'أجزاء القرآن',
            dataIndex: 'quran_parts_memorized',
            key: 'quran_parts_memorized',
            width: 100,
            render: (text) => <Text>{text || 0}</Text>
        },
        {
            title: 'الحالة',
            key: 'status',
            width: 120,
            render: (_, record) => {
                const isSponsored = !!record.sponsor_name;
                return (
                    <Tag icon={isSponsored ? <CheckCircleOutlined /> : <ClockCircleOutlined />} color={isSponsored ? 'success' : 'warning'}>
                        {isSponsored ? 'مكفول' : 'غير مكفول'}
                    </Tag>
                );
            }
        },
        {
            title: 'الإجراءات',
            key: 'actions',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Tooltip title="عرض التفاصيل">
                    <Button
                        type="text"
                        shape="circle"
                        icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                        onClick={() => navigate(`/orphans/${record.id || record._id}`)}
                    />
                </Tooltip>
            )
        }
    ];

    const columns = useMemo(() => {
        return baseColumns.filter(col => {
            if (col.key === 'full_name' || col.key === 'actions') return true;
            return visibleColumns.includes(col.key);
        });
    }, [visibleColumns]);

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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="جاري التحميل..." />
            </div>
        );
    }

    if (!father) return null;

    return (
        <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                        {father.full_name}
                    </Title>
                    <Space style={{ marginTop: 8 }}>
                        <Tag color="cyan">أب متوفي</Tag>
                    </Space>
                </div>
                <Space>
                    <Button
                        icon={<ArrowRightOutlined />}
                        onClick={() => navigate('/fathers')}
                    >
                        عودة للقائمة
                    </Button>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/fathers/${id}/edit`)}
                    >
                        تعديل البيانات
                    </Button>
                </Space>
            </div>

            {/* Father Details */}
            <Card style={{ marginBottom: 24 }} bordered={false}>
                <Descriptions title="البيانات الشخصية والوفاة" bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="الاسم الرباعي">{father.full_name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="تاريخ الميلاد">{father.date_of_birth ? dayjs(father.date_of_birth).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
                    <Descriptions.Item label="تاريخ الوفاة">{father.date_of_death ? dayjs(father.date_of_death).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
                    <Descriptions.Item label="سبب الوفاة">{father.cause_of_death || '-'}</Descriptions.Item>
                    <Descriptions.Item label="نوع شهادة الوفاة">{father.death_certificate_type || '-'}</Descriptions.Item>
                    <Descriptions.Item label="رقم شهادة الوفاة">{father.death_certificate_number || '-'}</Descriptions.Item>
                    <Descriptions.Item label="المهنة قبل الوفاة">{father.occupation_before_death || '-'}</Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Orphans List */}
            <Card
                title={
                    <Space>
                        <UserOutlined />
                        <span style={{ marginRight: 8 }}>الأيتام التابعين لهذا الأب ({father.orphans.length})</span>
                    </Space>
                }
                extra={
                    <Popover
                        content={columnSelectorContent}
                        title={null}
                        trigger="click"
                        placement="bottomRight"
                    >
                        <Button icon={<SettingOutlined />}>الأعمدة</Button>
                    </Popover>
                }
                bordered={false}
            >
                <Table
                    columns={columns}
                    dataSource={father.orphans}
                    rowKey={(record) => record.id || record._id || record.orphan_id}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </div>
    );
}
