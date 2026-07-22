import { useCallback, useState } from 'react';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function GiftCardEmbeddedCheckout({ checkoutData, onError }) {
  const [ready, setReady] = useState(false);

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData),
    });

    const data = await res.json();
    if (!res.ok) {
      const message = data.error || 'Error al iniciar el pago';
      onError?.(message);
      throw new Error(message);
    }

    if (!data.clientSecret) {
      const message = 'No se recibió la sesión de pago';
      onError?.(message);
      throw new Error(message);
    }

    setReady(true);
    return data.clientSecret;
  }, [checkoutData, onError]);

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div style={{
        background: '#fff0f0', border: '1px solid #fcc', borderRadius: '4px',
        padding: '16px', color: '#c00', fontSize: '14px',
      }}>
        Falta configurar VITE_STRIPE_PUBLISHABLE_KEY en el entorno de despliegue.
      </div>
    );
  }

  return (
    <div>
      {!ready && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#7a6352', fontSize: '14px' }}>
          Cargando formulario de pago seguro...
        </div>
      )}
      <div style={{ minHeight: ready ? 'auto' : 0 }}>
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
}
