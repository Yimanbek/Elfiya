import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

export default function FloatingCart() {
  const { totalItems, totalPrice } = useContext(CartContext);
  const location = useLocation();

  // Не показываем плашку, если мы уже в корзине или она пуста
  if (totalItems === 0 || location.pathname === '/cart') return null;

  return (
    <div className="fixed-bottom p-3" style={{ zIndex: 1050, bottom: '150px' }}>
      <Link to="/cart" className="text-decoration-none">
        <div className="container">
          <div className="bg-primary-elf text-white p-3 rounded-4 shadow-lg d-flex justify-content-between align-items-center animate__animated animate__slideInUp">
            <div className="d-flex align-items-center">
              <span className="fs-4 me-3">🛒</span>
              <div>
                <div className="fw-bold">У вас есть товары в корзине</div>
                <small className="opacity-75">{totalItems} поз. на сумму {totalPrice} c</small>
              </div>
            </div>
            <span className="fw-bold">Перейти →</span>
          </div>
        </div>
      </Link>
    </div>
  );
}