import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; 

export default function About() {
  const [cashbackPercent, setCashbackPercent] = useState(5);

  useEffect(() => {
    api.get('cashback-percent/') 
      .then(res => {
        if (res.data && res.data.cashback_percent) {
          setCashbackPercent(res.data.cashback_percent);
        }
      })
      .catch(err => console.error("Не удалось подтянуть настройки бонусов", err));
  }, []);

  return (
    <div>
      {/* ================= ГЛАВНЫЙ БАННЕР ================= */}
      <div className="container mt-4 mb-5">
        <div className="bg-primary-elf text-white rounded-4 p-4 p-lg-5 shadow-lg position-relative overflow-hidden" style={{ minHeight: '400px', display: 'flex', alignItems: 'center' }}>
          
          <div style={{ position: 'absolute', top: '-100px', right: '-50px', width: '350px', height: '350px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
          <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--elf-accent)', borderRadius: '50%', opacity: '0.5', filter: 'blur(50px)' }}></div>

          <div className="row align-items-center position-relative w-100" style={{ zIndex: 1 }}>
            <div className="col-lg-6 py-3 py-lg-5 text-center text-lg-start">
              
              <div className="d-inline-block mb-3 px-4 py-2 bg-white text-primary-elf rounded-pill fw-bold shadow-sm animate__animated animate__pulse animate__infinite">
                🔥 Возвращаем {cashbackPercent}% с каждого заказа
              </div>

              <h1 className="display-4 brand-font fw-bold mb-4 lh-1">Больше, чем еда.<br/>Это магия вкуса ✨</h1>
              <p className="lead mb-4 opacity-100 fs-5 text-white-50">
                Мы готовим так, чтобы каждое блюдо вызывало искреннюю улыбку. Заказывай любимую еду, получай гарантированный кешбэк и оплачивай следующие застолья своими бонусами!
              </p>
              
              <Link to="/menu" className="btn btn-light btn-lg text-primary-elf fw-bold rounded-pill px-5 py-3 shadow-sm transition-hover">
                Смотреть меню →
              </Link>
            </div>
            
            <div className="col-lg-6 d-none d-lg-block text-center position-relative">
              <div className="position-relative d-inline-block">
                <div className="position-absolute top-50 start-50 translate-middle w-100 h-100 bg-white rounded-circle opacity-25 animate__animated animate__pulse animate__infinite animate__slow" style={{ padding: '20px' }}></div>
                <img 
                  /* Заменил фотку на красивую подачу ресторанной еды */
                  src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80" 
                  alt="Вкусная еда" 
                  className="img-fluid rounded-circle shadow-lg border border-5 border-white position-relative" 
                  style={{ width: '400px', height: '400px', objectFit: 'cover', zIndex: 2 }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= БЛОК ПРЕИМУЩЕСТВ ================= */}
      <div className="container mb-5 pb-5">
        <div className="text-center mb-5">
          <span className="text-muted fw-bold text-uppercase tracking-wider">Наша философия</span>
          <h2 className="brand-font text-dark mt-2 display-5">Почему выбирают нас?</h2>
        </div>
        
        <div className="row g-4">
          <div className="col-md-4">
            <div className="bg-white p-5 rounded-4 shadow-sm h-100 border-0 transition-hover text-center" style={{ borderTop: '5px solid #ff6b6b !important' }}>
              <div className="display-3 mb-4">🚀</div>
              <h4 className="fw-bold mb-3">Скорость и забота</h4>
              <p className="text-muted mb-0">Мы оптимизировали процессы на кухне так, чтобы твой заказ начинал готовиться в ту же секунду. Привезем всё с пылу с жару прямо к твоему столу!</p>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="bg-white p-5 rounded-4 shadow h-100 border border-2 position-relative" style={{ borderColor: 'var(--elf-primary)', transform: 'translateY(-10px)' }}>
              <div className="position-absolute top-0 start-50 translate-middle badge bg-primary-elf px-4 py-2 rounded-pill fs-6">
                Выгода
              </div>
              <div className="display-3 mb-4 text-center mt-3">💸</div>
              <h4 className="fw-bold mb-3 text-center">Умная лояльность</h4>
              <p className="text-muted mb-0 text-center">
                Мы честно возвращаем <strong>{cashbackPercent}%</strong> от суммы каждого заказа на твой счет. Никаких скрытых условий. 1 бонус = 1 сом. Копи и ешь бесплатно!
              </p>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="bg-white p-5 rounded-4 shadow-sm h-100 border-0 transition-hover text-center">
              {/* Поменял эмодзи и текст на более универсальный про кухню */}
              <div className="display-3 mb-4">👨‍🍳</div>
              <h4 className="fw-bold mb-3">Качество в деталях</h4>
              <p className="text-muted mb-0">Никаких компромиссов. Только свежие фермерские продукты, отборные ингредиенты и авторские рецепты, созданные с душой.</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}