import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminGiftCardsPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwdError, setPwdError] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | unused | used
  const [updating, setUpdating] = useState(null); // code de la tarjeta en proceso
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchCards = useCallback(async (password = pwd) => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (filter === 'used') query.set('used', 'true');
    if (filter === 'unused') query.set('used', 'false');

    try {
      const res = await fetch(`/api/admin/cards?${query.toString()}`, {
        headers: { 'X-Admin-Password': password },
      });
      if (res.status === 401) { setAuthed(false); return; }
      const data = await res.json();
      setCards(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [pwd, search, filter]);

  useEffect(() => {
    if (authed) fetchCards();
  }, [authed, fetchCards]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Verificar contra la API (si responde 401 no es correcta)
    fetch('/api/admin/cards', { headers: { 'X-Admin-Password': pwd } })
      .then(r => {
        if (r.ok || r.status !== 401) { setAuthed(true); setPwdError(false); }
        else { setPwdError(true); }
      })
      .catch(() => setPwdError(true));
  };

  const toggleUsed = async (card) => {
    setUpdating(card.code);
    try {
      const res = await fetch('/api/admin/cards', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': pwd,
        },
        body: JSON.stringify({
          code: card.code,
          is_used: !card.is_used,
          used_by: 'Clínica',
        }),
      });
      if (res.ok) {
        showToast(card.is_used ? '✓ Tarjeta marcada como disponible' : '✓ Tarjeta marcada como usada');
        await fetchCards();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  // --- LOGIN SCREEN ---
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#1a1a1a', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#222', border: '1px solid #333', borderRadius: '8px',
            padding: '48px', width: '100%', maxWidth: '420px',
          }}
        >
          <p style={{ color: '#c9a882', fontSize: '10px', letterSpacing: '5px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>
            Vela Segalà
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: 'white', textAlign: 'center', marginBottom: '40px' }}>
            Panel Administración
          </h1>
          <form onSubmit={handleLogin}>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setPwdError(false); }}
              placeholder="••••••••"
              autoFocus
              style={{
                width: '100%', padding: '12px 16px', background: '#2d2d2d',
                border: `1px solid ${pwdError ? '#c00' : '#444'}`,
                borderRadius: '4px', color: 'white', fontSize: '16px',
                outline: 'none', marginBottom: '8px', boxSizing: 'border-box',
                fontFamily: 'monospace', letterSpacing: '4px',
              }}
            />
            {pwdError && <p style={{ color: '#e57373', fontSize: '13px', marginBottom: '16px' }}>Contraseña incorrecta</p>}
            <button
              type="submit"
              style={{
                width: '100%', padding: '13px', background: '#c9a882',
                border: 'none', borderRadius: '4px', color: '#1a1a1a',
                fontSize: '12px', fontWeight: 600, letterSpacing: '3px',
                textTransform: 'uppercase', cursor: 'pointer', marginTop: '16px',
              }}
            >
              ACCEDER
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD ---
  const total = cards.length;
  const used = cards.filter(c => c.is_used).length;
  const revenue = cards.reduce((s, c) => s + c.amount, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: 'white' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
              background: '#1a1a1a', border: '1px solid #c9a882', borderRadius: '4px',
              padding: '12px 24px', color: '#c9a882', fontSize: '14px', zIndex: 9999,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ background: '#1a1a1a', borderBottom: '1px solid #222', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#c9a882', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '2px' }}>Panel Admin</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', fontWeight: 400, color: 'white' }}>
            Tarjetas Regalo · Vela Segalà
          </h1>
        </div>
        <button
          onClick={() => setAuthed(false)}
          style={{ background: 'none', border: '1px solid #333', borderRadius: '4px', color: '#888', padding: '8px 16px', cursor: 'pointer', fontSize: '12px' }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Stats */}
      <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        {[
          { label: 'Total vendidas', value: total, sub: 'tarjetas' },
          { label: 'Canjeadas', value: used, sub: `${total ? Math.round(used / total * 100) : 0}% del total` },
          { label: 'Disponibles', value: total - used, sub: 'sin canjear' },
          { label: 'Ingresos totales', value: `${revenue}€`, sub: 'facturado' },
        ].map(s => (
          <div key={s.label} style={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: '8px', padding: '24px' }}>
            <p style={{ color: '#666', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700, color: '#c9a882', marginBottom: '4px' }}>{s.value}</p>
            <p style={{ color: '#555', fontSize: '12px' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div style={{ padding: '0 32px 24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por código, email o nombre..."
          onKeyDown={e => e.key === 'Enter' && fetchCards()}
          style={{
            flex: 1, minWidth: '240px', padding: '10px 16px',
            background: '#1a1a1a', border: '1px solid #333',
            borderRadius: '4px', color: 'white', fontSize: '14px',
            outline: 'none', fontFamily: 'monospace',
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {[['all', 'Todas'], ['unused', 'Disponibles'], ['used', 'Canjeadas']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: '10px 16px', borderRadius: '4px', fontSize: '12px',
                background: filter === val ? '#c9a882' : '#1a1a1a',
                color: filter === val ? '#1a1a1a' : '#888',
                border: `1px solid ${filter === val ? '#c9a882' : '#333'}`,
                cursor: 'pointer', fontWeight: filter === val ? 600 : 400,
                letterSpacing: '1px',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => fetchCards()}
          style={{
            padding: '10px 20px', background: '#222', border: '1px solid #333',
            borderRadius: '4px', color: '#ccc', cursor: 'pointer', fontSize: '12px',
          }}
        >
          ↻ Actualizar
        </button>
      </div>

      {/* Tabla */}
      <div style={{ padding: '0 32px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#555' }}>Cargando...</div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#555', border: '1px solid #222', borderRadius: '8px' }}>
            No se encontraron tarjetas
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Cabecera */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px 120px 180px 120px 120px',
              gap: '16px', padding: '12px 20px',
              fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#555',
            }}>
              <span>Código / Comprador</span>
              <span>Importe</span>
              <span>Estado</span>
              <span>Fecha</span>
              <span>Para</span>
              <span style={{ textAlign: 'center' }}>Acción</span>
            </div>

            {cards.map(card => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 140px 120px 180px 120px 120px',
                  gap: '16px', padding: '16px 20px',
                  background: '#1a1a1a', border: `1px solid ${card.is_used ? '#2a2a2a' : '#2d2d20'}`,
                  borderRadius: '6px', alignItems: 'center',
                  opacity: card.is_used ? 0.6 : 1,
                }}
              >
                <div>
                  <p style={{
                    fontFamily: 'monospace', fontSize: '15px', letterSpacing: '3px',
                    color: card.is_used ? '#555' : '#c9a882', fontWeight: 700, marginBottom: '4px',
                  }}>
                    {card.code}
                  </p>
                  <p style={{ color: '#666', fontSize: '12px' }}>{card.buyer_name}</p>
                  <p style={{ color: '#555', fontSize: '11px' }}>{card.buyer_email}</p>
                </div>

                <div>
                  <span style={{
                    fontFamily: 'Georgia, serif', fontSize: '1.25rem',
                    color: card.is_used ? '#555' : 'white', fontWeight: 700,
                  }}>
                    {card.amount}€
                  </span>
                </div>

                <div>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
                    letterSpacing: '1px', fontWeight: 600,
                    background: card.is_used ? '#1a1a1a' : 'rgba(201,168,130,0.15)',
                    color: card.is_used ? '#555' : '#c9a882',
                    border: `1px solid ${card.is_used ? '#333' : 'rgba(201,168,130,0.3)'}`,
                  }}>
                    {card.is_used ? 'CANJEADA' : 'ACTIVA'}
                  </span>
                </div>

                <div>
                  <p style={{ color: '#888', fontSize: '12px' }}>
                    {new Date(card.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  {card.is_used && card.used_at && (
                    <p style={{ color: '#555', fontSize: '11px' }}>
                      Usada: {new Date(card.used_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </p>
                  )}
                </div>

                <div>
                  <p style={{ color: '#888', fontSize: '13px' }}>
                    {card.recipient_name || '—'}
                  </p>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => toggleUsed(card)}
                    disabled={updating === card.code}
                    style={{
                      padding: '8px 14px', borderRadius: '4px', fontSize: '11px',
                      background: card.is_used ? '#222' : 'rgba(201,168,130,0.2)',
                      color: card.is_used ? '#888' : '#c9a882',
                      border: `1px solid ${card.is_used ? '#333' : 'rgba(201,168,130,0.4)'}`,
                      cursor: updating === card.code ? 'wait' : 'pointer',
                      letterSpacing: '1px', fontWeight: 600, whiteSpace: 'nowrap',
                    }}
                  >
                    {updating === card.code ? '...' : card.is_used ? '↩ Reactivar' : '✓ Marcar usada'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
