export function StarDisplay({ value }) {
  return <span title={value}>{'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))} <small>({Number(value).toFixed(1)})</small></span>;
}

export function StarInput({ value, onChange }) {
  return (
    <span className="star-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" className={n <= (value || 0) ? 'on' : ''} onClick={() => onChange(n)} aria-label={`${n} star`}>★</button>
      ))}
    </span>
  );
}
