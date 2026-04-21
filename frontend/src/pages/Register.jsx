import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; 

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMode, setSuccessMode] = useState(false); // Флаг для переключения экрана
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Отправляем данные на регистрацию
      await api.post('register/', formData);
      setSuccessMode(true); // Включаем экран "Проверьте почту"
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации. Возможно, этот Email уже занят.');
    } finally {
      setLoading(false);
    }
  };

  // ЭКРАН 2: ПОСЛЕ УСПЕШНОЙ ОТПРАВКИ
  if (successMode) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
        <div className="card shadow-sm border-0 p-5 text-center" style={{ width: '100%', maxWidth: '450px', borderRadius: '20px' }}>
          <h1 className="display-1 mb-3">💌</h1>
          <h3 className="brand-font text-primary-elf fw-bold">Остался один шаг!</h3>
          <p className="text-muted mt-2">
            Мы отправили магическую ссылку на <b>{formData.email}</b>.<br/>Перейди по ней, чтобы активировать аккаунт. <br/>Проверьте спам!
          </p>
          <Link to="/login" className="btn btn-outline-elf rounded-pill px-5 mt-4">Вернуться ко входу</Link>
        </div>
      </div>
    );
  }

  // ЭКРАН 1: ФОРМА РЕГИСТРАЦИИ
  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div className="card shadow-sm border-0 p-4 p-md-5" style={{ width: '100%', maxWidth: '450px', borderRadius: '20px' }}>
        
        <h2 className="text-center brand-font text-primary-elf mb-3 fw-bold">✨ Регистрация</h2>
        <p className="text-center text-muted mb-4 small">Создай аккаунт и получай кэшбек с каждого заказа!</p>

        {error && <div className="alert alert-danger py-2 text-center small rounded-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Как к вам обращаться?</label>
            <input 
              type="text" name="full_name" className="form-control form-control-lg bg-light border-0 rounded-pill fs-6" 
              placeholder="Имя и Фамилия" onChange={handleChange} required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Email (для входа) *</label>
            <input 
              type="email" name="email" className="form-control form-control-lg bg-light border-0 rounded-pill fs-6" 
              placeholder="hello@elfiya.kg" onChange={handleChange} required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Номер телефона (для связи)</label>
            <input 
              type="tel" name="phone_number" className="form-control form-control-lg bg-light border-0 rounded-pill fs-6" 
              placeholder="0555123456" onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-muted small fw-bold">Придумайте пароль</label>
            <input 
              type="password" name="password" className="form-control form-control-lg bg-light border-0 rounded-pill fs-6" 
              placeholder="Минимум 8 символов" minLength="8" onChange={handleChange} required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-elf btn-lg w-100 mb-3 rounded-pill fw-bold">
            {loading ? "Отправляем..." : "Создать аккаунт"}
          </button>
          
          <div className="text-center mt-2 border-top pt-3">
            <span className="text-muted small">Уже есть аккаунт? </span>
            <Link to="/login" className="text-primary-elf text-decoration-none fw-bold">Войти</Link>
          </div>
        </form>

      </div>
    </div>
  );
}