import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import WhatsAppButton from './components/WhatsAppButton'
import Chatbot from './components/Chatbot'
import CookieBanner from './components/CookieBanner'

// Pages — lazy loaded for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const AvisoLegalPage = lazy(() => import('./pages/AvisoLegalPage'))
const PoliticaCookiesPage = lazy(() => import('./pages/PoliticaCookiesPage'))
const GiftCardsPage = lazy(() => import('./pages/GiftCardsPage'))
const GiftCardSuccessPage = lazy(() => import('./pages/GiftCardSuccessPage'))
const AdminGiftCardsPage = lazy(() => import('./pages/AdminGiftCardsPage'))

function PageLoader() {
  return (
    <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '2px', background: '#0d0d0d', animation: 'pulse 1s infinite' }} />
    </div>
  )
}

function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Layout() {
  return (
    <>
      <ScrollReset />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <Chatbot />
      <CookieBanner />
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="servicios" element={<ServicesPage />} />
              <Route path="servicios/:slug" element={<ServiceDetailPage />} />
              <Route path="sobre-nosotros" element={<AboutPage />} />
              <Route path="galeria" element={<GalleryPage />} />
              <Route path="contacto" element={<ContactPage />} />
              <Route path="politica-privacitat" element={<PrivacyPage />} />
              <Route path="politica-privacidad" element={<PrivacyPage />} />
              <Route path="aviso-legal" element={<AvisoLegalPage />} />
              <Route path="politica-cookies" element={<PoliticaCookiesPage />} />
              <Route path="tarjetas-regalo" element={<GiftCardsPage />} />
              <Route path="tarjetas-regalo/confirmacion" element={<GiftCardSuccessPage />} />
            </Route>
            {/* Admin fuera del Layout normal (sin header/footer) */}
            <Route path="admin/tarjetas" element={<AdminGiftCardsPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  )
}
