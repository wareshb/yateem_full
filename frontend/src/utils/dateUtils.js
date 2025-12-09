/**
 * تحويل التاريخ من yyyy-mm-dd إلى dd/mm/yyyy للعرض
 * @param {string} dateString - التاريخ بصيغة yyyy-mm-dd
 * @returns {string} التاريخ بصيغة dd/mm/yyyy
 */
export function formatDateForDisplay(dateString) {
    if (!dateString) return '';

    // إذا كان التاريخ بصيغة dd/mm/yyyy بالفعل، أرجعه كما هو
    if (dateString.includes('/') && dateString.indexOf('/') === 2) {
        return dateString;
    }

    // التعامل مع ISO Timestamp
    let cleanDate = dateString;
    if (dateString.includes('T')) {
        cleanDate = dateString.split('T')[0];
    }

    const [year, month, day] = cleanDate.split('-');
    if (!year || !month || !day) return dateString;

    return `${day}/${month}/${year}`;
}

/**
 * تحويل التاريخ من dd/mm/yyyy إلى yyyy-mm-dd للإرسال للخادم
 * @param {string} dateString - التاريخ بصيغة dd/mm/yyyy
 * @returns {string} التاريخ بصيغة yyyy-mm-dd
 */
export function formatDateForServer(dateString) {
    if (!dateString) return '';

    // إذا كان التاريخ بصيغة yyyy-mm-dd بالفعل، أرجعه كما هو
    if (dateString.includes('-') && dateString.indexOf('-') === 4) {
        return dateString;
    }

    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return dateString;

    // تأكد من أن اليوم والشهر رقمين
    const paddedDay = day.padStart(2, '0');
    const paddedMonth = month.padStart(2, '0');

    return `${year}-${paddedMonth}-${paddedDay}`;
}

/**
 * التحقق من صحة صيغة التاريخ dd/mm/yyyy
 * @param {string} dateString - التاريخ للتحقق منه
 * @returns {boolean} true إذا كان التاريخ صحيحاً
 */
export function isValidDate(dateString) {
    if (!dateString) return true; // السماح بالقيم الفارغة

    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);

    if (!match) return false;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // التحقق من النطاقات الأساسية
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;

    // التحقق من عدد الأيام في الشهر
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) return false;

    return true;
}

/**
 * تنسيق إدخال التاريخ أثناء الكتابة
 * @param {string} value - القيمة المدخلة
 * @returns {string} القيمة المنسقة
 */
export function formatDateInput(value) {
    // إزالة أي شيء ليس رقماً أو /
    let cleaned = value.replace(/[^\d/]/g, '');

    // إزالة الشرطات المائلة الزائدة
    const parts = cleaned.split('/');
    if (parts.length > 3) {
        cleaned = parts.slice(0, 3).join('/');
    }

    // إضافة الشرطات المائلة تلقائياً
    if (cleaned.length === 2 && !cleaned.includes('/')) {
        cleaned = cleaned + '/';
    } else if (cleaned.length === 5 && cleaned.split('/').length === 2) {
        cleaned = cleaned + '/';
    }

    // تحديد الطول الأقصى
    if (cleaned.length > 10) {
        cleaned = cleaned.substring(0, 10);
    }

    return cleaned;
}
