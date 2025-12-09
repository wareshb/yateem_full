import DateInput from './DateInput';

// Form Section Component
export function Section({ title, children, action }) {
    return (
        <div style={{ gridColumn: '1/-1', marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '12px 0', borderBottom: '2px solid var(--accent)' }}>
                <h4 style={{ margin: 0, color: 'var(--accent)' }}>{title}</h4>
                {action}
            </div>
            <div className="form-grid">
                {children}
            </div>
        </div>
    );
}

// Input Component
export function Input({ label, ...props }) {
    return (
        <div className="input">
            <label>{label}</label>
            <input {...props} />
        </div>
    );
}

// Select Component
export function Select({ label, children, ...props }) {
    return (
        <div className="input">
            <label>{label}</label>
            <select {...props}>{children}</select>
        </div>
    );
}

// Checkbox Component
export function Checkbox({ label, ...props }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, gridColumn: '1/-1', cursor: 'pointer' }}>
            <input type="checkbox" {...props} />
            <span>{label}</span>
        </label>
    );
}

// Textarea Component
export function Textarea({ label, ...props }) {
    return (
        <div className="input" style={{ gridColumn: '1/-1' }}>
            <label>{label}</label>
            <textarea rows={3} {...props} />
        </div>
    );
}

export { DateInput };
