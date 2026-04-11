import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const { token } = useParams(); // Ловим токен из ссылки
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('password-reset/confirm/', { token, new_password: password });
      alert('Пароль успешно изменен! Теперь вы можете войти.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Ссылка устарела или недействительна.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div className="card shadow-sm border-0 p-4 p-md-5" style={{ width: '100%', maxWidth: '400px', borderRadius: '20px' }}>
        <h3 className="text-center brand-font text-primary-elf mb-4 fw-bold">Новый пароль 🔐</h3>
        {error && <div className="alert alert-danger py-2 text-center small rounded-3">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input 
            type="password" className="form-control form-control-lg bg-light border-0 rounded-pill fs-6 mb-4" 
            placeholder="Минимум 8 символов" minLength="8" value={password} onChange={e => setPassword(e.target.value)} required
          />
          <button type="submit" className="btn btn-success btn-lg w-100 rounded-pill fw-bold shadow-sm">
            Сохранить пароль
          </button>
        </form>
      </div>
    </div>
  );
}