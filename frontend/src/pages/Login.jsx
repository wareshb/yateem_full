import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:4000/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'فشل تسجيل الدخول');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-subtle)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h1 style={{ margin: 0 }}>نظام رعاية الأيتام</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>تسجيل الدخول للمتابعة</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(255, 59, 48, 0.1)',
                        color: '#ff453a',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="input">
                        <label>البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                        />
                    </div>
                    <div className="input">
                        <label>كلمة المرور</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="admin123"
                            required
                        />
                    </div>
                    <button className="button" style={{ marginTop: 16 }}>تسجيل الدخول</button>
                </form>
            </div>
        </div>
    );
}
