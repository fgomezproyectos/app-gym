// ProgressChart.jsx — Usado en: WorkoutsPage
import { useMemo } from 'react';
import { Flame, Activity } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export function ProgressChart({ completedDays }) {
  const { t } = useLanguage();
  const last30Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfMonth = date.getDate();
      const completed = completedDays.some(d => d.date === dateStr);
      days.push({ date: dateStr, dayOfMonth, completed });
    }
    return days;
  }, [completedDays]);

  const completedCount = last30Days.filter(d => d.completed).length;

  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = last30Days.length - 1; i >= 0; i--) {
      if (last30Days[i].completed) streak++;
      else break;
    }
    return streak;
  }, [last30Days]);

  return (
    <section>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            <Activity size={14} />
            {t('workouts')}
          </div>
          <p className="stat-value">{completedCount}</p>
          <p className="stat-sublabel">{t('last30Days')}</p>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ color: '#22c55e' }}>
            <Flame size={14} />
            {t('streak')}
          </div>
          <p className="stat-value">{currentStreak}</p>
          <p className="stat-sublabel">{t('consecutiveDays')}</p>
        </div>
      </div>

      <div className="activity-card">
        <div className="activity-card-header">
          <h2>{t('activity')}</h2>
          <div className="activity-legend">
            <span>{t('less')}</span>
            <div className="legend-squares">
              <div className="legend-sq empty" />
              <div className="legend-sq done" style={{ opacity: 0.4 }} />
              <div className="legend-sq done" style={{ opacity: 0.7 }} />
              <div className="legend-sq done" />
            </div>
            <span>{t('more')}</span>
          </div>
        </div>

        <div className="heatmap-grid">
          {last30Days.map(day => (
            <div
              key={day.date}
              className={`heatmap-day${day.completed ? ' done' : ''}`}
              title={`${day.dayOfMonth} — ${day.completed ? t('done') : t('rest')}`}
            />
          ))}
        </div>

        <div className="heatmap-labels">
          <span>{t('last30DaysAgo')}</span>
          <span>{t('today')}</span>
        </div>
      </div>
    </section>
  );
}
