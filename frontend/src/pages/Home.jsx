import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CartContext } from '../context/CartContext';

export default function Home() {
  const [news, setNews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Стейты для Сториз (Новостей)
  const [activeStory, setActiveStory] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);

  // Стейты для умных фильтров
  const [showOnlyDiscount, setShowOnlyDiscount] = useState(false);
  const [sortByPrice, setSortByPrice] = useState('default');

  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const MEDIA_BASE = 'http://127.0.0.1:8000';

  // 1. ЗАГРУЗКА ДАННЫХ
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        api.get('news/').then(res => setNews(res.data)).catch(() => console.log('Новостей нет'));
        
        const prodRes = await api.get('products/');
        const shuffled = prodRes.data.sort(() => 0.5 - Math.random());
        setProducts(shuffled);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  useEffect(() => {
    if (!news || news.length === 0 || loading) return;

    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          return 100; 
        }
        return prev + 1;
      });
    }, 50);

    if (storyProgress >= 100) {
      setActiveStory((current) => (current + 1) % news.length);
      setStoryProgress(0);
    }

    return () => clearInterval(interval);
  }, [news, loading, storyProgress, activeStory]);


  // Функция для ручного переключения сториз по клику (левая/правая половина)
  const handleStoryClick = (direction) => {
    setStoryProgress(0); // Сбрасываем таймер
    if (direction === 'next') {
      setActiveStory((prev) => (prev + 1) % news.length);
    } else {
      setActiveStory((prev) => (prev === 0 ? news.length - 1 : prev - 1));
    }
  };

  const handleAddToCart = (product) => {
    if (!localStorage.getItem('token')) {
      alert('Войди в аккаунт, чтобы собирать заказ!');
      navigate('/login');
      return;
    }
    addToCart(product);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  // ФИЛЬТРЫ ТОВАРОВ
  let displayedProducts = [...products];
  if (showOnlyDiscount) displayedProducts = displayedProducts.filter(p => p.discount_percent > 0);
  if (sortByPrice === 'asc') displayedProducts.sort((a, b) => parseFloat(a.final_price) - parseFloat(b.final_price));
  else if (sortByPrice === 'desc') displayedProducts.sort((a, b) => parseFloat(b.final_price) - parseFloat(a.final_price));

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary-elf" role="status"></div>
      <p className="mt-2 brand-font">Накрываем на стол...</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#fcfcfc', paddingBottom: '50px' }}>
      
      {/* ================= БЛОК 1: STORIES (MBANK STYLE) ================= */}
      <div className="container mt-4 mb-5">
        {news.length === 0 ? (
          // Заглушка, если бэкенд пустой
          <div className="rounded-4 overflow-hidden position-relative shadow-sm" style={{ height: '350px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
             <div className="position-absolute bottom-0 start-0 p-4 p-md-5 text-white w-100" style={{ zIndex: 2 }}>
               <span className="badge bg-white text-primary-elf mb-2 shadow-sm">Акция</span>
               <h2 className="fw-bold display-6 mb-2">Регистрируйся и получай бонусы при каждом покупке</h2>
               <p className="mb-0 opacity-75 fs-5">Опалчивай балами каждую покупку вплоть до 100%</p>
             </div>
          </div>
        ) : (
          // НАСТОЯЩИЕ ИСТОРИИ
          <div className="rounded-4 overflow-hidden position-relative shadow-sm" style={{ height: '400px', backgroundColor: '#111' }}>
            
            {/* 1. Полоски прогресса (Bars) */}
            <div className="position-absolute top-0 start-0 w-100 d-flex gap-2 p-3" style={{ zIndex: 10 }}>
              {news.map((_, index) => (
                <div key={index} style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div 
                    style={{
                      height: '100%',
                      background: '#fff',
                      // Заполняем на 100%, если сторис уже прошла. Заполняем по таймеру, если текущая. 0%, если еще не дошли.
                      width: activeStory === index ? `${storyProgress}%` : (index < activeStory ? '100%' : '0%'),
                      transition: activeStory === index ? 'width 0.05s linear' : 'none'
                    }} 
                  />
                </div>
              ))}
            </div>

            {/* 2. Картинка (Фон) и Градиент */}
            {news[activeStory]?.image ? (
              <img 
                src={news[activeStory].image.startsWith('http') ? news[activeStory].image : MEDIA_BASE + news[activeStory].image} 
                alt="Story" 
                className="w-100 h-100" 
                style={{ objectFit: 'cover', opacity: 0.9, animation: 'fadeIn 0.3s ease-in-out' }} 
              />
            ) : (
              <div className="w-100 h-100 bg-primary-elf" style={{ animation: 'fadeIn 0.3s ease-in-out' }}></div>
            )}
            
            {/* Затемнение снизу, чтобы белый текст читался на любой фотке */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.4) 100%)', zIndex: 1 }}></div>

            {/* 3. Текст Истории */}
            <div className="position-absolute bottom-0 start-0 p-4 p-md-5 text-white w-100" style={{ zIndex: 2, animation: 'slideUp 0.3s ease-in-out' }}>
               <span className="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill shadow-sm fs-6">Новость</span>
               <h2 className="fw-bold display-5 mb-2 lh-1">{news[activeStory]?.title}</h2>
               <p className="mb-0 text-light fs-5 w-75 lh-sm">{news[activeStory]?.text}</p>
            </div>

            {/* 4. Невидимые кнопки для клика (Левая половина - назад, Правая - вперед) */}
            <div className="position-absolute top-0 start-0 w-50 h-100" style={{ zIndex: 5, cursor: 'pointer' }} onClick={() => handleStoryClick('prev')}></div>
            <div className="position-absolute top-0 end-0 w-50 h-100" style={{ zIndex: 5, cursor: 'pointer' }} onClick={() => handleStoryClick('next')}></div>

          </div>
        )}
      </div>

      {/* ================= БЛОК 2: ВИТРИНА С ФИЛЬТРАМИ (ОСТАЕТСЯ КАК БЫЛО) ================= */}
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <h3 className="brand-font text-dark mb-0">🔥 Популярное сейчас</h3>
          
          <div className="d-flex flex-wrap gap-2 align-items-center bg-white p-2 rounded-pill shadow-sm border">
            <button 
              onClick={() => setShowOnlyDiscount(!showOnlyDiscount)} 
              className={`btn btn-sm rounded-pill px-3 fw-medium transition-all ${showOnlyDiscount ? 'btn-danger shadow-sm' : 'btn-light text-muted'}`}
            >
              {showOnlyDiscount ? '🔥 Скидки включены' : '🏷️ Только по акции'}
            </button>
            <select 
              className="form-select form-select-sm border-0 bg-transparent fw-medium ms-2" 
              style={{ width: 'auto', outline: 'none', boxShadow: 'none', cursor: 'pointer' }}
              value={sortByPrice}
              onChange={(e) => setSortByPrice(e.target.value)}
            >
              <option value="default">↕ Сортировка</option>
              <option value="asc">Сначала дешевые</option>
              <option value="desc">Сначала дорогие</option>
            </select>
          </div>
        </div>

        {displayedProducts.length === 0 ? (
          <div className="text-center text-muted py-5">
            <h5>По таким фильтрам ничего не найдено 😔</h5>
            <button onClick={() => {setShowOnlyDiscount(false); setSortByPrice('default');}} className="btn btn-outline-elf mt-2 rounded-pill">Сбросить фильтры</button>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {displayedProducts.map((product) => (
              <div key={product.id} className="col">
                <div className="card h-100 border-0 shadow-sm transition-hover" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                  
                  {product.discount_percent > 0 && (
                    <div className="position-absolute top-0 start-0 m-3 z-2">
                      <span className="badge bg-danger rounded-pill px-3 py-2 shadow-sm fs-6">
                        -{product.discount_percent}%
                      </span>
                    </div>
                  )}

                  <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                    <div className="position-relative" style={{ height: '220px', backgroundColor: '#f8f9fa' }}>
                      <img 
                        src={product.image ? (product.image.startsWith('http') ? product.image : MEDIA_BASE + product.image) : 'https://via.placeholder.com/400x300'} 
                        className="w-100 h-100" 
                        alt={product.name} 
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    
                    <div className="card-body pb-0">
                      <h5 className="fw-bold mb-1 text-truncate">{product.name}</h5>
                      <p className="text-muted small mb-0" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description}
                      </p>
                    </div>
                  </Link>
                  
                  <div className="card-body d-flex justify-content-between align-items-end pt-3 mt-auto">
                    <div>
                      {product.discount_percent > 0 && (
                        <div className="text-muted text-decoration-line-through small" style={{ lineHeight: '1' }}>
                          {product.price} c
                        </div>
                      )}
                      <span className="fs-5 fw-bold text-primary-elf mb-0 d-block" style={{ lineHeight: '1.2' }}>
                        {product.final_price || product.price} c
                      </span>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)} 
                      className="btn btn-elf rounded-circle shadow-sm d-flex justify-content-center align-items-center"
                      style={{ width: '45px', height: '45px' }}
                    >
                      <span className="fs-5">+</span>
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}