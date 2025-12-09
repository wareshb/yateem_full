import { formatDateForDisplay, formatDateForServer, formatDateInput, isValidDate } from '../utils/dateUtils';

/**
 * مكون إدخال التاريخ بصيغة dd/mm/yyyy
 */
export default function DateInput({ label, value, onChange, required, ...props }) {
    const handleChange = (e) => {
        const inputValue = e.target.value;
        const formattedValue = formatDateInput(inputValue);

        // إنشاء حدث مخصص مع القيمة المنسقة
        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                value: formattedValue
            }
        };

        onChange(syntheticEvent);
    };

    const handleBlur = (e) => {
        const inputValue = e.target.value;

        // التحقق من صحة التاريخ عند فقدان التركيز
        if (inputValue && !isValidDate(inputValue)) {
            alert('صيغة التاريخ غير صحيحة. يرجى استخدام dd/mm/yyyy');
        }
    };

    return (
        <div className="input">
            <label>
                {label}
                {required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <input
                type="text"
                value={value || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="dd/mm/yyyy"
                maxLength="10"
                required={required}
                {...props}
            />
        </div>
    );
}
