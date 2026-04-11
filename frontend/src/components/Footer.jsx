import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-top shadow-sm mt-5 pt-5 pb-4">
      <div className="container-fluid px-4 px-lg-5">
        
        {/* ВЕРХНЯЯ ЧАСТЬ ФУТЕРА (4 колонки) */}
        <div className="row g-4 mb-4">
          
          {/* 1. Логотип и описание */}
          <div className="col-lg-4 col-md-6">
            <Link className="navbar-brand brand-font text-primary-elf fs-2 text-decoration-none fw-bold" to="/">
              ✨ Elfiya
            </Link>
            <p className="text-muted mt-3 mb-0 pe-lg-5 lh-lg" style={{ fontSize: '0.9rem' }}>
              Больше, чем просто доставка еды в Бишкеке. Готовим с душой, используем лучшие ингредиенты и доставляем магию вкуса прямо к вашей двери.
            </p>
          </div>

          {/* 2. Быстрая навигация */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-4 text-uppercase tracking-wider">Навигация</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none fw-medium transition-hover">Главная</Link>
              </li>
              <li className="mb-2">
                <Link to="/menu" className="text-muted text-decoration-none fw-medium transition-hover">Меню</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-muted text-decoration-none fw-medium transition-hover">О нас</Link>
              </li>
            </ul>
          </div>

          {/* 3. Контакты (с заглушками) */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-4 text-uppercase tracking-wider">Контакты</h6>
            <ul className="list-unstyled mb-0 text-muted" style={{ fontSize: '0.95rem' }}>
              <li className="mb-3 d-flex align-items-center">
                <span className="fs-5 me-2">📞</span> 
                <a href="tel:+996000000000" className="text-dark text-decoration-none fw-bold transition-hover">
                  +996 (000) 00-00-00
                </a>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <span className="fs-5 me-2 lh-1">📍</span> 
                <span>г. Бишкек, ул. [----], 00</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <span className="fs-5 me-2 lh-1">🕒</span> 
                <span>Ежедневно: 10:00 - 23:00</span>
              </li>
            </ul>
          </div>

          {/* 4. Блок поддержки */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-4 text-uppercase tracking-wider">Служба заботы</h6>
            <p className="text-muted small mb-3">
              Возникли вопросы по заказу или есть предложения? Наша служба поддержки всегда на связи.
            </p>
            <Link to="/support" className="btn btn-outline-elf rounded-pill px-4 fw-bold shadow-sm d-inline-flex align-items-center gap-2">
              <span>💬</span> Написать нам
            </Link>
          </div>

        </div>

        {/* РАЗДЕЛИТЕЛЬНАЯ ЛИНИЯ */}
        <hr className="text-muted opacity-25 my-4" />

        {/* НИЖНЯЯ ЧАСТЬ (Копирайт) */}
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start text-muted small fw-medium">
            © 2026 Elfiya Cafe. Все права защищены.
          </div>
          <div className="col-md-6 text-center text-md-end text-muted small mt-2 mt-md-0 fw-medium">
            Сделано с ❤️ для защиты диплома
          </div>
        </div>
        
      </div>
    </footer>
  );
}