import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { GRADES, topicById, topicsForGrade } from '../../math/curriculum';
import { answerText } from '../../math/grading';

export default function TopicLesson() {
  const { id } = useParams();
  const topic = id ? topicById(id) : undefined;
  const [state, setState] = useState(() =>
    topic ? { id: topic.id, q: topic.generate() } : null
  );

  if (!topic) return <Navigate to="/math" replace />;
  // regenerate when navigating to a different topic (same component instance)
  if (!state || state.id !== topic.id) {
    setState({ id: topic.id, q: topic.generate() });
    return null;
  }
  const example = state.q;
  const setExample = (q: ReturnType<typeof topic.generate>) =>
    setState({ id: topic.id, q });

  const grade = GRADES.find((g) => g.grade === topic.grade)!;
  const siblings = topicsForGrade(topic.grade);
  const index = siblings.findIndex((t) => t.id === topic.id);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index < siblings.length - 1 ? siblings[index + 1] : null;

  return (
    <div className="page" key={topic.id}>
      <Link to={`/math/grade/${topic.grade}`} className="back-link">
        ‹ {grade.name}
      </Link>

      <div className="tagline-banner">
        <div className="eyebrow">{topic.title}</div>
        <h2>{topic.tagline}</h2>
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          The concept
        </div>
        <div className="rule-statement">
          {topic.concept.map((line, i) => (
            <div className="line" key={i}>
              <span className="when">{line.when}</span>
              <span className="what">{line.what}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          Worked example
        </div>
        <div className="step-explain">
          <div className="problem-math">{example.prompt}</div>
          {example.instruction && (
            <div className="step-count">{example.instruction}</div>
          )}
          <ol className="square-lines">
            {example.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <div className="step-outcome">
            <span className="write">Answer: {answerText(example.spec)}</span>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 12 }}
          onClick={() => setExample(topic.generate())}
        >
          🎲 Another example
        </button>
      </div>

      <Link to={`/math/practice?t=${topic.id}`} className="btn btn-warm btn-block">
        ⚡ Practice {topic.title.toLowerCase()}
      </Link>

      <div className="action-grid">
        {prev ? (
          <Link to={`/math/topic/${prev.id}`} className="btn btn-ghost">
            ‹ {prev.title}
          </Link>
        ) : (
          <Link to={`/math/grade/${topic.grade}`} className="btn btn-ghost">
            ‹ Topics
          </Link>
        )}
        {next ? (
          <Link to={`/math/topic/${next.id}`} className="btn btn-ghost">
            {next.title} ›
          </Link>
        ) : (
          <Link to={`/math/practice?g=${topic.grade}`} className="btn btn-ghost">
            Practice ›
          </Link>
        )}
      </div>
    </div>
  );
}
