import { useLang } from '../context/LanguageContext'

export default function WhatsAppButton() {
  const { t } = useLang()
  const href = `https://wa.me/34${String(t.topbar.whatsapp).replace(/\D/g, '')}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={t.whatsapp.cta}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 40,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#25D366',
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 8px 24px rgba(18, 140, 70, 0.35)',
        textDecoration: 'none',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.5 3.5A11 11 0 0 0 2.05 16.9L1 23l6.25-1.64A11 11 0 0 0 12 23a11 11 0 0 0 8.5-19.5zM12 21a9 9 0 0 1-4.58-1.25l-.33-.2-3.71.97 1-3.62-.21-.34A9 9 0 1 1 12 21zm4.95-6.74c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.46h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
      </svg>
    </a>
  )
}
