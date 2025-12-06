export const mockOrphans = [
  {
    id: 1,
    name: 'أحمد علي',
    age: 9,
    status: 'فاقد الأب',
    location: 'صنعاء - حدة',
    education: 'تعليم أساسي',
    health: 'جيد',
    guardian: 'العم - صالح',
    sponsor: 'مؤسسة الرحمة',
  },
  {
    id: 2,
    name: 'سارة محمد',
    age: 13,
    status: 'فاقد الوالدين',
    location: 'عدن - المعلا',
    education: 'تعليم ثانوي',
    health: 'يعاني من ربو',
    guardian: 'الخال - محمد',
    sponsor: 'UNICEF',
  },
  {
    id: 3,
    name: 'علي حسن',
    age: 7,
    status: 'فاقد الأب',
    location: 'تعز - القاهرة',
    education: 'أمي',
    health: 'إعاقة حركية بسيطة',
    guardian: 'الجد - أحمد',
    sponsor: 'د. رامي',
  },
];

export const mockGuardians = [
  { id: 1, name: 'صالح علي', phone: '777123123', job: 'مدرس', income: 0, children: 3, rating: 'ممتاز' },
  { id: 2, name: 'محمد أحمد', phone: '733555222', job: 'تاجر', income: 150, children: 2, rating: 'جيد' },
];

export const mockSponsors = [
  { id: 1, name: 'مؤسسة الرحمة', type: 'جمعية', active: 25, contact: 'info@rahma.org' },
  { id: 2, name: 'UNICEF', type: 'منظمة دولية', active: 120, contact: 'unicef@example.org' },
  { id: 3, name: 'د. رامي', type: 'فرد', active: 3, contact: 'rami@gmail.com' },
];

export const mockSponsorships = [
  {
    id: 1,
    orphan: 'أحمد علي',
    sponsor: 'مؤسسة الرحمة',
    type: 'مالية',
    amount: 120,
    status: 'active',
    next: '2025-01-05',
  },
  {
    id: 2,
    orphan: 'سارة محمد',
    sponsor: 'UNICEF',
    type: 'تعليمية',
    amount: 250,
    status: 'active',
    next: '2024-12-28',
  },
  {
    id: 3,
    orphan: 'علي حسن',
    sponsor: 'د. رامي',
    type: 'غذائية',
    amount: 80,
    status: 'paused',
    next: '2024-12-20',
  },
];

export const mockVisits = [
  { id: 1, orphan: 'أحمد علي', date: '2024-11-12', score: 8, note: 'الوضع المعيشي جيد والطفل منتظم في المدرسة.' },
  { id: 2, orphan: 'سارة محمد', date: '2024-12-01', score: 6, note: 'تحتاج إلى متابعة صحية بسبب الربو.' },
];

export const mockDocuments = [
  { id: 1, label: 'شهادة ميلاد', owner: 'أحمد علي', category: 'شخصي', added: '2024-10-01' },
  { id: 2, label: 'عقد كفالة', owner: 'سارة محمد', category: 'مالي', added: '2024-09-12' },
];

export const mockUsers = [
  { id: 1, name: 'مدير النظام', role: 'admin', email: 'admin@example.com' },
  { id: 2, name: 'أسماء - باحثة', role: 'social_worker', email: 'asmaa@ngo.org' },
  { id: 3, name: 'مريم - مدخلة', role: 'data_entry', email: 'mariam@ngo.org' },
];

export const mockStats = {
  orphans: 3,
  sponsors: 3,
  activeSponsorships: 2,
  visitsMonth: 5,
  totalOrphans: 3,
  sponsored: 3,
  critical: 1,
  expiring: 1,
  byStatus: [
    { label: 'فاقد الأب', value: 2 },
    { label: 'فاقد الأم', value: 0 },
    { label: 'فاقد الوالدين', value: 1 },
  ],
};