import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [bonusHistory, setBonusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const MEDIA_BASE = import.meta.env.VITE_BASE_URL;
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // --- Стейты для редактирования профиля ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone_number: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [profileResponse, ordersResponse, bonusResponse] = await Promise.all([
        api.get('profile/'), // Загрузка данных
        api.get('orders/'),
        api.get('bonus-transactions/')
      ]);
      const sortedOrders = ordersResponse.data
        .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 16);
      setOrders(sortedOrders);
      setProfileData(profileResponse.data);
      setBonusHistory(bonusResponse.data);
      
      // Предзаполняем форму редактирования
      setEditForm({
        full_name: profileResponse.data.full_name || '',
        phone_number: profileResponse.data.phone_number || ''
      });
      
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout(); 
      } else {
        setError('Не удалось загрузить данные кабинета. Проверь эндпоинты бэкенда.');
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  const toggleOrder = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  };

  // --- Хэндлер сохранения профиля ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append('full_name', editForm.full_name);
    formData.append('phone_number', editForm.phone_number);
    
    // Если выбрали новую фотку - добавляем её
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      // Отправляем на наш новый эндпоинт
      const response = await api.patch('profile-edit/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Обновляем данные на фронте без перезагрузки страницы
      setProfileData({
        ...profileData,
        full_name: response.data.full_name,
        phone_number: response.data.phone_number,
        avatar: response.data.avatar
      });
      
      setIsEditing(false); // Выходим из режима редактирования
      alert('Профиль успешно обновлен! 🚀');
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении профиля.');
    } finally {
      setIsSaving(false);
    }
  };

  // Формируем URL аватарки (с проверкой на http)
  const avatarUrl = profileData?.avatar 
    ? (profileData.avatar.startsWith('http') ? profileData.avatar : `${MEDIA_BASE}${profileData.avatar}`) 
    : null;

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary-elf" role="status"></div>
      <p className="mt-2 brand-font">Загружаем твой кабинет...</p>
    </div>
  );

  if (error) return <div className="alert alert-danger mt-5 text-center">{error}</div>;

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '40px', marginBottom: '60px' }}>
      <h2 className="brand-font text-primary-elf mb-4">✨ Мой кабинет</h2>

      <div className="row g-4">
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="col-md-5">
          
          {/* КАРТОЧКА ПОЛЬЗОВАТЕЛЯ */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
            <div className="card-body text-center p-4">
              
              {isEditing ? (
                // --- РЕЖИМ РЕДАКТИРОВАНИЯ ---
                <form onSubmit={handleSaveProfile}>
                  <h5 className="fw-bold mb-3">Редактирование</h5>
                  
                  <div className="mb-2 text-start">
                    <label className="small text-muted mb-1">Аватарка</label>
                    <input 
                      type="file" 
                      className="form-control form-control-sm"
                      accept="image/*"
                      onChange={(e) => setAvatarFile(e.target.files[0])}
                    />
                  </div>
                  
                  <div className="mb-2 text-start">
                    <label className="small text-muted mb-1">ФИО</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="mb-3 text-start">
                    <label className="small text-muted mb-1">Телефон</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm"
                      value={editForm.phone_number}
                      onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                    />
                  </div>

                  <button type="submit" disabled={isSaving} className="btn btn-success w-100 rounded-pill fw-medium mb-2">
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline-secondary w-100 rounded-pill fw-medium">
                    Отмена
                  </button>
                </form>

              ) : (
                // --- РЕЖИМ ПРОСМОТРА ---
                <>
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Аватар" 
                      className="rounded-circle mb-3 shadow-sm" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div className="bg-light rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '80px', height: '80px' }}>
                      <span className="fs-1">👤</span>
                    </div>
                  )}
                  
                  <h4 className="fw-bold mb-1">{profileData?.full_name || 'Без имени'}</h4>
                  <p className="text-muted mb-4">{profileData?.phone_number || 'Нет номера'}</p>
                  
                  <button onClick={() => setIsEditing(true)} className="btn btn-elf w-100 rounded-pill fw-medium mb-2">
                    ✏️ Редактировать профиль
                  </button>

                  <button onClick={handleLogout} className="btn btn-outline-danger w-100 rounded-pill fw-medium mb-2">
                    Выйти из аккаунта
                  </button>
                  
                  <Link to="/support" className="btn btn-light border w-100 rounded-pill fw-medium shadow-sm">
                    💬 Служба поддержки
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* КОШЕЛЕК */}
          <div className="card border-0 shadow-sm bg-primary-elf text-white mb-4" style={{ borderRadius: '15px' }}>
            <div className="card-body p-4 text-center">
              <h6 className="text-white-50 text-uppercase fw-bold mb-2">Твои бонусы</h6>
              <h1 className="display-4 fw-bold mb-0">{profileData?.wallet_balance || 0}</h1>
              <p className="small mt-2 mb-0">1 бонус = 1 сом</p>
            </div>
          </div>

          {/* ИСТОРИЯ БОНУСОВ (Без изменений) */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">История бонусов 🪙</h6>
              
              {bonusHistory.length === 0 ? (
                <p className="text-muted small mb-0">Пока нет начислений.</p>
              ) : (
                <div className="list-group list-group-flush">
                  {bonusHistory.map(tx => {
                    const isSpend = tx.transaction_type === 'Spend';
                    const colorClass = isSpend ? 'text-danger' : 'text-success';
                    const sign = isSpend ? '-' : '+';

                    return (
                      <div key={tx.id} className="list-group-item px-0 py-2 border-bottom d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-bold d-block text-dark small">{tx.type_display}</span>
                          <span className="text-muted" style={{fontSize: '0.75em'}}>
                            {new Date(tx.created_at).toLocaleDateString()} {tx.description && `• ${tx.description}`}
                          </span>
                        </div>
                        <div className={`fw-bold ${colorClass}`}>
                          {sign}{parseFloat(tx.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ПРАВАЯ КОЛОНКА: ИСТОРИЯ ЗАКАЗОВ (Без изменений) */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">История заказов 📦</h5>
              
              {orders.length === 0 ? (
                <p className="text-muted">Вы еще ничего не заказывали. Самое время заглянуть в меню!</p>
              ) : (
                <div className="list-group list-group-flush">
                  {orders.map((order) => {
                    const totalItemsPrice = calculateTotal(order.items);
                    const isExpanded = expandedOrderId === order.id;

                    return (
                      <div key={order.id} className="list-group-item px-0 py-3 border-bottom">
                        <div 
                          className="d-flex justify-content-between align-items-center" 
                          style={{ cursor: 'pointer' }} 
                          onClick={() => toggleOrder(order.id)}
                        >
                          <div>
                            <h6 className="mb-1 fw-bold">
                              Заказ #{order.id} {isExpanded ? '🔽' : '▶️'}
                            </h6>
                            <small className="text-muted">
                              {new Date(order.created_at).toLocaleDateString()} • 
                              <span className={order.is_completed ? "text-success ms-1" : "text-warning ms-1"}>
                                {order.is_completed ? "Выдан" : "В обработке"}
                              </span>
                            </small>
                          </div>
                          <div className="text-end">
                            <span className="fw-bold">{totalItemsPrice - order.bonuses_spent} c</span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-3 bg-light rounded p-3 small">
                            <h6 className="fw-bold mb-2 border-bottom pb-2">Детали заказа:</h6>
                            
                            {order.items.map(item => (
                              <div key={item.id} className="d-flex justify-content-between mb-1">
                                <span className="text-muted">
                                  {item.product_name || `Товар #${item.product}`} x {item.quantity}
                                </span>
                                <span>{parseFloat(item.price) * item.quantity} c</span>
                              </div>
                            ))}

                            <hr className="my-2" />
                            
                            <div className="d-flex justify-content-between">
                              <span className="text-muted">Сумма:</span>
                              <span>{totalItemsPrice} c</span>
                            </div>
                            {order.bonuses_spent > 0 && (
                              <div className="d-flex justify-content-between text-success">
                                <span>Списано бонусов:</span>
                                <span>-{order.bonuses_spent} c</span>
                              </div>
                            )}
                            <div className="d-flex justify-content-between fw-bold mt-1">
                              <span>Итого к оплате:</span>
                              <span>{totalItemsPrice - order.bonuses_spent} c</span>
                            </div>
                            
                            <div className="mt-2 text-muted fst-italic">
                              {order.address ? `📍 Доставка: ${order.address}` : '🏃 Самовывоз'}
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}