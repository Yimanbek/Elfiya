import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

export default function Menu() {
  const [categories, setCategories] = useState([]); 
  const [products, setProducts] = useState([]);    
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const MEDIA_BASE = 'http://127.0.0.1:8000';

  const handleAddToCart = (product) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Сначала войди в аккаунт, чтобы собирать заказ');
      navigate('/login');
      return;
    }

    addToCart(product);
    alert(`${product.name} успешно добавлена в корзину!`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, productsResponse] = await Promise.all([
          api.get('menus/'),
          api.get('products/')
        ]);

        setCategories(categoriesResponse.data);
        setProducts(productsResponse.data);

        if (categoriesResponse.data.length > 0) {
          setActiveCategory(categoriesResponse.data[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Ошибка при загрузке:", err);
        setError("Не удалось загрузить данные. Проверь бэкенд.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter(product => product.menu === activeCategory);

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary-elf" role="status"></div>
      <p className="mt-2 brand-font">Греем печи, загружаем меню...</p>
    </div>
  );

  if (error) return <div className="alert alert-danger mt-5 text-center">{error}</div>;

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <div className="text-center mb-4">
        <h2 className="brand-font text-primary-elf display-5">✨ Наше Меню</h2>
      </div>

      {/* НАВИГАЦИЯ ПО КАТЕГОРИЯМ (Кнопки-табы) */}
      <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`btn rounded-pill px-4 fw-medium ${
              activeCategory === category.id 
                ? 'btn-elf shadow-sm'
                : 'btn-light text-muted border'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* СЕТКА ТОВАРОВ (Только отфильтрованные) */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
        {filteredProducts.length === 0 ? (
          <div className="col-12 text-center text-muted">В этой категории пока нет товаров</div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="col">
              <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                
                <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                <img 
                    src={product.image ? (product.image.startsWith('http') ? product.image : MEDIA_BASE + product.image) : 'https://via.placeholder.com/500x300?text=No+Image'} 
                    className="card-img-top" 
                    alt={product.name} 
                    style={{ height: '200px', objectFit: 'cover' }}
                />
                
                <div className="card-body d-flex flex-column pb-0">
                    <h5 className="card-title fw-bold text-primary-elf-hover">{product.name}</h5>
                    <p className="card-text text-muted small flex-grow-1">
                    {product.description}
                    </p>
                </div>
                </Link>
                
                <div className="card-body pt-0 mt-auto">
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="fs-5 fw-bold text-primary-elf">{product.final_price || product.price} c</span>
                    <button 
                        onClick={() => handleAddToCart(product)} 
                        className="btn btn-elf btn-sm px-3 rounded-pill"
                      >
                    + В корзину
                    </button>
                </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}