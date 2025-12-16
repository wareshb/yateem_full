import { useRef } from 'react';
import { formatDateInput, isValidDate } from '../utils/dateUtils';

/**
 * مكون إدخال التاريخ مع Date Picker
 * يعرض DD/MM/YYYY كـ placeholder
 * يتيح الكتابة اليدوية والاختيار من التقويم عبر الأيقونة
 */
export default function DateInput({ label, value, onChange, required, ...props }) {
    const dateInputRef = useRef(null);

    // تحويل من dd/mm/yyyy إلى yyyy-mm-dd للعرض في input type="date"
    const convertToDateInputValue = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return '';
    };

    // تحويل من yyyy-mm-dd إلى dd/mm/yyyy للحفظ في الحالة
    const convertFromDateInputValue = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
        }
        return '';
    };

    const handleDateChange = (e) => {
        const inputValue = e.target.value; // yyyy-mm-dd
        const formattedValue = convertFromDateInputValue(inputValue); // dd/mm/yyyy

        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                value: formattedValue
            }
        };

        onChange(syntheticEvent);
    };

    const handleTextChange = (e) => {
        const inputValue = e.target.value;
        const formattedValue = formatDateInput(inputValue);

        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                value: formattedValue
            }
        };

        onChange(syntheticEvent);
    };

    const handleTextBlur = (e) => {
        const inputValue = e.target.value;
        if (inputValue && !isValidDate(inputValue)) {
            alert('صيغة التاريخ غير صحيحة. يرجى استخدام DD/MM/YYYY');
        }
    };

    const openPicker = () => {
        if (dateInputRef.current) {
            try {
                dateInputRef.current.showPicker();
            } catch (error) {
                console.log('showPicker not supported', error);
                // Fallback attempt
                dateInputRef.current.click();
            }
        }
    };

    return (
        <div className="input">
            <label>
                {label}
                {required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <div style={{ position: 'relative' }}>
                {/* أيقونة التقويم - قابلة للنقر لفتح التقويم */}
                <div
                    onClick={openPicker}
                    style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        zIndex: 2, // أعلى من النص لضمان استجابة النقر
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px' // مساحة للنقر
                    }}
                    title="اختر التاريخ من التقويم"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: '#666' }}
                    >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>

                {/* حقل عرض النص - قابل للكتابة */}
                <input
                    type="text"
                    value={value || ''}
                    onChange={handleTextChange}
                    onBlur={handleTextBlur}
                    placeholder="DD/MM/YYYY"
                    maxLength="10"
                    required={required}
                    style={{
                        width: '100%',
                        paddingLeft: '40px'
                    }}
                    {...props}
                />

                {/* حقل التاريخ المخفي */}
                <input
                    ref={dateInputRef}
                    type="date"
                    value={convertToDateInputValue(value) || ''}
                    onChange={handleDateChange}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '0',
                        height: '0',
                        opacity: 0,
                        pointerEvents: 'none',
                        zIndex: -1,
                        border: 0,
                        padding: 0,
                        margin: 0
                    }}
                    tabIndex={-1}
                    aria-hidden="true"
                />
            </div>
        </div>
    );
}
