import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Activate() {
  const { token } = useParams(); // Ловим токен прямо из URL
  const [status, setStatus] = useState('loading'); // 3 состояния: loading, success, error
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    api.get(`activate/${token}/`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div className="card shadow-sm border-0 p-4 p-md-5 text-center" style={{ width: '100%', maxWidth: '450px', borderRadius: '20px' }}>
        
        {/* СОСТОЯНИЕ 1: ЗАГРУЗКА */}
        {status === 'loading' && (
          <div className="py-4">
            <div className="spinner-border text-primary-elf mb-4" style={{ width: '3rem', height: '3rem' }}></div>
            <h3 className="brand-font fw-bold">Проверяем ссылку...</h3>
            <p className="text-muted small">Немного магии, подождите пару секунд ✨</p>
          </div>
        )}

        {/* СОСТОЯНИЕ 2: УСПЕХ */}
        {status === 'success' && (
          <div className="animate__animated animate__fadeIn">
            <h1 className="display-1 mb-3">🎉</h1>
            <h3 className="brand-font text-success fw-bold">Аккаунт активирован!</h3>
            <p className="text-muted mt-3 mb-4">
              Добро пожаловать в систему. Теперь ты можешь войти в свой кабинет и делать заказы.
            </p>
            <Link to="/login" className="btn btn-elf btn-lg w-100 rounded-pill fw-bold shadow-sm">
              Войти в аккаунт
            </Link>
          </div>
        )}

        {/* СОСТОЯНИЕ 3: ОШИБКА */}
        {status === 'error' && (
          <div className="animate__animated animate__fadeIn">
            <h1 className="display-1 mb-3">❌</h1>
            <h3 className="brand-font text-danger fw-bold">Упс, ссылка сломалась</h3>
            <p className="text-muted mt-3 mb-4">
              Возможно, она устарела, скопирована не полностью или твой аккаунт уже был активирован ранее.
            </p>
            <Link to="/login" className="btn btn-outline-danger btn-lg w-100 rounded-pill fw-bold mb-2">
              Попробовать войти
            </Link>
            <Link to="/register" className="btn btn-link text-muted w-100 text-decoration-none small">
              Зарегистрироваться заново
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}