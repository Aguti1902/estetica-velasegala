import { adminTheme as t, uiInput } from './adminTheme'
import { DATE_PRESETS } from './dateRange'

export default function DateRangeFilter({
  preset,
  from,
  to,
  onPreset,
  onFrom,
  onTo,
  compact = false,
}) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      alignItems: 'center',
      padding: compact ? '8px 10px' : '10px 12px',
      background: t.cardBg,
      border: `1px solid ${t.border}`,
      borderRadius: t.radiusLg,
      boxShadow: t.shadow,
    }}
    >
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: t.textMuted,
        marginRight: 4,
      }}
      >
        Periodo
      </span>
      {DATE_PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onPreset(p.id)}
          style={{
            padding: '5px 11px',
            borderRadius: t.radiusPill,
            border: `1px solid ${preset === p.id ? t.text : t.borderStrong}`,
            background: preset === p.id ? t.text : '#fff',
            color: preset === p.id ? '#fff' : t.textMuted,
            fontSize: 12,
            fontWeight: 650,
            cursor: 'pointer',
            fontFamily: t.font,
          }}
        >
          {p.label}
        </button>
      ))}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.textMuted }}>
          Desde
          <input
            type="date"
            value={from}
            onChange={(e) => {
              onFrom(e.target.value)
              onPreset('custom')
            }}
            style={{ ...uiInput, width: 'auto', padding: '6px 10px', fontSize: 12.5 }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.textMuted }}>
          Hasta
          <input
            type="date"
            value={to}
            onChange={(e) => {
              onTo(e.target.value)
              onPreset('custom')
            }}
            style={{ ...uiInput, width: 'auto', padding: '6px 10px', fontSize: 12.5 }}
          />
        </label>
      </div>
    </div>
  )
}
