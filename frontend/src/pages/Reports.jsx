import { useState } from 'react';
import api from '../api/axios';
import * as XLSX from 'xlsx'; // ИМПОРТИРУЕМ БИБЛИОТЕКУ EXCEL

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { id: 'revenue', title: 'Доходы и выручка', desc: 'Полный финансовый отчет по кассе', icon: '💰', needsDates: true },
    { id: 'popular_items', title: 'Популярные блюда', desc: 'Топ продаж по позициям меню', icon: '🍕', needsDates: true },
    { id: 'popular_menu', title: 'Топ категорий', desc: 'Какие разделы меню приносят прибыль', icon: '🍔', needsDates: true },
    { id: 'customer_activity', title: 'Активность клиентов', desc: 'Рейтинг клиентов по чистой прибыли', icon: '👑', needsDates: true },
    { id: 'neactive_client', title: 'Спящие клиенты', desc: 'Зарегистрировались, но ничего не купили', icon: '😴', needsDates: false },
  ];

  const handleFetchReport = async () => {
    if (selectedReport.needsDates && (!dates.start || !dates.end)) {
      return alert('Выбери даты, бро!');
    }
    
    setLoading(true);
    try {
      const res = await api.get(`${selectedReport.id}/`, { 
        params: selectedReport.needsDates ? dates : {} 
      });
      setReportData(res.data.data); 
    } catch (err) {
      console.error(err);
      alert('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  // ФУНКЦИЯ ВЫГРУЗКИ В EXCEL
  const exportToExcel = () => {
    if (!reportData || reportData.length === 0) return;

    // 1. Создаем новый лист из наших JSON данных
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    
    // 2. Создаем новую книгу (файл)
    const workbook = XLSX.utils.book_new();
    
    // 3. Добавляем лист в книгу
    XLSX.utils.book_append_sheet(workbook, worksheet, "Отчет");
    
    // 4. Генерируем красивое имя файла с датой
    const today = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
    const fileName = `Elfiya_${selectedReport.id}_${today}.xlsx`;

    // 5. Сохраняем файл на компьютер юзера
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="container mt-5 mb-5 pb-5">
      <h2 className="brand-font text-dark mb-5 text-center">📊 Аналитический центр Elfiya</h2>

      {/* СЕТКА ИКОНОК-ОТЧЕТОВ */}
      {!selectedReport && (
        <div className="row g-4">
          {reportTypes.map((item) => (
            <div key={item.id} className="col-md-6 col-lg-4">
              <div 
                className="card h-100 border-0 shadow-sm text-center p-4 transition-hover cursor-pointer" 
                style={{ borderRadius: '25px', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedReport(item);
                  setDates({ start: '', end: '' });
                }}
              >
                <div className="display-3 mb-3">{item.icon}</div>
                <h5 className="fw-bold">{item.title}</h5>
                <p className="small text-muted mb-0">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ФОРМА ВЫБОРКИ */}
      {selectedReport && !reportData && (
        <div className="card border-0 shadow-lg p-5 rounded-4 animate__animated animate__fadeIn">
          <button className="btn btn-link text-muted text-decoration-none mb-3 p-0 text-start w-auto" onClick={() => setSelectedReport(null)}>← Назад к отчетам</button>
          
          <h3 className="fw-bold mb-4 text-center">{selectedReport.icon} {selectedReport.title}</h3>
          
          <div className="row g-3 justify-content-center align-items-end">
            {selectedReport.needsDates ? (
              <>
                <div className="col-md-4">
                  <label className="small fw-bold text-muted">С какой даты:</label>
                  <input type="date" className="form-control rounded-pill border-0 bg-light p-3" value={dates.start} onChange={e => setDates({ ...dates, start: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold text-muted">По какую дату:</label>
                  <input type="date" className="form-control rounded-pill border-0 bg-light p-3" value={dates.end} onChange={e => setDates({ ...dates, end: e.target.value })} />
                </div>
              </>
            ) : (
              <div className="col-12 text-center mb-3">
                <p className="text-muted">Этот отчет выгружает данные за всё время.</p>
              </div>
            )}
            
            <div className="col-md-4 text-center">
              <button className="btn btn-elf w-100 rounded-pill fw-bold p-3" onClick={handleFetchReport} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Выгрузить данные'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ОТОБРАЖЕНИЕ ДАННЫХ */}
      {reportData && (
        <div className="card border-0 shadow-sm p-4 rounded-4 animate__animated animate__fadeIn">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h4 className="fw-bold mb-0">{selectedReport.icon} Результаты: {selectedReport.title}</h4>
            
            <div className="d-flex gap-2">
              {/* НОВАЯ КНОПКА ЭКСПОРТА В EXCEL */}
              {reportData.length > 0 && (
                <button 
                  className="btn btn-success btn-sm rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2" 
                  onClick={exportToExcel}
                >
                  <span>📗</span> Скачать Excel
                </button>
              )}
              
              <button className="btn btn-outline-secondary btn-sm rounded-pill px-4" onClick={() => setReportData(null)}>Новый запрос</button>
            </div>
          </div>
          
          {reportData.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <h5>📭 За этот период нет данных</h5>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    {Object.keys(reportData[0]).map(key => (
                      <th key={key} className="text-uppercase small text-muted">{key.replace(/_/g, ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="fw-medium">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}