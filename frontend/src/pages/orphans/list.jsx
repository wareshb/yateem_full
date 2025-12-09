import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Space, Input, Button, Tag, Avatar, Typography, Tooltip, Row, Col, Popconfirm, message, Popover, Checkbox, Divider, Modal, Form, DatePicker, Select, Radio } from 'antd';
import {
    UserOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ManOutlined,
    WomanOutlined,
    SearchOutlined,
    PlusOutlined,
    ExportOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    SettingOutlined,
    UserAddOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const API_URL = 'http://localhost:4000/api';

export default function OrphansList() {
    const [orphans, setOrphans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

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

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/orphans/${id}`);
            message.success('تم حذف اليتيم بنجاح');
            fetchOrphans();
        } catch (err) {
            message.error('فشل الحذف: ' + (err.response?.data?.message || err.message));
        }
    };

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

    const filteredOrphans = useMemo(() => {
        if (!searchText) return orphans;
        const lowerSearch = searchText.toLowerCase();
        return orphans.filter(orphan =>
            (orphan.full_name || '').toLowerCase().includes(lowerSearch) ||
            (orphan.orphan_id || orphan.uid || '').toString().toLowerCase().includes(lowerSearch) ||
            (orphan.residence_province || orphan.province || '').toLowerCase().includes(lowerSearch) ||
            (orphan.guardian_name || '').toLowerCase().includes(lowerSearch) ||
            (orphan.origin_district || '').toLowerCase().includes(lowerSearch)
        );
    }, [orphans, searchText]);

    const [visibleColumns, setVisibleColumns] = useState([
        'age', 'gender', 'guardian_name', 'residence_province', 'origin_district', 'status'
    ]);

    const columnOptions = [
        // Personal
        { label: 'العمر', value: 'age' },
        { label: 'الجنس', value: 'gender' },
        { label: 'الجنسية', value: 'nationality' },
        { label: 'رقم الهوية', value: 'id_number' },

        // Birth & Origin
        { label: 'محل الميلاد', value: 'birth_place' }, // Composite
        { label: 'دولة الأصل', value: 'origin_country' },
        { label: 'مديرية الأصل', value: 'origin_district' },

        // Residence
        { label: 'المحافظة', value: 'residence_province' },
        { label: 'المديرية', value: 'residence_district' },
        { label: 'الحي/الشارع', value: 'neighborhood_or_street' },
        { label: 'حالة السكن', value: 'residence_condition' },

        // Education
        { label: 'المدرسة', value: 'school_name' },
        { label: 'الصف', value: 'grade_level' },
        { label: 'التقدير', value: 'academic_rating' },

        // Health
        { label: 'الحالة الصحية', value: 'health_condition' },
        { label: 'نوع المرض', value: 'illness_type' },

        // Quran
        { label: 'أجزاء القرآن', value: 'quran_parts_memorized' },

        // Family
        { label: 'الأب', value: 'father_name' },
        { label: 'وفاة الأب', value: 'father_date_of_death' },
        { label: 'الأم', value: 'mother_name' },
        { label: 'والدة حاضنة؟', value: 'mother_is_custodian_flag' },
        { label: 'هاتف الأم', value: 'mother_phone' },
        { label: 'المعيل', value: 'guardian_name' },
        { label: 'هاتف المعيل', value: 'guardian_phone' },

        // Status
        { label: 'الحالة', value: 'status' }
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
            title: 'المعرف',
            dataIndex: 'orphan_id',
            key: 'orphan_id',
            width: 100,
            sorter: sorter('orphan_id'),
            render: (text, record) => <Text>{text || record.uid}</Text>,
            fixed: 'left'
        },
        {
            title: 'الاسم',
            dataIndex: 'full_name',
            key: 'full_name',
            width: 250,
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
            filters: [
                { text: 'ذكر', value: 'male' },
                { text: 'أنثى', value: 'female' },
            ],
            onFilter: (value, record) => record.gender === value,
            render: (gender) => (
                <Space>
                    {gender === 'male' ? <ManOutlined style={{ color: '#1890ff' }} /> : <WomanOutlined style={{ color: '#eb2f96' }} />}
                    <Text>{gender === 'male' ? 'ذكر' : 'أنثى'}</Text>
                </Space>
            )
        },
        {
            title: 'الجنسية',
            dataIndex: 'nationality',
            key: 'nationality',
            width: 100,
            sorter: sorter('nationality'),
            filters: getFilters(orphans, 'nationality'),
            onFilter: onFilter('nationality'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'رقم الهوية',
            dataIndex: 'id_number',
            key: 'id_number',
            width: 120,
            sorter: sorter('id_number'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'محل الميلاد',
            key: 'birth_place',
            width: 150,
            render: (_, r) => <Text>{[r.birth_province, r.birth_district].filter(Boolean).join(' - ') || '-'}</Text>
        },
        {
            title: 'دولة الأصل',
            dataIndex: 'origin_country',
            key: 'origin_country',
            width: 120,
            sorter: sorter('origin_country'),
            filters: getFilters(orphans, 'origin_country'),
            onFilter: onFilter('origin_country'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'مديرية الأصل',
            dataIndex: 'origin_district',
            key: 'origin_district',
            width: 120,
            sorter: sorter('origin_district'),
            filters: getFilters(orphans, 'origin_district'),
            onFilter: onFilter('origin_district'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'المحافظة',
            dataIndex: 'residence_province',
            key: 'residence_province',
            width: 120,
            sorter: sorter('residence_province'),
            filters: getFilters(orphans, 'residence_province'),
            onFilter: onFilter('residence_province'),
            render: (text, record) => <Text>{text || record.province || '-'}</Text>
        },
        {
            title: 'المديرية',
            dataIndex: 'residence_district',
            key: 'residence_district',
            width: 120,
            sorter: sorter('residence_district'),
            filters: getFilters(orphans, 'residence_district'),
            onFilter: onFilter('residence_district'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'الحي/الشارع',
            dataIndex: 'neighborhood_or_street',
            key: 'neighborhood_or_street',
            width: 150,
            sorter: sorter('neighborhood_or_street'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'حالة السكن',
            dataIndex: 'residence_condition',
            key: 'residence_condition',
            width: 120,
            sorter: sorter('residence_condition'),
            filters: getFilters(orphans, 'residence_condition'),
            onFilter: onFilter('residence_condition'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'المدرسة',
            dataIndex: 'school_name',
            key: 'school_name',
            width: 150,
            sorter: sorter('school_name'),
            filters: getFilters(orphans, 'school_name'),
            onFilter: onFilter('school_name'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'الصف',
            dataIndex: 'grade_level',
            key: 'grade_level',
            width: 100,
            sorter: sorter('grade_level'),
            filters: getFilters(orphans, 'grade_level'),
            onFilter: onFilter('grade_level'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'التقدير',
            dataIndex: 'academic_rating',
            key: 'academic_rating',
            width: 100,
            sorter: sorter('academic_rating'),
            filters: getFilters(orphans, 'academic_rating'),
            onFilter: onFilter('academic_rating'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'الحالة الصحية',
            dataIndex: 'health_condition',
            key: 'health_condition',
            width: 120,
            sorter: sorter('health_condition'),
            filters: getFilters(orphans, 'health_condition'),
            onFilter: onFilter('health_condition'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'نوع المرض',
            dataIndex: 'illness_type',
            key: 'illness_type',
            width: 120,
            sorter: sorter('illness_type'),
            filters: getFilters(orphans, 'illness_type'),
            onFilter: onFilter('illness_type'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'أجزاء القرآن',
            dataIndex: 'quran_parts_memorized',
            key: 'quran_parts_memorized',
            width: 100,
            sorter: (a, b) => (parseFloat(a.quran_parts_memorized) || 0) - (parseFloat(b.quran_parts_memorized) || 0),
            render: (text) => <Text>{text || 0}</Text>
        },
        {
            title: 'الأب',
            dataIndex: 'father_name',
            key: 'father_name',
            width: 150,
            sorter: sorter('father_name'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'تاريخ وفاة الأب',
            dataIndex: 'father_date_of_death',
            key: 'father_date_of_death',
            width: 120,
            sorter: sorter('father_date_of_death'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'الأم',
            dataIndex: 'mother_name',
            key: 'mother_name',
            width: 150,
            sorter: sorter('mother_name'),
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'والدة حاضنة؟',
            dataIndex: 'mother_is_custodian_flag',
            key: 'mother_is_custodian_flag',
            width: 120,
            filters: [{ text: 'نعم', value: 1 }, { text: 'لا', value: 0 }],
            onFilter: (value, record) => record.mother_is_custodian_flag === value,
            render: (val) => <Text>{val ? 'نعم' : 'لا'}</Text>
        },
        {
            title: 'هاتف الأم',
            dataIndex: 'mother_phone',
            key: 'mother_phone',
            width: 120,
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'المعيل',
            dataIndex: 'guardian_name',
            key: 'guardian_name',
            width: 150,
            sorter: sorter('guardian_name'),
            render: (text, record) => <Text>{text || record.mother_name || '-'}</Text>
        },
        {
            title: 'هاتف المعيل',
            dataIndex: 'guardian_phone',
            key: 'guardian_phone',
            width: 120,
            render: (text) => <Text>{text || '-'}</Text>
        },
        {
            title: 'الحالة',
            key: 'status',
            width: 120,
            filters: [
                { text: 'مكفول', value: 'sponsored' },
                { text: 'غير مكفول', value: 'unsponsored' },
            ],
            onFilter: (value, record) => {
                const isSponsored = !!record.sponsor_name;
                return value === 'sponsored' ? isSponsored : !isSponsored;
            },
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
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="إضافة أخ">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<UserAddOutlined style={{ color: '#52c41a' }} />}
                            onClick={() => handleAddSiblingClick(record)}
                        />
                    </Tooltip>
                    <Tooltip title="عرض التفاصيل">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => navigate(`/orphans/${record.id || record._id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="تعديل">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<EditOutlined style={{ color: '#faad14' }} />}
                            onClick={() => navigate(`/orphans/${record.id || record._id}/edit`)}
                        />
                    </Tooltip>
                    <Tooltip title="حذف">
                        <Popconfirm
                            title="هل أنت متأكد من حذف هذا السجل؟"
                            onConfirm={() => handleDelete(record.id || record._id)}
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
            if (col.key === 'orphan_id' || col.key === 'full_name' || col.key === 'actions') return true;
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

    const [siblingModalVisible, setSiblingModalVisible] = useState(false);
    const [selectedOrphanForSibling, setSelectedOrphanForSibling] = useState(null);
    const [isStudyingSibling, setIsStudyingSibling] = useState(true);
    const [isMemorizingSibling, setIsMemorizingSibling] = useState(true);
    const [siblingForm] = Form.useForm();

    const handleAddSiblingClick = (orphan) => {
        setSelectedOrphanForSibling(orphan);
        setSiblingModalVisible(true);
        setIsStudyingSibling(true);
        setIsMemorizingSibling(true);
        siblingForm.resetFields();
        siblingForm.setFieldsValue({
            is_studying: true,
            memorizes_quran: true
        });
    };

    const handleSiblingSubmit = async (values) => {
        try {
            // Fetch next ID
            const idRes = await axios.get(`${API_URL}/orphans/next-id`);
            const nextId = idRes.data.next_id;

            // Clone data from selected orphan
            const source = selectedOrphanForSibling;

            const payload = {
                // New Sibling Specifics
                full_name: values.full_name,
                date_of_birth: values.date_of_birth.format('YYYY-MM-DD'),
                gender: values.gender,

                // Inherited Identifiers
                orphan_id: nextId,
                residence_id: source.residence_id,
                father_id: source.father_id,
                mother_id: source.mother_id,
                guardian_id: source.guardian_id,
                mother_is_custodian: source.mother_is_custodian_flag,

                // Inherited details
                nationality: source.nationality,
                birth_country: source.birth_country,
                birth_province: source.birth_province,
                birth_district: source.birth_district,
                birth_neighborhood: source.birth_neighborhood,
                origin_country: source.origin_country,
                origin_province: source.origin_province,
                origin_district: source.origin_district,

                lives_with_siblings: true,
                male_siblings_count: (source.male_siblings_count || 0) + (values.gender === 'male' ? 1 : 0),
                female_siblings_count: (source.female_siblings_count || 0) + (values.gender === 'female' ? 1 : 0),

                // Form specifics
                is_studying: values.is_studying,
                grade_level: values.is_studying ? values.grade_level : null,
                school_name: values.is_studying ? values.school_name : null,
                not_studying_reason: values.is_studying ? null : values.not_studying_reason,

                memorizes_quran: values.memorizes_quran,
                quran_center_name: values.memorizes_quran ? values.quran_center_name : null,

                // Default health (can be edited later)
                health_condition: 'سليم'
            };

            await axios.post(`${API_URL}/orphans`, payload);
            message.success('تم إضافة الأخ بنجاح');
            setSiblingModalVisible(false);
            siblingForm.resetFields();
            fetchOrphans(); // Refresh list
        } catch (error) {
            console.error('Error adding sibling:', error);
            message.error('حدث خطأ أثناء إضافة الأخ');
        }
    };

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
            {/* ... toolbar ... */}

            {/* Modal for adding sibling */}
            <Modal
                title={`إضافة أخ لـ ${selectedOrphanForSibling?.full_name}`}
                open={siblingModalVisible}
                onCancel={() => setSiblingModalVisible(false)}
                footer={null}
            >
                <Form layout="vertical" form={siblingForm} onFinish={handleSiblingSubmit}>
                    <Form.Item name="full_name" label="الاسم الرباعي" rules={[{ required: true }]}>
                        <Input placeholder="الاسم الكامل" />
                    </Form.Item>
                    <Form.Item name="date_of_birth" label="تاريخ الميلاد" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="gender" label="الجنس" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="male">ذكر</Select.Option>
                            <Select.Option value="female">أنثى</Select.Option>
                        </Select>
                    </Form.Item>

                    <Divider>التعليم</Divider>
                    <Form.Item name="is_studying" label="هل يدرس؟">
                        <Radio.Group onChange={(e) => setIsStudyingSibling(e.target.value)}>
                            <Radio value={true}>نعم</Radio>
                            <Radio value={false}>لا (صغير سن/منقطع)</Radio>
                        </Radio.Group>
                    </Form.Item>

                    {isStudyingSibling ? (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="grade_level" label="الصف الدراسي">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="school_name" label="المدرسة">
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                    ) : (
                        <Form.Item name="not_studying_reason" label="سبب عدم الدراسة">
                            <Select allowClear>
                                <Select.Option value="under_age">سن الطفولة (لم يدرس بعد)</Select.Option>
                                <Select.Option value="dropout">منقطع عن الدراسة</Select.Option>
                                <Select.Option value="work">تفرغ للعمل</Select.Option>
                                <Select.Option value="other">أخرى</Select.Option>
                            </Select>
                        </Form.Item>
                    )}

                    <Divider>القرآن الكريم</Divider>
                    <Form.Item name="memorizes_quran" label="هل يحفظ القرآن؟">
                        <Radio.Group onChange={(e) => setIsMemorizingSibling(e.target.value)}>
                            <Radio value={true}>نعم</Radio>
                            <Radio value={false}>لا</Radio>
                        </Radio.Group>
                    </Form.Item>

                    {isMemorizingSibling && (
                        <Form.Item name="quran_center_name" label="اسم المركز/المسجد">
                            <Input />
                        </Form.Item>
                    )}

                    <Button type="primary" htmlType="submit" block>
                        إضافة
                    </Button>
                </Form>
            </Modal>

            <div style={{ marginBottom: 16 }}>

                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Space>
                            <Input
                                placeholder="البحث في الأيتام أو المعيلين..."
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
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/orphans/create')}>
                            إضافة يتيم
                        </Button>
                    </Col>
                </Row>
            </div>

            <Table
                columns={columns}
                dataSource={filteredOrphans}
                rowKey={(record) => record.id || record._id || record.uid}
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showTotal: (total, range) => `${range[0]}-${range[1]} من ${total} يتيم`,
                    showSizeChanger: true
                }}
            />
        </div>
    );
}
