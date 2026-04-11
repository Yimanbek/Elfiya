import { createContext, useState, useEffect } from 'react';

// 1. Создаем саму "коробку" для глобальных данных
export const CartContext = createContext();

// 2. Создаем Провайдер — это обертка, которая будет раздавать данные всем остальным
export function CartProvider({ children }) {
  // Пытаемся достать корзину из памяти браузера (чтобы при обновлении страницы она не пропадала)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Если корзина изменилась — сразу сохраняем её в память браузера
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ФУНКЦИЯ: Добавить в корзину
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Ищем, есть ли уже такой товар в корзине
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Если есть — просто увеличиваем количество на +1
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Если нет — добавляем новый товар, ставим количество 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // ФУНКЦИЯ: Убрать 1 штуку из корзины
  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === productId);
      
      if (existingItem.quantity === 1) {
        // Если осталась 1 штука — удаляем товар вообще
        return prevCart.filter(item => item.id !== productId);
      } else {
        // Иначе просто отнимаем 1
        return prevCart.map(item => 
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
    });
  };

  // ФУНКЦИЯ: Полностью очистить корзину (после успешной оплаты)
  const clearCart = () => {
    setCart([]);
  };

  // Вычисляем общую сумму и количество товаров (чтобы показывать в шапке)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (parseFloat(item.final_price || item.price) * item.quantity), 0);

  return (
    // 3. Раздаем все эти данные и функции наружу
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}