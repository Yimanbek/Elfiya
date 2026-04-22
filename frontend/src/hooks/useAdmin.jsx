import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const useAdmin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Если токена нет вообще — пинком на страницу логина
    if (!token) {
      navigate('/login');
      return;
    }

    // Если токен есть, спрашиваем у бэкенда: "А он админ?"
    api.get('profile/')
      .then(res => {
        if (res.data.is_staff) {
          setIsLoading(false); // Всё ок, пускаем!
        } else {
          navigate('/'); // Обычный юзер? Выкидываем на главную!
        }
      })
      .catch(err => {
        console.error("Ошибка проверки:", err);
        navigate('/login'); // Если токен протух — на логин
      });
  }, [navigate]);

  return isLoading;
};
