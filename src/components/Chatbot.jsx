import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { servicesData } from '../data/services'

// Base de conocimiento del chatbot
const buildKnowledge = (services, lang) => {
  const es = lang === 'es'
  return {
    greetings: ['hola', 'buenos días', 'buenas', 'buen día', 'hola!', 'hey', 'bon dia', 'bona tarda', 'hola,'],
    farewells: ['adiós', 'bye', 'hasta luego', 'adéu', 'fins aviat', 'chao'],
    thanks: ['gracias', 'gràcies', 'muchas gracias', 'moltes gràcies', 'thank you'],
    priceKeywords: ['precio', 'coste', 'cuánto cuesta', 'cuanto vale', 'preu', 'cost', 'quant costa'],
    durationKeywords: ['cuánto dura', 'tiempo', 'duración', 'minutos', 'quant dura', 'temps', 'durada'],
    appointmentKeywords: ['cita', 'reservar', 'reserva', 'hora', 'pedir cita', 'demanar', 'cita previa'],
    locationKeywords: ['dónde', 'dirección', 'donde estáis', 'address', 'on esteu', 'adreça', 'sant celoni'],
    scheduleKeywords: ['horario', 'horaris', 'abierto', 'obert', 'schedule', 'quando', 'cuando abren'],
    services: services.map(s => ({
      id: s.id,
      slug: s.slug,
      name: s.name.toLowerCase(),
      keywords: s.name.toLowerCase().split(/[\s/]+/).filter(w => w.length > 3),
      shortDesc: s.description,
      price: s.price,
      duration: s.duration,
    })),
  }
}

const getResponse = (input, knowledge, lang, services) => {
  const text = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const es = lang === 'es'

  // Saludos
  if (knowledge.greetings.some(g => text.includes(g.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
    return {
      text: es
        ? '¡Hola! Soy el asistente virtual de Vela Segala Estètica 👋 Estoy aquí para ayudarte con información sobre nuestros tratamientos. ¿Qué deseas saber?'
        : "Hola! Sóc l'assistent virtual de Vela Segala Estètica 👋 Estic aquí per ajudar-te amb informació sobre els nostres tractaments. Què vols saber?",
      suggestions: es
        ? ['¿Qué tratamientos ofrecéis?', '¿Dónde estáis?', 'Quiero reservar cita']
        : ['Quins tractaments oferiu?', 'On esteu?', 'Vull demanar cita'],
    }
  }

  // Despedidas
  if (knowledge.farewells.some(g => text.includes(g))) {
    return {
      text: es
        ? '¡Hasta pronto! Si necesitas más información, estaremos encantados de ayudarte. Puedes contactarnos o reservar cita online en cualquier momento 😊'
        : 'Fins aviat! Si necessites més informació, estarem encantats d\'ajudar-te. Pots contactar-nos o reservar cita online quan vulguis 😊',
    }
  }

  // Agradecimientos
  if (knowledge.thanks.some(g => text.includes(g))) {
    return {
      text: es
        ? '¡De nada! Si tienes alguna pregunta más, no dudes en preguntar. Estamos aquí para ayudarte 😊'
        : 'De res! Si tens alguna pregunta més, no dubtis a preguntar. Estem aquí per ajudar-te 😊',
    }
  }

  // Preguntas sobre citas
  if (knowledge.appointmentKeywords.some(k => text.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
    return {
      text: es
        ? 'Puedes reservar tu cita de forma muy sencilla. Contacta con nosotros y te atenderemos lo antes posible.'
        : 'Pots reservar la teva cita de forma molt senzilla. Contacta amb nosaltres i t\'atendrem el més aviat possible.',
      link: { to: '/contacto', label: es ? 'Reservar cita →' : 'Reservar cita →' },
    }
  }

  // Ubicación
  if (knowledge.locationKeywords.some(k => text.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
    return {
      text: es
        ? "📍 Nos encontramos en **Plaça 1 d'Octubre, 6, 08470 Sant Celoni, Barcelona**. Fácil acceso en transporte público y parking cercano."
        : "📍 Estem a **Plaça 1 d'Octubre, 6, 08470 Sant Celoni, Barcelona**. Fàcil accés en transport públic i aparcament proper.",
      link: { to: '/contacto', label: es ? 'Ver en el mapa →' : 'Veure al mapa →' },
    }
  }

  // Horarios
  if (knowledge.scheduleKeywords.some(k => text.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
    return {
      text: es
        ? '🕐 Nuestro horario es:\n• Lunes a jueves: 9:00 – 20:00\n• Viernes: 9:00 – 15:00'
        : '🕐 El nostre horari és:\n• Dilluns a dijous: 9:00 – 20:00\n• Divendres: 9:00 – 15:00',
    }
  }

  // Lista de tratamientos
  if (text.includes('tratamiento') || text.includes('servicio') || text.includes('que ofreceis') || text.includes('que ofrecéis') || text.includes('tractament') || text.includes('que oferiu') || text.includes('que haceis') || text.includes('que feis')) {
    return {
      text: es
        ? 'Ofrecemos 15 tratamientos en 4 áreas:'
        : 'Oferim 15 tractaments en 4 àrees:',
      categories: true,
    }
  }

  // Buscar servicio específico
  const matchedService = knowledge.services.find(s => {
    const nameMatch = s.keywords.some(kw => text.includes(kw))
    return nameMatch
  })

  if (matchedService) {
    const full = services.find(s => s.id === matchedService.id)
    return {
      text: es
        ? `**${full.name}**\n\n${full.description}\n\n⏱ Duración: ${full.duration}\n💶 ${full.price}`
        : `**${full.name}**\n\n${full.description}\n\n⏱ Durada: ${full.duration}\n💶 ${full.price}`,
      link: { to: `/servicios/${full.slug}`, label: es ? `Ver más sobre ${full.name} →` : `Veure més sobre ${full.name} →` },
    }
  }

  // Respuesta genérica
  return {
    text: es
      ? 'No he entendido exactamente tu consulta. Puedo ayudarte con información sobre nuestros tratamientos, precios, horarios o cómo reservar cita. ¿Qué necesitas?'
      : "No he entès exactament la teva consulta. Puc ajudar-te amb informació sobre els nostres tractaments, preus, horaris o com reservar cita. Què necessites?",
    suggestions: es
      ? ['¿Qué tratamientos ofrecéis?', 'Quiero reservar cita', '¿Dónde estáis?', 'Precio del bótox']
      : ['Quins tractaments oferiu?', 'Vull demanar cita', 'On esteu?', 'Preu del bòtox'],
  }
}

const categoryLabels = {
  es: { facial: 'Facial', corporal: 'Corporal', laser: 'Láser', nutricion: 'Nutrición' },
  ca: { facial: 'Facial', corporal: 'Corporal', laser: 'Làser', nutricion: 'Nutrició' },
}

export default function Chatbot() {
  const { lang, t } = useLang()
  const es = lang === 'es'
  const services = servicesData[lang]
  const knowledge = buildKnowledge(services, lang)

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: 1, from: 'bot',
        text: es
          ? '¡Hola! Soy el asistente virtual de Vela Segala Estètica. Puedo ayudarte con información sobre tratamientos, precios, citas o cómo llegar. ¿En qué puedo ayudarte?'
          : "Hola! Sóc l'assistent virtual de Vela Segala Estètica. Puc ajudar-te amb informació sobre tractaments, preus, cites o com arribar. En què puc ajudar-te?",
        suggestions: es
          ? ['¿Qué tratamientos ofrecéis?', 'Quiero reservar cita', '¿Dónde estáis?']
          : ['Quins tractaments oferiu?', 'Vull demanar cita', 'On esteu?'],
      }])
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [messages, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const sendMessage = (text) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), from: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const response = getResponse(text, knowledge, lang, services)
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'bot', ...response }])
      setTyping(false)
    }, 600 + Math.random() * 400)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const grouped = ['facial', 'corporal', 'laser', 'nutricion'].map(cat => ({
    cat,
    label: categoryLabels[lang][cat],
    items: services.filter(s => s.category === cat),
  }))

  const waUrl = `https://wa.me/34${t.topbar.whatsapp.replace(/\s/g, '')}`

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 41 }}>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            style={{ position: 'absolute', bottom: '112px', right: 0, width: 'min(360px, calc(100vw - 2rem))', background: '#fff', border: '1.5px solid #e8e8e8', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', maxHeight: 'min(520px, calc(100vh - 10rem))' }}
          >
            {/* Header */}
            <div style={{ background: '#0d0d0d', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <div style={{ width: '32px', height: '32px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="#0d0d0d" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>Asistente Virtual</div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
                  {es ? 'En línea' : 'En línia'}
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
              {messages.map(msg => (
                <div key={msg.id}>
                  <div style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '85%',
                      padding: msg.from === 'user' ? '8px 12px' : '10px 14px',
                      background: msg.from === 'user' ? '#0d0d0d' : '#f5f5f5',
                      color: msg.from === 'user' ? '#fff' : '#0d0d0d',
                      fontSize: '0.82rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
                    }}>
                      {msg.text.split('**').map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </div>
                  </div>

                  {/* Sugerencias */}
                  {msg.suggestions && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {msg.suggestions.map((s, i) => (
                        <button key={i} onClick={() => sendMessage(s)}
                          style={{ fontSize: '0.72rem', padding: '5px 10px', background: '#fff', border: '1px solid #e8e8e8', color: '#0d0d0d', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#0d0d0d'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#0d0d0d' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0d0d0d'; e.currentTarget.style.borderColor = '#e8e8e8' }}
                        >{s}</button>
                      ))}
                    </div>
                  )}

                  {/* Link CTA */}
                  {msg.link && (
                    <div style={{ marginTop: '8px' }}>
                      <Link to={msg.link.to} onClick={() => setOpen(false)}
                        style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d0d0d', textDecoration: 'none', borderBottom: '1px solid #0d0d0d', paddingBottom: '1px' }}>
                        {msg.link.label}
                      </Link>
                    </div>
                  )}

                  {/* Categorías de servicios */}
                  {msg.categories && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {grouped.map(group => (
                        <div key={group.cat}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: '4px' }}>{group.label}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {group.items.map(s => (
                              <button key={s.id} onClick={() => sendMessage(s.name)}
                                style={{ fontSize: '0.7rem', padding: '4px 8px', background: '#f5f5f5', border: '1px solid #e8e8e8', color: '#0d0d0d', cursor: 'pointer', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#0d0d0d'; e.currentTarget.style.color = '#fff' }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0d0d0d' }}
                              >{s.name}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div style={{ display: 'flex', gap: '5px', padding: '10px 14px', background: '#f5f5f5', width: 'fit-content' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: '6px', height: '6px', background: '#a3a3a3', borderRadius: '50%', display: 'inline-block', animation: `bounce 1s ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} style={{ padding: '0.75rem', borderTop: '1.5px solid #e8e8e8', display: 'flex', gap: '8px', flexShrink: 0 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={es ? 'Escribe tu consulta...' : 'Escriu la teva consulta...'}
                style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem', border: '1.5px solid #e8e8e8', outline: 'none', fontFamily: 'var(--font-sans)', color: '#0d0d0d', background: '#fff' }}
                onFocus={e => e.target.style.borderColor = '#0d0d0d'}
                onBlur={e => e.target.style.borderColor = '#e8e8e8'}
              />
              <button type="submit" disabled={!input.trim()}
                style={{ width: '38px', height: '38px', background: input.trim() ? '#0d0d0d' : '#e8e8e8', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                <svg width="16" height="16" fill="none" stroke={input.trim() ? '#fff' : '#a3a3a3'} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante: asistente IA + WhatsApp */}
      {!open ? (
        <div
          style={{
            width: '52px',
            borderRadius: '26px',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setOpen(true)}
            style={{
              height: '52px',
              background: '#0d0d0d',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            aria-label={es ? 'Abrir asistente virtual' : 'Obrir assistent virtual'}
          >
            <svg width="20" height="20" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', border: '1.5px solid #0d0d0d' }} />
          </motion.button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            style={{
              height: '52px',
              background: '#25d366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            <svg width="22" height="22" fill="#fff" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(false)}
          style={{ width: '52px', height: '52px', background: '#0d0d0d', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', borderRadius: '50%' }}
          aria-label={es ? 'Cerrar asistente' : 'Tancar assistent'}
        >
          <svg width="20" height="20" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </motion.button>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}
