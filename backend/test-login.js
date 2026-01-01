import fetch from 'node-fetch';

async function testLogin() {
    try {
        const response = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Body:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();
