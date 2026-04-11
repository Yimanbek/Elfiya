import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import api from '../api/axios';

export default function Cart() {
  const { cart, addToCart, removeFromCart, clearCart, totalPrice } = useContext(CartContext);
  const navigate = useNavigate();

  const [isPaying, setIsPaying] = useState(false);
  const [address, setAddress] = useState(''); // Стейт для адреса
  const [useBonuses, setUseBonuses] = useState(false); // Стейт для галочки
  const [walletBalance, setWalletBalance] = useState(0); // Стейт для баланса

  // Подтягиваем баланс при открытии корзины
  useEffect(() => {
    api.get('profile/')
      .then(res => setWalletBalance(res.data.wallet_balance || 0))
      .catch(err => console.error("Не удалось загрузить баланс", err));
  }, []);

  const handleCheckout = async () => {
    setIsPaying(true);
    
    // Имитация небольшой задержки для красоты (типа подключаемся к банку/кассе)
    setTimeout(async () => {
      try {
        await api.post('orders/', {
          items: cart.map(item => ({ product: item.id, quantity: item.quantity })),
          address: address.trim() !== '' ? address : 'Самовывоз',
          use_bonuses: useBonuses
        });
        
        alert('Заказ успешно оформлен! 🎉');
        clearCart();
        setIsPaying(false);
        navigate('/profile'); // Кидаем в профиль, пусть смотрит историю
      } catch (err) {
        alert('Ошибка при создании заказа. Проверь бэкенд.');
        console.error(err.response?.data);
        setIsPaying(false);
      }
    }, 1500);
  };

  // Вычисляем, сколько реально придется заплатить, если юзер нажмет "Списать бонусы"
  const finalPayAmount = useBonuses 
    ? Math.max(0, totalPrice - walletBalance) // Если бонусов больше чем сумма заказа, будет 0
    : totalPrice;

  if (cart.length === 0) {
    return (
      <div className="container text-center" style={{ marginTop: '100px', marginBottom: '100px' }}>
        <h1 className="display-1">🛒</h1>
        <h2 className="brand-font text-primary-elf mt-4">Ой, тут пусто!</h2>
        <p className="text-muted">Самое время добавить вкусную пиццу.</p>
        <Link to="/" className="btn btn-elf btn-lg mt-3 rounded-pill px-5">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
      <h2 className="brand-font text-primary-elf mb-4">✨ Твоя корзина</h2>

      <div className="row g-4">
        {/* ЛЕВАЯ КОЛОНКА: Список товаров */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
            <div className="card-body p-4">
              {cart.map((item) => (
                <div key={item.id} className="row align-items-center mb-4 border-bottom pb-3">
                  <div className="col-3 col-md-2">
                    <img 
                      src={item.image ? (item.image.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`) : 'https://via.placeholder.com/150'} 
                      alt={item.name} 
                      className="img-fluid rounded-3 shadow-sm" 
                      style={{ objectFit: 'cover', height: '80px', width: '100%' }}
                    />
                  </div>
                  <div className="col-5 col-md-6">
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <span className="text-primary-elf fw-bold">{item.final_price || item.price} c</span>
                  </div>
                  <div className="col-4 col-md-4 text-end">
                    <div className="btn-group btn-group-sm shadow-sm" role="group">
                      <button onClick={() => removeFromCart(item.id)} className="btn btn-light border fw-bold text-danger">-</button>
                      <button className="btn btn-white border px-3" disabled>{item.quantity}</button>
                      <button onClick={() => addToCart(item)} className="btn btn-light border fw-bold text-success">+</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={clearCart} className="btn btn-outline-danger btn-sm rounded-pill px-4">
                🗑 Очистить корзину
              </button>
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Итог и Оформление */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm bg-light" style={{ borderRadius: '15px', position: 'sticky', top: '100px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Оформление</h5>
              
              {/* ПОЛЕ АДРЕСА */}
              <div className="mb-4">
                <label className="form-label small text-muted fw-bold">Куда везем?</label>
                <input 
                  type="text" 
                  className="form-control rounded-pill px-3" 
                  placeholder="Адрес (пусто = самовывоз)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
              {walletBalance > 0 && (
                <div className="mb-4 p-3 bg-white rounded-4 shadow-sm border d-flex align-items-center">
                  
                  {/* Сам ползунок. fs-4 делает его крупнее и удобнее для пальца */}
                  <div className="form-check form-switch mb-0 fs-4 me-2">
                    <input 
                      className="form-check-input mt-0" 
                      type="checkbox" 
                      role="switch" 
                      id="bonusSwitch" 
                      style={{ cursor: 'pointer' }}
                      checked={useBonuses}
                      onChange={(e) => setUseBonuses(e.target.checked)}
                    />
                  </div>
                  
                  {/* Текст и баланс */}
                  <label className="form-check-label d-flex flex-column justify-content-center" htmlFor="bonusSwitch" style={{ cursor: 'pointer' }}>
                    <span className="fw-bold lh-1 mb-1">Списать бонусы</span>
                    <small className="text-muted lh-1" style={{ fontSize: '0.85em' }}>
                      Доступно: <span className="text-primary-elf fw-bold">{walletBalance}</span>
                    </small>
                  </label>
                  
                </div>
              )}

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Товары:</span>
                <span className="fw-bold">{totalPrice} c</span>
              </div>
              
              {useBonuses && walletBalance > 0 && (
                <div className="d-flex justify-content-between mb-2 text-danger">
                  <span>Скидка (бонусы):</span>
                  <span>- {Math.min(totalPrice, walletBalance)} c</span>
                </div>
              )}

              <hr />

              <div className="d-flex justify-content-between mb-4 fs-4">
                <span className="fw-bold">Итого:</span>
                <span className="fw-bold text-primary-elf">{finalPayAmount} c</span>
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={isPaying}
                className="btn btn-elf btn-lg w-100 rounded-pill shadow-sm fw-bold d-flex justify-content-center align-items-center"
              >
                {isPaying ? (
                  <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                ) : (
                  'Подтвердить заказ'
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}