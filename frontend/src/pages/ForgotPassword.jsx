import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('password-reset/', { email });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      // Даже при ошибке лучше показать успех, чтобы хакеры не могли перебирать email-ы
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container text-center" style={{ marginTop: '100px', minHeight: '60vh' }}>
        <h1 className="display-1 mb-3">📬</h1>
        <h3 className="brand-font text-primary-elf fw-bold">Письмо отправлено!</h3>
        <p className="text-muted mt-2">Если Email <b>{email}</b> есть в базе, мы отправили туда ссылку для сброса пароля.</p>
        <Link to="/login" className="btn btn-elf rounded-pill px-5 mt-4">Вернуться ко входу</Link>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div className="card shadow-sm border-0 p-4 p-md-5" style={{ width: '100%', maxWidth: '400px', borderRadius: '20px' }}>
        <h3 className="text-center brand-font text-primary-elf mb-3 fw-bold">Сброс пароля</h3>
        <p className="text-center text-muted mb-4 small">Введи свой Email, и мы пришлем магическую ссылку для создания нового пароля.</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" className="form-control form-control-lg bg-light border-0 rounded-pill fs-6 mb-4" 
            placeholder="Твой Email" value={email} onChange={e => setEmail(e.target.value)} required
          />
          <button type="submit" disabled={loading} className="btn btn-elf btn-lg w-100 mb-3 rounded-pill fw-bold">
            {loading ? "Отправка..." : "Получить ссылку"}
          </button>
        </form>
      </div>
    </div>
  );
}