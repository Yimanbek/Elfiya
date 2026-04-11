import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';


export default function ProductDetail() {
  const { id } = useParams(); // Достаем ID из адресной строки (например, /product/5)
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);

  const handleAddToCart = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Нужно войти в аккаунт для заказа!');
      navigate('/login');
      return;
    }
    addToCart(product);
    alert(`${product.name} в корзине!`);
  };

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const MEDIA_BASE = 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Стучимся на твой эндпоинт детального просмотра
        const response = await api.get(`products/${id}/`); 
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Блюдо не найдено или удалено 😔');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary-elf" role="status"></div>
      <p className="mt-2 brand-font">Достаем из печи...</p>
    </div>
  );

  if (error || !product) return (
    <div className="container mt-5 text-center">
      <div className="alert alert-danger d-inline-block">{error}</div>
      <br/>
      <button onClick={() => navigate('/menu')} className="btn btn-elf mt-3">Вернуться в меню</button>
    </div>
  );

  // Формируем правильную ссылку на картинку
  const imageUrl = product.image 
    ? (product.image.startsWith('http') ? product.image : MEDIA_BASE + product.image) 
    : 'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '50px' }}>
      
      {/* Кнопка "Назад" */}
      <button onClick={() => navigate('/menu')} className="btn btn-light text-muted mb-4 shadow-sm rounded-pill px-4">
        ← Назад в меню
      </button>

      <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <div className="row g-0">
          
          {/* ЛЕВАЯ ЧАСТЬ: Огромная картинка */}
          <div className="col-md-6 bg-light d-flex align-items-center justify-content-center">
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="img-fluid w-100 h-100" 
              style={{ objectFit: 'cover', minHeight: '400px' }} 
            />
          </div>

          {/* ПРАВАЯ ЧАСТЬ: Описание и кнопка покупки */}
          <div className="col-md-6 p-4 p-lg-5 d-flex flex-column justify-content-center">
            
            {/* Если есть скидка - показываем красивый бейджик */}
            {product.discount_percent > 0 && (
              <span className="badge bg-danger align-self-start mb-3 fs-6 rounded-pill px-3 py-2 shadow-sm">
                Скидка {product.discount_percent}% 🔥
              </span>
            )}

            <h2 className="display-5 fw-bold brand-font text-primary-elf mb-3">{product.name}</h2>
            
            <p className="lead text-muted mb-4" style={{ lineHeight: '1.8' }}>
              {product.description}
            </p>

            <div className="mt-auto">
              <div className="d-flex align-items-end mb-4">
                <span className="display-4 fw-bold me-3">{product.final_price} c</span>
                
                {/* Зачеркнутая старая цена, если есть скидка */}
                {product.discount_percent > 0 && (
                  <span className="fs-4 text-muted text-decoration-line-through mb-1">
                    {product.price} c
                  </span>
                )}
              </div>

              <button 
                onClick={handleAddToCart}
                className="btn btn-elf btn-lg w-100 rounded-pill fs-5 py-3 shadow-sm"
              >
                Добавить в корзину
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}