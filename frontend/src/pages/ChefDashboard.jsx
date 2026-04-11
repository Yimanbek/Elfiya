import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ChefDashboard() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('orders/');
      // Оставляем только НЕвыполненные заказы
      setActiveOrders(res.data.filter(order => !order.is_completed));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Автообновление каждые 10 секунд (чтобы повар видел новые заказы)
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = async (orderId) => {
    if (!window.confirm(`Выдать заказ #${orderId}?`)) return;
    try {
      await api.patch(`orders/${orderId}/complete/`);
      // Убираем заказ из списка на фронте
      setActiveOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      alert("Ошибка при выдаче заказа");
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary-elf"></div></div>;

  return (
    <div className="container-fluid px-4 mt-4 mb-5" style={{ backgroundColor: '#f4f6f9', minHeight: '80vh' }}>
      <h2 className="brand-font text-dark mb-4 p-3 bg-white rounded-4 shadow-sm border-start border-5 border-warning">
        👨‍🍳 Терминал Кухни
      </h2>

      {activeOrders.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
          <h1 className="display-1">😎</h1>
          <h4 className="text-muted mt-3">Заказов нет, можно попить чай.</h4>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {activeOrders.map(order => (
            <div key={order.id} className="col">
              <div className="card h-100 border-0 shadow-sm rounded-4 border-top border-4 border-primary-elf">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold mb-0">Заказ #{order.id}</h4>
                    <span className="badge bg-danger fs-6 animate__animated animate__pulse animate__infinite">Готовится</span>
                  </div>
                  
                  <div className="bg-light p-3 rounded-3 mb-3">
                    {order.items.map(item => (
                      <div key={item.id} className="d-flex justify-content-between mb-2 border-bottom pb-1">
                        <span className="fw-medium">{item.product_name}</span>
                        <span className="fw-bold text-primary-elf">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <p className="small text-muted mb-3">
                    📍 {order.address || 'Самовывоз'} <br/>
                    🕒 {new Date(order.created_at).toLocaleTimeString()}
                  </p>

                  <button 
                    onClick={() => handleComplete(order.id)} 
                    className="btn btn-success w-100 rounded-pill fw-bold py-2 fs-5 shadow-sm"
                  >
                    ✅ Выдать заказ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}