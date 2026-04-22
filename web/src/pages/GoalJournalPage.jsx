import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Calendar, Grid3x3, Menu } from 'lucide-react';
import { getDailyGoalsByDateRange } from '../services/api';
import { useSidebar } from '../components/ProtectedLayout';
import { useLanguage } from '../hooks/useLanguage';
import './GoalJournalPage.css';
import '../styles/general.css';

const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// Función para obtener nombres de días y meses según el idioma
const getLocalizedDateData = (language) => {
  const dateFormatMap = {
    es: {
      daysShort: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
      daysFull: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    },
    en: {
      daysShort: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      daysFull: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    de: {
      daysShort: ['M', 'D', 'M', 'D', 'F', 'S', 'S'],
      daysFull: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
      months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
    },
    pt: {
      daysShort: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
      daysFull: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
      months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    },
    fr: {
      daysShort: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      daysFull: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    },
    it: {
      daysShort: ['L', 'M', 'M', 'G', 'V', 'S', 'D'],
      daysFull: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'],
      months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
    },
    ru: {
      daysShort: ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'],
      daysFull: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
      months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    },
    ja: {
      daysShort: ['月', '火', '水', '木', '金', '土', '日'],
      daysFull: ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'],
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    ko: {
      daysShort: ['월', '화', '수', '목', '금', '토', '일'],
      daysFull: ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'],
      months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    },
    zh: {
      daysShort: ['一', '二', '三', '四', '五', '六', '日'],
      daysFull: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    'zh-TW': {
      daysShort: ['一', '二', '三', '四', '五', '六', '日'],
      daysFull: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    ar: {
      daysShort: ['ن', 'ث', 'ع', 'خ', 'ج', 'س', 'أ'],
      daysFull: ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
      months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    },
    pl: {
      daysShort: ['P', 'W', 'Ś', 'C', 'P', 'S', 'N'],
      daysFull: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'],
      months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
    },
    nl: {
      daysShort: ['M', 'D', 'W', 'D', 'V', 'Z', 'Z'],
      daysFull: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'],
      months: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']
    },
    sv: {
      daysShort: ['M', 'T', 'O', 'T', 'F', 'L', 'S'],
      daysFull: ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'],
      months: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December']
    }
  };
  return dateFormatMap[language] || dateFormatMap.es;
};

export default function GoalJournalPage() {
  const openSidebar = useSidebar();
  const { t, language } = useLanguage();
  const dateData = getLocalizedDateData(language);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyGoals, setDailyGoals] = useState([]);
  const [weeklyData, setWeeklyData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('detail'); // 'detail', 'weekly', 'monthly'

  // Formatea una fecha a "YYYY-MM-DD" en zona horaria local (sin conversión a UTC)
  function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Cargar goals del día seleccionado
  useEffect(() => {
    loadDailyGoals();
    if (viewMode === 'weekly') loadWeeklyData();
    if (viewMode === 'monthly') loadMonthlyData();
  }, [selectedDate, viewMode, language]);

  const loadDailyGoals = async () => {
    try {
      setLoading(true);
      const dateStr = toLocalDateString(selectedDate);
      const data = await getDailyGoalsByDateRange(dateStr, dateStr);
      setDailyGoals(data || []);
      setError('');
    } catch (err) {
      setError('Error cargando goals del día');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyData = async () => {
    try {
      const today = new Date(selectedDate);
      const dow = today.getDay();
      const mondayOffset = dow === 0 ? -6 : 1 - dow;
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);
      
      const startStr = toLocalDateString(monday);
      const endDate = new Date(monday);
      endDate.setDate(endDate.getDate() + 6);
      const endStr = toLocalDateString(endDate);
      
      const data = await getDailyGoalsByDateRange(startStr, endStr);
      
      // Agrupar por fecha
      const byDate = {};
      data.forEach(goal => {
        if (!byDate[goal.date]) byDate[goal.date] = [];
        byDate[goal.date].push(goal);
      });
      
      setWeeklyData(byDate);
    } catch (err) {
      console.error('Error cargando datos semanales:', err);
    }
  };

  const loadMonthlyData = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const startStr = toLocalDateString(startDate);
      const endStr = toLocalDateString(endDate);
      
      const data = await getDailyGoalsByDateRange(startStr, endStr);
      
      // Agrupar por fecha
      const byDate = {};
      data.forEach(goal => {
        if (!byDate[goal.date]) byDate[goal.date] = [];
        byDate[goal.date].push(goal);
      });
      
      setMonthlyData(byDate);
    } catch (err) {
      console.error('Error cargando datos mensuales:', err);
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const isToday =
    selectedDate.toDateString() === new Date().toDateString();
  const isFuture = selectedDate > new Date();

  const completedCount = dailyGoals.filter(g => g.done).length;
  const totalCount = dailyGoals.length;

  const formatDate = (date) => {
    const dayName = dateData.daysFull[date.getDay() === 0 ? 6 : date.getDay() - 1];
    const monthName = dateData.months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${dayName}, ${day} ${t('dateOf')} ${monthName} ${t('dateOf')} ${year}`;
  };

  // Para vista semanal
  const getWeekDays = () => {
    const today = new Date(selectedDate);
    const dow = today.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  // Para vista mensual
  const getMonthDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDow = firstDay.getDay();
    
    const days = [];
    // Días del mes anterior
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startDow === 0 ? 6 : startDow - 1; i > 0; i--) {
      days.push(new Date(year, month - 1, daysInPrevMonth - i + 1));
    }
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    // Días del próximo mes
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  };

  return (
    <div className="goal-journal-page">
      <div className="goal-journal-header">
        <div className="goal-journal-title-section">
          <BookOpen size={24} />
          <h1>{t('goalJournalTitle')}</h1>
        </div>
        <button className="btn-menu-trigger" onClick={openSidebar} aria-label={t('logout')}>
          <Menu size={22} />
        </button>
      </div>

      {error && <div className="goal-journal-error">{error}</div>}

      {/* View Mode Toggle */}
      <div className="goal-journal-view-toggle">
        <button
          className={`toggle-btn ${viewMode === 'detail' ? 'active' : ''}`}
          onClick={() => setViewMode('detail')}
          title={t('detailView')}
        >
          <BookOpen size={16} />
          {t('detailView')}
        </button>
        <button
          className={`toggle-btn ${viewMode === 'weekly' ? 'active' : ''}`}
          onClick={() => setViewMode('weekly')}
          title={t('weeklyView')}
        >
          <Calendar size={16} />
          {t('weeklyView')}
        </button>
        <button
          className={`toggle-btn ${viewMode === 'monthly' ? 'active' : ''}`}
          onClick={() => setViewMode('monthly')}
          title={t('monthlyView')}
        >
          <Grid3x3 size={16} />
          {t('monthlyView')}
        </button>
      </div>

      {/* Detail View */}
      {viewMode === 'detail' && (
        <>
          <div className="goal-journal-date-selector">
            <button
              className="goal-journal-nav-btn"
              onClick={handlePreviousDay}
              title={t('previousDay')}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="goal-journal-date-display">
              <h2>{formatDate(selectedDate)}</h2>
              {isToday && <span className="goal-journal-today-badge">{t('today')}</span>}
            </div>

            <button
              className="goal-journal-nav-btn"
              onClick={handleNextDay}
              title={t('nextDay')}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {loading ? (
            <div className="goal-journal-loading">{t('loading')}</div>
          ) : (
            <div className="goal-journal-content">
              <div className="goal-journal-summary">
                <div className="goal-journal-summary-card">
                  <div className="goal-journal-summary-ring">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" className="goal-journal-ring-background" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        className="goal-journal-ring-fill"
                        style={{
                          strokeDasharray: `${
                            totalCount > 0 ? (completedCount / totalCount) * 282.6 : 0
                          } 282.6`
                        }}
                      />
                    </svg>
                    <div className="goal-journal-summary-text">
                      {totalCount === 0 ? (
                        <span className="goal-journal-completed">{t('noGoals')}</span>
                      ) : (
                        <>
                          <span className="goal-journal-completed">{completedCount}</span>
                          <span className="goal-journal-total">/{totalCount}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="goal-journal-summary-label">
                    {totalCount === 0
                      ? t('noGoals')
                      : `${completedCount} ${t('ofCompleted')} ${totalCount} ${t('completed')}`}
                  </p>
                </div>
              </div>

              {totalCount === 0 ? (
                <div className="goal-journal-empty">
                  <p>{t('noGoalsRegistered')}</p>
                </div>
              ) : (
                <div className="goal-journal-list">
                  {dailyGoals.map(goal => (
                    <div
                      key={goal.id}
                      className={`goal-journal-item ${goal.done ? 'completed' : 'incomplete'}`}
                    >
                      <div className="goal-journal-item-check">
                        {goal.done && <span className="goal-journal-checkmark">✓</span>}
                      </div>
                      <div className="goal-journal-item-content">
                        <span className="goal-journal-item-label">{goal.label}</span>
                        <span className="goal-journal-item-status">
                          {goal.done ? t('completedStatus') : t('notCompleted')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Weekly View */}
      {viewMode === 'weekly' && (
        <>
          <div className="goal-journal-date-selector">
            <button
              className="goal-journal-nav-btn"
              onClick={handlePreviousWeek}
              title={t('previousWeek')}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="goal-journal-date-display">
              <h2>{t('weekOf')} {getWeekDays()[0].getDate()} {t('next')} {getWeekDays()[6].getDate()}</h2>
            </div>

            <button
              className="goal-journal-nav-btn"
              onClick={handleNextWeek}
              title={t('nextWeek')}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="goal-journal-weekly-grid">
            {getWeekDays().map((day, idx) => {
              const dateStr = toLocalDateString(day);
              const dayGoals = weeklyData[dateStr] || [];
              const completed = dayGoals.filter(g => g.done).length;
              const total = dayGoals.length;
              const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
              const isCurrentDay = day.toDateString() === new Date().toDateString();
              const isFuture = day > new Date();
              const isCompleted = total > 0 && completed === total;
              const hasIncomplete = total > 0 && completed < total;

              return (
                <div 
                  key={dateStr} 
                  className={`weekly-day-cell ${isCurrentDay ? 'is-today' : ''} ${isCompleted ? 'border-complete' : ''} ${hasIncomplete ? 'border-incomplete' : ''}`}
                  onClick={() => {
                    if (!isFuture) {
                      setSelectedDate(day);
                      setViewMode('detail');
                    }
                  }}
                  style={{ cursor: !isFuture ? 'pointer' : 'default' }}
                >
                  <div className="weekly-day-label">{dateData.daysShort[idx]}</div>
                  <div className="weekly-day-number">{day.getDate()}</div>
                  <div className="weekly-day-indicator">
                    {total === 0 ? (
                      <span className="weekly-empty">-</span>
                    ) : (
                      <>
                        <div className="weekly-bar-bg">
                          <div className="weekly-bar-fill" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="weekly-percentage">{percentage}%</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Monthly View */}
      {viewMode === 'monthly' && (
        <>
          <div className="goal-journal-date-selector">
            <button
              className="goal-journal-nav-btn"
              onClick={handlePreviousMonth}
              title={t('previousMonth')}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="goal-journal-date-display">
              <h2>{dateData.months[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h2>
            </div>

            <button
              className="goal-journal-nav-btn"
              onClick={handleNextMonth}
              title={t('nextMonth')}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="goal-journal-monthly-calendar">
            <div className="calendar-weekdays">
              {dateData.daysFull.map(day => (
                <div key={day} className="calendar-weekday">{day.slice(0, 3)}</div>
              ))}
            </div>
            <div className="calendar-grid">
              {getMonthDays().map((day, idx) => {
                const dateStr = toLocalDateString(day);
                const dayGoals = monthlyData[dateStr] || [];
                const completed = dayGoals.filter(g => g.done).length;
                const total = dayGoals.length;
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                const isCurrentDay = day.toDateString() === new Date().toDateString();
                const isFuture = day > new Date();
                const hasData = total > 0;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                const isCompleted = hasData && completed === total;
                const hasIncomplete = hasData && completed < total;

                return (
                  <div
                    key={idx}
                    className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'is-today' : ''} ${isCompleted ? 'border-complete' : ''} ${hasIncomplete ? 'border-incomplete' : ''}`}
                    onClick={() => {
                      if (isCurrentMonth && !isFuture) {
                        setSelectedDate(day);
                        setViewMode('detail');
                      }
                    }}
                    style={{ cursor: isCurrentMonth && !isFuture ? 'pointer' : 'default' }}
                  >
                    <div className="calendar-day-number">{day.getDate()}</div>
                    {hasData && (
                      <div className="calendar-day-indicator">
                        <span className="calendar-percentage">{percentage}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
