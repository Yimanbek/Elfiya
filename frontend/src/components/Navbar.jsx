import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { CartContext } from '../context/CartContext';

function Navbar() {
  const token = localStorage.getItem('token');
  const { totalItems } = useContext(CartContext); 
  
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Стейт для проверки на админа

  useEffect(() => {
    if (token) {
      // 1. Проверяем активные заказы (для бейджика "Готовим")
      api.get('orders/')
        .then(res => {
          const active = res.data.some(o => !o.is_completed);
          setHasActiveOrder(active);
        })
        .catch(err => console.error("Ошибка загрузки заказов", err));

      api.get('profile/')
        .then(res => {
          // Если бэкенд вернул is_superuser: true, включаем режим админа
          if (res.data.is_staff) {
            setIsAdmin(true);
          }
        })
        .catch(err => console.error("Ошибка загрузки профиля", err));
    }
  }, [token]);

  return (
    <nav 
      className="navbar navbar-expand-lg sticky-top shadow-sm" 
      style={{ 
        padding: '12px 0',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}
    >
      <div className="container-fluid px-4 px-lg-5">
        
        <Link className="navbar-brand brand-font text-primary-elf fs-2 fw-bold" to="/">
          ✨ Elfiya
        </Link>
        
        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          
          <ul className="navbar-nav ms-auto align-items-center gap-2 gap-lg-4">
            
            {/* --- БЛОК 1: ОБЫЧНЫЕ ССЫЛКИ --- */}
            {/* Добавили text-nowrap, чтобы "О нас" никогда не ломалось на две строки */}
            <li className="nav-item">
              <Link className="nav-link fw-bold text-dark nav-hover-elf fs-6 text-nowrap" to="/about">О нас</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-bold text-dark nav-hover-elf fs-6 text-nowrap" to="/">Главная</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-bold text-dark nav-hover-elf fs-6 text-nowrap" to="/menu">Меню</Link>
            </li>

            { /* --- БЛОК 2: СЕКРЕТНЫЕ АДМИНСКИЕ ССЫЛКИ --- */}
            {/* Показываем только если стейт isAdmin == true */}
            {isAdmin && (
              <li className="nav-item dropdown bg-light rounded-pill px-2">
                <a className="nav-link fw-bold text-danger dropdown-toggle text-nowrap" href="#" role="button" data-bs-toggle="dropdown">
                  👑 Админка
                </a>
                <ul className="dropdown-menu border-0 shadow-sm rounded-4 mt-2">
                  
                  {/* ПРЯМАЯ ССЫЛКА НА БЭКЕНД (Обрати внимание на тег <a> и адрес сервера) */}
                  <li>
                    <a 
                      className="dropdown-item fw-bold py-2 text-danger" 
                      href={`${process.env.REACT_APP_API_URL}/admin/`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      ⚙️ Django Administration
                    </a>
                  </li>

                  <li><hr className="dropdown-divider" /></li> {/* Красивая полоска-разделитель */}

                  <li><Link className="dropdown-item fw-bold py-2" to="/chef">👨‍🍳 Терминал кухни</Link></li>
                  <li><Link className="dropdown-item fw-bold py-2" to="/reports">📊 Отчеты и ML</Link></li>
                </ul>
              </li>
            )}

            
            <li className="nav-item mt-3 mt-lg-0 w-100 w-lg-auto">
              <Link 
                className="btn btn-outline-elf rounded-pill px-4 py-2 position-relative d-flex align-items-center justify-content-center gap-2 w-100 fw-bold" 
                to="/cart"
              >
                <span className="fs-5 lh-1">🛒</span> Корзина
                {totalItems > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm border border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            </li>
            
            {token ? (
              <li className="nav-item mt-2 mt-lg-0 w-100 w-lg-auto d-flex flex-column flex-lg-row align-items-center gap-2">
                {hasActiveOrder && !isAdmin && (
                  <span className="badge rounded-pill bg-warning text-dark py-2 px-3 shadow-sm animate__animated animate__pulse animate__infinite text-nowrap" style={{ fontSize: '0.85em' }}>
                    👨‍🍳 Готовим...
                  </span>
                )}
                <Link className="btn btn-elf rounded-pill px-4 py-2 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2 w-100" to="/profile">
                  <span className="fs-5 lh-1">👤</span> Кабинет
                </Link>
              </li>
            ) : (
              <li className="nav-item mt-2 mt-lg-0 w-100 w-lg-auto">
                <Link className="btn btn-elf rounded-pill px-4 py-2 shadow-sm fw-bold w-100" to="/login">
                  Войти
                </Link>
              </li>
            )}
            
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;