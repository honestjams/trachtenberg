import { Link, Navigate, useParams } from 'react-router-dom';
import { GRADES, topicsForGrade } from '../../math/curriculum';
import { loadMathStats, mathMasteryFor } from '../../lib/storage';

export default function GradePage() {
  const { grade } = useParams();
  const g = GRADES.find((x) => x.grade === Number(grade));
  const stats = loadMathStats();
  if (!g) return <Navigate to="/math" replace />;
  const topics = topicsForGrade(g.grade);

  return (
    <div className="page">
      <Link to="/math" className="back-link">
        ‹ All grades
      </Link>

      <div className="tagline-banner">
        <div className="eyebrow">{g.name}</div>
        <h2>{g.blurb}</h2>
      </div>

      <div className="rule-list">
        {topics.map((t) => {
          const mastery = mathMasteryFor(stats, t.id);
          const record = stats.byTopic[t.id];
          return (
            <Link
              key={t.id}
              to={`/math/topic/${t.id}`}
              className={`rule-row${mastery === 'mastered' ? ' mastered' : ''}`}
            >
              <div className="rule-num">{mastery === 'mastered' ? '★' : mastery === 'learning' ? '…' : '·'}</div>
              <div className="meta">
                <h3>{t.title}</h3>
                <p>
                  {t.tagline}
                  {record && record.total > 0
                    ? ` · ${record.correct}/${record.total} right`
                    : ''}
                </p>
              </div>
              <span className="chev">›</span>
            </Link>
          );
        })}
      </div>

      <Link to={`/math/practice?g=${g.grade}`} className="btn btn-warm btn-block">
        ⚡ Practice all of {g.name.split(' ·')[0].toLowerCase()}
      </Link>
    </div>
  );
}
