import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Support() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [loading, setLoading] = useState(true);

  // Проверяем наличие токена
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    // Если токена нет, просто выключаем загрузку и ничего не фетчим
    if (!token) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fbRes, ordersRes] = await Promise.all([
        api.get('feedbacks/'), 
        api.get('orders/')
      ]);
      setFeedbacks(fbRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error(err);
      // Если токен протух (ошибка 401/403), выкидываем на логин
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const payload = {
      client_message: message
    };
    if (selectedOrder) {
      payload.order = selectedOrder;
    }

    try {
      await api.post('feedbacks/', payload);
      setMessage('');
      setSelectedOrder('');
      fetchData(); 
      alert('Ваше обращение отправлено! Мы скоро ответим.');
    } catch (err) {
      alert('Ошибка при отправке. Проверь консоль.');
      console.error(err.response?.data);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary-elf"></div></div>;

  // ЭКРАН ДЛЯ НЕАВТОРИЗОВАННЫХ: Блокируем доступ
  if (!token) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center bg-white p-5 rounded-4 shadow-sm border-0" style={{ maxWidth: '450px', width: '100%' }}>
          <h1 className="display-1 mb-3">🔒</h1>
          <h3 className="brand-font text-dark fw-bold">Доступ закрыт</h3>
          <p className="text-muted mt-2 mb-4">
            Чтобы написать в службу поддержки и посмотреть свои обращения, пожалуйста, войдите в аккаунт.
          </p>
          <Link to="/login" className="btn btn-elf btn-lg w-100 rounded-pill fw-bold shadow-sm">
            Войти в систему
          </Link>
          <div className="mt-3">
            <Link to="/register" className="text-decoration-none small text-muted">Или создать новый аккаунт</Link>
          </div>
        </div>
      </div>
    );
  }

  // ЭКРАН ДЛЯ АВТОРИЗОВАННЫХ: Форма поддержки
  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '40px', marginBottom: '60px' }}>
      <h2 className="brand-font text-primary-elf mb-4">💬 Служба поддержки</h2>

      {/* ФОРМА ОТПРАВКИ */}
      <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: '15px' }}>
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">Написать нам</h5>
          <form onSubmit={handleSubmit}>
            
            {orders.length > 0 && (
              <div className="mb-3">
                <label className="form-label small text-muted fw-bold">К какому заказу относится вопрос?</label>
                <select 
                  className="form-select bg-light border-0" 
                  value={selectedOrder} 
                  onChange={(e) => setSelectedOrder(e.target.value)}
                >
                  <option value="">Не связано с конкретным заказом</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      Заказ #{order.id} от {new Date(order.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label small text-muted fw-bold">Сообщение *</label>
              <textarea 
                className="form-control bg-light border-0" 
                rows="4" 
                placeholder="Что случилось? Блюдо приехало холодным или просто хотите сказать спасибо?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-elf px-5 rounded-pill shadow-sm fw-bold">
              Отправить
            </button>
          </form>
        </div>
      </div>

      {/* ИСТОРИЯ ОБРАЩЕНИЙ */}
      <h5 className="fw-bold mb-4">История ваших обращений</h5>
      
      {feedbacks.length === 0 ? (
        <p className="text-muted text-center py-4 bg-light rounded-4">Вы еще не обращались в поддержку.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {feedbacks.map(fb => (
            <div key={fb.id} className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge bg-light text-dark border">
                    {new Date(fb.created_at).toLocaleDateString()}
                  </span>
                  {fb.is_resolved ? (
                    <span className="badge bg-success shadow-sm">✅ Решено</span>
                  ) : (
                    <span className="badge bg-warning text-dark shadow-sm">🕒 Ждет ответа</span>
                  )}
                </div>

                {fb.order && <small className="text-primary-elf fw-bold d-block mb-2">Относится к заказу #{fb.order}</small>}
                
                <p className="mb-0 fw-medium">Вы: {fb.client_message}</p>

                {/* Ответ администратора */}
                {fb.admin_reply && (
                  <div className="mt-3 p-3 bg-light rounded-3 border-start border-4 border-primary-elf">
                    <small className="text-muted fw-bold d-block mb-1">Ответ администратора:</small>
                    <p className="mb-0">{fb.admin_reply}</p>
                  </div>
                )}
                
              </div>
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
}