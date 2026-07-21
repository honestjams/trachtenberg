interface Extras {
  neg: boolean;
  dot: boolean;
  slash: boolean;
  comma: boolean;
}

interface Props {
  extras: Extras;
  onDigit: (d: string) => void;
  onExtra: (key: 'neg' | 'dot' | 'slash' | 'comma') => void;
  onBackspace: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

const EXTRA_KEYS: { id: 'neg' | 'dot' | 'slash' | 'comma'; label: string; hint: string }[] = [
  { id: 'neg', label: '±', hint: 'toggle negative' },
  { id: 'dot', label: '.', hint: 'decimal point' },
  { id: 'slash', label: '/', hint: 'fraction bar' },
  { id: 'comma', label: ',', hint: 'separate answers' },
];

export default function MathKeypad({ extras, onDigit, onExtra, onBackspace, onSubmit, canSubmit }: Props) {
  const activeExtras = EXTRA_KEYS.filter((k) => extras[k.id]);

  return (
    <div className="stepper" style={{ gap: 10 }}>
      {activeExtras.length > 0 && (
        <div className="keypad" style={{ gridTemplateColumns: `repeat(${activeExtras.length}, 1fr)` }}>
          {activeExtras.map((k) => (
            <button
              key={k.id}
              className="key key-extra"
              onClick={() => onExtra(k.id)}
              aria-label={k.hint}
            >
              {k.label}
            </button>
          ))}
        </div>
      )}
      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} className="key" onClick={() => onDigit(d)}>
            {d}
          </button>
        ))}
        <button className="key key-del" onClick={onBackspace} aria-label="delete">
          ⌫
        </button>
        <button className="key" onClick={() => onDigit('0')}>
          0
        </button>
        <button className="key key-ok" onClick={onSubmit} disabled={!canSubmit} aria-label="check answer">
          ✓
        </button>
      </div>
    </div>
  );
}
