import { useLang } from '../context/LanguageContext'
import LegalLayout from '../components/LegalLayout'

const content = {
  es: {
    label: 'Información legal',
    title: 'Política de Cookies',
    updated: 'Última actualización: mayo 2026',
    sections: [
      {
        title: '1. ¿Qué son las cookies?',
        body: `Las cookies son pequeños archivos de texto que los sitios web guardan en su dispositivo (ordenador, tablet o móvil) cuando los visita. Sirven para que el sitio web recuerde sus preferencias, mejore su experiencia de navegación y, en algunos casos, recopile información estadística sobre el uso del sitio.`,
      },
      {
        title: '2. ¿Qué tipos de cookies utilizamos?',
        body: `En este sitio web utilizamos los siguientes tipos de cookies:

Cookies técnicas o estrictamente necesarias
Son imprescindibles para el correcto funcionamiento del sitio web. Sin ellas, no podría navegar por el sitio ni utilizar sus funciones básicas. No requieren su consentimiento.

Cookies analíticas
Nos permiten contabilizar el número de visitas y analizar el comportamiento de los usuarios en el sitio, con el fin de mejorar su funcionamiento y los contenidos que ofrecemos. Solo se activan si usted otorga su consentimiento.

Cookies de preferencias o funcionalidad
Permiten que el sitio web recuerde sus preferencias (como el idioma seleccionado) para ofrecerle una experiencia más personalizada. Solo se activan si usted otorga su consentimiento.`,
      },
      {
        title: '3. Cookies propias y de terceros',
        body: `Cookies propias
Son las generadas y gestionadas directamente por Estètica Vela Segala. Se utilizan para recordar sus preferencias de idioma y de consentimiento de cookies.

Cookies de terceros
Son las instaladas por servicios externos que utilizamos en nuestra web, como:
- Google Analytics: para la medición estadística del tráfico y el comportamiento de los usuarios. Google puede utilizar esta información para mejorar sus propios servicios. Para más información, consulte la política de privacidad de Google: policies.google.com/privacy.
- Google Maps: para mostrar el mapa de localización de nuestro centro. Para más información, consulte la política de privacidad de Google.

Estos proveedores tienen sus propias políticas de privacidad y cookies, sobre las cuales Estètica Vela Segala no tiene control.`,
      },
      {
        title: '4. Duración de las cookies',
        body: `Según su duración, las cookies pueden ser:

- Cookies de sesión: se eliminan automáticamente cuando cierra el navegador.
- Cookies persistentes: permanecen en su dispositivo durante un período determinado (días, meses o años) o hasta que las elimine manualmente.

Las cookies de consentimiento que instalamos tienen una duración de 12 meses, tras los cuales le volveremos a solicitar su consentimiento.`,
      },
      {
        title: '5. ¿Cómo gestionar las cookies?',
        body: `Al acceder por primera vez a este sitio web, se le mostrará un banner informativo en el que podrá:
- Aceptar todas las cookies.
- Rechazar las cookies no esenciales.

Puede cambiar su decisión en cualquier momento eliminando las cookies de su navegador, lo que hará que el banner de consentimiento vuelva a aparecer en su próxima visita.

También puede configurar su navegador para bloquear o eliminar las cookies. A continuación le indicamos cómo hacerlo en los navegadores más comunes:
- Google Chrome: Configuración > Privacidad y seguridad > Cookies y otros datos de sitios.
- Mozilla Firefox: Opciones > Privacidad y seguridad > Cookies y datos del sitio.
- Safari: Preferencias > Privacidad > Gestionar datos del sitio web.
- Microsoft Edge: Configuración > Privacidad, búsqueda y servicios > Cookies.

Tenga en cuenta que bloquear las cookies puede afectar al funcionamiento correcto del sitio web.`,
      },
      {
        title: '6. Modificaciones de la política de cookies',
        body: `Estètica Vela Segala se reserva el derecho a modificar la presente Política de Cookies para adaptarla a cambios legislativos, técnicos o de nuestra actividad. La fecha de última actualización figura al inicio de este documento.

Le recomendamos que consulte periódicamente esta página para estar informado de cualquier modificación.`,
      },
    ],
  },
  ca: {
    label: 'Informació legal',
    title: 'Política de Galetes',
    updated: 'Darrera actualització: maig 2026',
    sections: [
      {
        title: '1. Què són les galetes?',
        body: `Les galetes (cookies) són petits fitxers de text que els llocs web guarden al vostre dispositiu (ordinador, tauleta o mòbil) quan els visiteu. Serveixen perquè el lloc web recordi les vostres preferències, millori la vostra experiència de navegació i, en alguns casos, recopili informació estadística sobre l'ús del lloc.`,
      },
      {
        title: '2. Quins tipus de galetes utilitzem?',
        body: `En aquest lloc web utilitzem els tipus de galetes següents:

Galetes tècniques o estrictament necessàries
Són imprescindibles per al correcte funcionament del lloc web. Sense elles, no podríeu navegar pel lloc ni utilitzar les seves funcions bàsiques. No requereixen el vostre consentiment.

Galetes analítiques
Ens permeten comptabilitzar el nombre de visites i analitzar el comportament dels usuaris al lloc, amb la finalitat de millorar el seu funcionament i els continguts que oferim. Només s'activen si vostè atorga el seu consentiment.

Galetes de preferències o funcionalitat
Permeten que el lloc web recordi les vostres preferències (com l'idioma seleccionat) per oferir-vos una experiència més personalitzada. Només s'activen si vostè atorga el seu consentiment.`,
      },
      {
        title: '3. Galetes pròpies i de tercers',
        body: `Galetes pròpies
Són les generades i gestionades directament per Estètica Vela Segala. S'utilitzen per recordar les vostres preferències d'idioma i de consentiment de galetes.

Galetes de tercers
Són les instal·lades per serveis externs que utilitzem al nostre web, com:
- Google Analytics: per a la mesura estadística del trànsit i el comportament dels usuaris. Google pot utilitzar aquesta informació per millorar els seus propis serveis. Per a més informació, consulteu la política de privacitat de Google: policies.google.com/privacy.
- Google Maps: per mostrar el mapa de localització del nostre centre. Per a més informació, consulteu la política de privacitat de Google.

Aquests proveïdors tenen les seves pròpies polítiques de privacitat i galetes, sobre les quals Estètica Vela Segala no té control.`,
      },
      {
        title: '4. Durada de les galetes',
        body: `Segons la seva durada, les galetes poden ser:

- Galetes de sessió: s'eliminen automàticament quan tanqueu el navegador.
- Galetes persistents: romanen al vostre dispositiu durant un període determinat (dies, mesos o anys) o fins que les elimineu manualment.

Les galetes de consentiment que instal·lem tenen una durada de 12 mesos, transcorreguts els quals us tornarem a sol·licitar el vostre consentiment.`,
      },
      {
        title: '5. Com gestionar les galetes?',
        body: `En accedir per primera vegada a aquest lloc web, se us mostrarà un bàner informatiu on podreu:
- Acceptar totes les galetes.
- Rebutjar les galetes no essencials.

Podeu canviar la vostra decisió en qualsevol moment eliminant les galetes del navegador, cosa que farà que el bàner de consentiment torni a aparèixer en la vostra propera visita.

També podeu configurar el vostre navegador per bloquejar o eliminar les galetes. A continuació us indiquem com fer-ho als navegadors més comuns:
- Google Chrome: Configuració > Privadesa i seguretat > Galetes i altres dades de llocs.
- Mozilla Firefox: Opcions > Privadesa i seguretat > Galetes i dades del lloc.
- Safari: Preferències > Privadesa > Gestionar dades del lloc web.
- Microsoft Edge: Configuració > Privadesa, cerca i serveis > Galetes.

Tingueu en compte que bloquejar les galetes pot afectar el correcte funcionament del lloc web.`,
      },
      {
        title: '6. Modificacions de la política de galetes',
        body: `Estètica Vela Segala es reserva el dret de modificar la present Política de Galetes per adaptar-la a canvis legislatius, tècnics o de la nostra activitat. La data de la darrera actualització figura a l'inici d'aquest document.

Us recomanem que consulteu periòdicament aquesta pàgina per estar informats de qualsevol modificació.`,
      },
    ],
  },
}

export default function PoliticaCookiesPage() {
  const { lang } = useLang()
  return <LegalLayout {...content[lang]} />
}
