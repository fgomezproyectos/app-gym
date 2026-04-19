import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Calendar, Grid3x3 } from 'lucide-react';
import { getDailyGoalsByDateRange } from '../services/api';
import './GoalJournalPage.css';

const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function GoalJournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyGoals, setDailyGoals] = useState([]);
  const [weeklyData, setWeeklyData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('detail'); // 'detail', 'weekly', 'monthly'

  // Cargar goals del día seleccionado
  useEffect(() => {
    loadDailyGoals();
    if (viewMode === 'weekly') loadWeeklyData();
    if (viewMode === 'monthly') loadMonthlyData();
  }, [selectedDate, viewMode]);

  const loadDailyGoals = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
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
      
      const startStr = monday.toISOString().split('T')[0];
      const endDate = new Date(monday);
      endDate.setDate(endDate.getDate() + 6);
      const endStr = endDate.toISOString().split('T')[0];
      
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
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
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
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const isToday =
    selectedDate.toDateString() === new Date().toDateString();
  const isFuture = selectedDate > new Date();

  const completedCount = dailyGoals.filter(g => g.done).length;
  const totalCount = dailyGoals.length;

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <h1>Diario de Goals</h1>
        </div>
        <p className="goal-journal-subtitle">Historial de tus objetivos completados</p>
      </div>

      {error && <div className="goal-journal-error">{error}</div>}

      {/* View Mode Toggle */}
      <div className="goal-journal-view-toggle">
        <button
          className={`toggle-btn ${viewMode === 'detail' ? 'active' : ''}`}
          onClick={() => setViewMode('detail')}
          title="Vista detallada"
        >
          <BookOpen size={16} />
          Detalle
        </button>
        <button
          className={`toggle-btn ${viewMode === 'weekly' ? 'active' : ''}`}
          onClick={() => setViewMode('weekly')}
          title="Vista semanal"
        >
          <Calendar size={16} />
          Semanal
        </button>
        <button
          className={`toggle-btn ${viewMode === 'monthly' ? 'active' : ''}`}
          onClick={() => setViewMode('monthly')}
          title="Vista mensual"
        >
          <Grid3x3 size={16} />
          Mensual
        </button>
      </div>

      {/* Detail View */}
      {viewMode === 'detail' && (
        <>
          <div className="goal-journal-date-selector">
            <button
              className="goal-journal-nav-btn"
              onClick={handlePreviousDay}
              title="Día anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="goal-journal-date-display">
              <h2>{formatDate(selectedDate)}</h2>
              {isToday && <span className="goal-journal-today-badge">Hoy</span>}
              {isFuture && <span className="goal-journal-future-badge">Futuro</span>}
            </div>

            <button
              className="goal-journal-nav-btn"
              onClick={handleNextDay}
              disabled={isFuture}
              title="Día siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {loading ? (
            <div className="goal-journal-loading">Cargando...</div>
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
                        <span className="goal-journal-completed">Sin</span>
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
                      ? 'Sin goals'
                      : `${completedCount} de ${totalCount} completados`}
                  </p>
                </div>
              </div>

              {totalCount === 0 ? (
                <div className="goal-journal-empty">
                  <p>No hay goals registrados para este día</p>
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
                          {goal.done ? 'Completado' : 'No completado'}
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
              title="Semana anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="goal-journal-date-display">
              <h2>Semana del {formatDate(getWeekDays()[0]).split(',')[0]}</h2>
            </div>

            <button
              className="goal-journal-nav-btn"
              onClick={handleNextWeek}
              disabled={getWeekDays()[6] > new Date()}
              title="Próxima semana"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="goal-journal-weekly-grid">
            {getWeekDays().map((day, idx) => {
              const dateStr = day.toISOString().split('T')[0];
              const dayGoals = weeklyData[dateStr] || [];
              const completed = dayGoals.filter(g => g.done).length;
              const total = dayGoals.length;
              const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
              const isCurrentDay = day.toDateString() === new Date().toDateString();

              return (
                <div key={dateStr} className={`weekly-day-cell ${isCurrentDay ? 'is-today' : ''}`}>
                  <div className="weekly-day-label">{DAYS_SHORT[idx]}</div>
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
              title="Mes anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="goal-journal-date-display">
              <h2>{MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h2>
            </div>

            <button
              className="goal-journal-nav-btn"
              onClick={handleNextMonth}
              disabled={new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1) > new Date()}
              title="Próximo mes"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="goal-journal-monthly-calendar">
            <div className="calendar-weekdays">
              {DAYS_FULL.map(day => (
                <div key={day} className="calendar-weekday">{day.slice(0, 3)}</div>
              ))}
            </div>
            <div className="calendar-grid">
              {getMonthDays().map((day, idx) => {
                const dateStr = day.toISOString().split('T')[0];
                const dayGoals = monthlyData[dateStr] || [];
                const completed = dayGoals.filter(g => g.done).length;
                const total = dayGoals.length;
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                const isCurrentDay = day.toDateString() === new Date().toDateString();
                const hasData = total > 0;
                const isCompleted = hasData && completed === total;

                return (
                  <div
                    key={idx}
                    className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'is-today' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    <div className="calendar-day-number">{day.getDate()}</div>
                    {hasData && (
                      <div className="calendar-day-indicator">
                        {isCompleted ? (
                          <span className="calendar-checkmark">✓</span>
                        ) : (
                          <span className="calendar-dot" />
                        )}
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
