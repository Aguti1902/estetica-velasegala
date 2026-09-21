import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { getStoredAdminPassword, setStoredAdminPassword, adminFetch } from '../admin/useAdminAuth';
import AdminLogin from '../admin/AdminLogin';
import { adminTheme as th } from '../admin/adminTheme';

export default function AdminGiftCardsPage() {
  const { pwd: shellPwd } = useOutletContext() || {};
  const embedded = Boolean(shellPwd);
  const [authed, setAuthed] = useState(() => embedded || Boolean(getStoredAdminPassword()));
  const [pwd, setPwd] = useState(() => shellPwd || getStoredAdminPassword());
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
      const res = await adminFetch(`/api/admin/cards?${query.toString()}`, password);
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

  const toggleUsed = async (card) => {
    setUpdating(card.code);
    try {
      const res = await adminFetch('/api/admin/cards', pwd, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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

  useEffect(() => {
    if (shellPwd) {
      setPwd(shellPwd);
      setAuthed(true);
    }
  }, [shellPwd]);

  const verifyCardsLogin = async (password) => {
    setPwd(password);
    const r = await adminFetch('/api/admin/cards', password);
    if (r.status === 401) {
      setPwdError(true);
      setAuthed(false);
      setStoredAdminPassword('');
      return false;
    }
    setAuthed(true);
    setPwdError(false);
    setStoredAdminPassword(password);
    return true;
  };

  // --- LOGIN SCREEN ---
  if (!embedded && !authed) {
    return (
      <AdminLogin
        onSubmit={verifyCardsLogin}
        pwdError={pwdError}
        setPwdError={setPwdError}
      />
    );
  }

  // --- DASHBOARD ---
  const total = cards.length;
  const used = cards.filter(c => c.is_used).length;
  const revenue = cards.reduce((s, c) => s + c.amount, 0);

  const body = (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
              background: th.pageBg, border: `1px solid ${th.text}`, borderRadius: '4px',
              padding: '12px 24px', color: th.text, fontSize: '14px', zIndex: 9999,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {!embedded && (
        <div style={{ background: th.pageBg, borderBottom: `1px solid ${th.border}`, padding: '16px clamp(16px, 4vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <img src="/logo.png" alt="Estetica Segala" style={{ height: '48px', width: 'auto' }} />
          <button
            onClick={() => { setAuthed(false); setStoredAdminPassword(''); }}
            style={{ background: th.pageBg, border: `1px solid ${th.border}`, borderRadius: '4px', color: th.textMuted, padding: '8px 16px', cursor: 'pointer', fontSize: '12px' }}
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {embedded && (
        <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.75rem', marginBottom: '16px', color: th.text }}>
          Tarjetas regalo
        </h2>
      )}

      <div style={{
        marginBottom: '24px', padding: '14px 18px', background: th.subtleBg, border: `1px solid ${th.border}`,
        borderRadius: '6px', fontSize: '13px', color: th.textMuted, lineHeight: 1.55, maxWidth: embedded ? 'none' : '1200px',
        margin: embedded ? '0 0 24px' : '0 auto 24px', paddingLeft: embedded ? '18px' : undefined,
        paddingRight: embedded ? '18px' : undefined,
        width: embedded ? 'auto' : 'calc(100% - clamp(32px, 8vw, 64px))',
      }}>
        <strong style={{ color: th.text }}>Conectado con Stripe.</strong>{' '}
        Cuando un cliente paga en la web, Stripe avisa automáticamente y aquí aparece la tarjeta con su código.
        Solo tienes que marcarla como usada cuando la canjeéis en clínica.{' '}
        <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noreferrer" style={{ color: th.text, fontWeight: 600 }}>
          Ver pagos en Stripe ↗
        </a>
      </div>

      {/* Stats */}
      <div style={{ padding: embedded ? '0 0 24px' : 'clamp(16px, 3vw, 32px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', maxWidth: embedded ? 'none' : '1200px', margin: '0 auto' }}>
        {[
          { label: 'Total vendidas', value: total, sub: 'tarjetas' },
          { label: 'Canjeadas', value: used, sub: `${total ? Math.round(used / total * 100) : 0}% del total` },
          { label: 'Disponibles', value: total - used, sub: 'sin canjear' },
          { label: 'Ingresos totales', value: `${revenue}€`, sub: 'facturado' },
        ].map(s => (
          <div key={s.label} style={{ background: th.cardBg, border: `1px solid ${th.border}`, borderRadius: '8px', padding: '24px' }}>
            <p style={{ color: th.textMuted, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700, color: th.text, marginBottom: '4px' }}>{s.value}</p>
            <p style={{ color: th.textMuted, fontSize: '12px' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div style={{ padding: embedded ? '0 0 24px' : '0 clamp(16px, 4vw, 32px) 24px', maxWidth: embedded ? 'none' : '1200px', margin: '0 auto', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por código, email o nombre..."
          onKeyDown={e => e.key === 'Enter' && fetchCards()}
          style={{
            flex: 1, minWidth: '240px', padding: '10px 16px',
            background: th.inputBg, border: `1px solid ${th.border}`,
            borderRadius: '4px', color: th.text, fontSize: '14px',
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
                background: filter === val ? th.text : th.pageBg,
                color: filter === val ? '#fff' : th.textMuted,
                border: `1px solid ${th.border}`,
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
            padding: '10px 20px', background: th.pageBg, border: `1px solid ${th.border}`,
            borderRadius: '4px', color: th.text, cursor: 'pointer', fontSize: '12px',
          }}
        >
          ↻ Actualizar
        </button>
      </div>

      {/* Tabla / Cards */}
      <div style={{ padding: embedded ? '0 0 24px' : '0 clamp(16px, 4vw, 32px) 48px', maxWidth: embedded ? 'none' : '1200px', margin: '0 auto' }}>
        <style>{`
          .admin-table-header { display: grid; grid-template-columns: 1fr 140px 120px 180px 120px 120px; }
          .admin-table-row { display: grid; grid-template-columns: 1fr 140px 120px 180px 120px 120px; }
          @media (max-width: 900px) {
            .admin-table-header { display: none; }
            .admin-table-row { display: flex !important; flex-direction: column; gap: 12px !important; }
            .admin-row-action { text-align: left !important; }
          }
        `}</style>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: th.textMuted }}>Cargando...</div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: th.textMuted, border: `1px solid ${th.border}`, borderRadius: '8px' }}>
            No se encontraron tarjetas
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Cabecera — solo visible en desktop */}
            <div className="admin-table-header" style={{
              gap: '16px', padding: '12px 20px',
              fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: th.textMuted,
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
                className="admin-table-row"
                style={{
                  gap: '16px', padding: '16px 20px',
                  background: th.cardBg, border: `1px solid ${card.is_used ? th.border : th.accent}`,
                  borderRadius: '6px', alignItems: 'center',
                  opacity: card.is_used ? 0.65 : 1,
                }}
              >
                <div>
                  <p style={{
                    fontFamily: 'monospace', fontSize: '15px', letterSpacing: '2px',
                    color: card.is_used ? th.textMuted : th.text, fontWeight: 700, marginBottom: '4px', wordBreak: 'break-all',
                  }}>
                    {card.code}
                  </p>
                  <p style={{ color: th.textMuted, fontSize: '12px' }}>{card.buyer_name}</p>
                  <p style={{ color: th.textMuted, fontSize: '11px' }}>{card.buyer_email}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: th.textMuted, fontSize: '11px', display: 'none' }} className="admin-mobile-label">Importe:</span>
                  <span style={{
                    fontFamily: 'Georgia, serif', fontSize: '1.25rem',
                    color: card.is_used ? th.textMuted : th.text, fontWeight: 700,
                  }}>
                    {card.amount}€
                  </span>
                </div>

                <div>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
                    letterSpacing: '1px', fontWeight: 600,
                    background: card.is_used ? th.subtleBg : 'rgba(201,168,130,0.2)',
                    color: card.is_used ? th.textMuted : th.text,
                    border: `1px solid ${card.is_used ? th.border : th.accent}`,
                  }}>
                    {card.is_used ? 'CANJEADA' : 'ACTIVA'}
                  </span>
                </div>

                <div>
                  <p style={{ color: th.textMuted, fontSize: '12px' }}>
                    {new Date(card.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  {card.is_used && card.used_at && (
                    <p style={{ color: th.textMuted, fontSize: '11px' }}>
                      Usada: {new Date(card.used_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </p>
                  )}
                </div>

                <div>
                  <p style={{ color: '#888', fontSize: '13px' }}>
                    {card.recipient_name || '—'}
                  </p>
                </div>

                <div className="admin-row-action" style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => toggleUsed(card)}
                    disabled={updating === card.code}
                    style={{
                      padding: '8px 14px', borderRadius: '4px', fontSize: '11px',
                      background: card.is_used ? th.subtleBg : th.text,
                      color: card.is_used ? th.textMuted : '#fff',
                      border: `1px solid ${th.border}`,
                      cursor: updating === card.code ? 'wait' : 'pointer',
                      letterSpacing: '1px', fontWeight: 600,
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
    </>
  );

  if (embedded) return <div style={{ color: th.text }}>{body}</div>;
  return <div style={{ minHeight: '100vh', background: th.pageBg, color: th.text }}>{body}</div>;
}
