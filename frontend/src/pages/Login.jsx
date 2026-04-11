import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('login/', { email, password });
      // Сохраняем токен
      localStorage.setItem('token', response.data.token || response.data.access); // access на случай если у тебя JWT
      
      // Перекидываем в кабинет и перезагружаем страницу, чтобы шапка обновилась
      navigate('/profile');
      window.location.reload();
      
    } catch (err) {
      // Бэкенд теперь отдает понятные ошибки: "Неверный пароль" или "Аккаунт не активирован"
      setError(err.response?.data?.error || "Ошибка при входе в систему.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card border-0 shadow-lg p-4 p-md-5 rounded-4" style={{ maxWidth: '400px', width: '100%' }}>
        
        <h2 className="brand-font text-primary-elf fw-bold text-center mb-4">✨ Вход</h2>
        
        {/* Вывод ошибки */}
        {error && (
          <div className="alert alert-danger py-2 small text-center rounded-3">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label text-muted fw-bold small">Email</label>
            <input 
              type="email" 
              className="form-control rounded-pill px-4 py-2" 
              placeholder="hello@elfiya.kg"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="mb-4">
            <div className="d-flex justify-content-between">
              <label className="form-label text-muted fw-bold small">Пароль</label>
            </div>
            <input 
              type="password" 
              className="form-control rounded-pill px-4 py-2" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-elf w-100 rounded-pill py-2 fw-bold shadow-sm"
          >
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <span className="text-muted small me-1">Нет аккаунта?</span>
          <Link to="/register" className="text-decoration-none fw-bold text-primary-elf">Создать аккаунт</Link>
          <br></br>
          <Link to="/forgot-password" className="text-decoration-none small text-primary-elf">Забыли пароль?</Link>
        </div>
      </div>
    </div>
  );
}