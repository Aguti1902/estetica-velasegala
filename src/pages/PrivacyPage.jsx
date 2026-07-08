import { useLang } from '../context/LanguageContext'
import LegalLayout from '../components/LegalLayout'

const content = {
  es: {
    label: 'Información legal',
    title: 'Política de Privacidad',
    updated: 'Última actualización: mayo 2026',
    sections: [
      {
        title: '1. Responsable del tratamiento',
        body: `En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), se informa que el responsable del tratamiento de los datos personales recogidos a través de este sitio web es:

Denominación social: Estètica Vela Segala
Domicilio social: Plaça 1 d'Octubre, 6, 08470 Sant Celoni (Barcelona)
Teléfono: 938 67 58 22
WhatsApp: 621 30 72 35
Correo electrónico: vela@velasegala.com`,
      },
      {
        title: '2. Datos personales que tratamos',
        body: `Los datos personales que podemos tratar son los que usted nos facilita voluntariamente a través de:

- Formulario de contacto: nombre y apellidos, correo electrónico, teléfono (opcional), servicio de interés y mensaje.
- Comunicaciones por correo electrónico o teléfono: los datos que usted nos facilite en dichas comunicaciones.

No recogemos datos de categorías especiales (datos de salud, origen racial o étnico, creencias religiosas, etc.) salvo que usted los incluya expresamente en su mensaje y bajo su exclusiva responsabilidad. En ese caso, el tratamiento estará amparado en su consentimiento explícito (art. 9.2.a RGPD).`,
      },
      {
        title: '3. Finalidad y base legal del tratamiento',
        body: `Sus datos personales se tratan con las siguientes finalidades y bases jurídicas:

- Atender y gestionar su solicitud de información, cita o consulta (base legal: interés legítimo y/o ejecución de un contrato o precontrato, art. 6.1.b RGPD).
- Enviarle comunicaciones relacionadas con los servicios que nos haya solicitado (base legal: consentimiento, art. 6.1.a RGPD).
- Cumplir con las obligaciones legales aplicables (base legal: cumplimiento de una obligación legal, art. 6.1.c RGPD).

No utilizamos sus datos para elaborar perfiles ni para tomar decisiones automatizadas que le afecten de manera significativa.`,
      },
      {
        title: '4. Conservación de los datos',
        body: `Conservamos sus datos durante el tiempo necesario para gestionar su solicitud y, posteriormente, durante los plazos de prescripción legal aplicables para atender posibles responsabilidades derivadas del tratamiento.

Una vez transcurridos dichos plazos, los datos serán eliminados de forma segura o, en su caso, anonimizados de forma irreversible.`,
      },
      {
        title: '5. Destinatarios de los datos',
        body: `No cedemos sus datos personales a terceros, salvo que exista una obligación legal que lo exija.

Podemos compartir sus datos con proveedores de servicios que actúan como encargados del tratamiento (p.ej. servicios de alojamiento web o plataformas de envío de correo electrónico), siempre bajo contrato que garantiza el cumplimiento del RGPD y con las medidas de seguridad adecuadas.

No realizamos transferencias internacionales de datos a países fuera del Espacio Económico Europeo (EEE) salvo que dispongan de un nivel adecuado de protección reconocido por la Comisión Europea o se hayan adoptado las garantías apropiadas.`,
      },
      {
        title: '6. Sus derechos',
        body: `De conformidad con el RGPD y la LOPDGDD, usted tiene derecho a:

- Acceso: conocer qué datos personales suyos tratamos.
- Rectificación: corregir datos inexactos o incompletos.
- Supresión ("derecho al olvido"): solicitar la eliminación de sus datos cuando ya no sean necesarios.
- Limitación del tratamiento: solicitar que suspendamos el tratamiento de sus datos en determinadas circunstancias.
- Portabilidad: recibir sus datos en un formato estructurado y de uso común.
- Oposición: oponerse al tratamiento de sus datos por razones relacionadas con su situación particular.
- Retirada del consentimiento: en cualquier momento, sin que ello afecte a la licitud del tratamiento realizado antes de la retirada.

Para ejercer estos derechos, puede dirigirse a: vela@velasegala.com, indicando el derecho que desea ejercer y adjuntando copia de su documento de identidad.

Si considera que el tratamiento de sus datos no se ajusta a la normativa vigente, puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD): www.aepd.es.`,
      },
      {
        title: '7. Seguridad de los datos',
        body: `Aplicamos las medidas técnicas y organizativas adecuadas para garantizar un nivel de seguridad apropiado al riesgo del tratamiento, en particular frente al acceso no autorizado, la pérdida accidental, la destrucción o el daño de los datos, de conformidad con el artículo 32 del RGPD.`,
      },
      {
        title: '8. Menores de edad',
        body: `Nuestros servicios no están dirigidos a menores de 14 años. No recogemos conscientemente datos personales de menores. Si tiene conocimiento de que un menor nos ha facilitado sus datos sin el consentimiento de sus tutores legales, le rogamos que nos lo comunique a vela@velasegala.com para proceder a su eliminación.`,
      },
      {
        title: '9. Modificaciones de la política de privacidad',
        body: `Nos reservamos el derecho a actualizar la presente Política de Privacidad para adaptarla a cambios legislativos, jurisprudenciales o de nuestra actividad. La fecha de la última actualización figura al inicio de este documento.

Le recomendamos que consulte periódicamente esta página para estar informado de cualquier modificación.`,
      },
    ],
  },
  ca: {
    label: 'Informació legal',
    title: 'Política de Privacitat',
    updated: 'Darrera actualització: maig 2026',
    sections: [
      {
        title: '1. Responsable del tractament',
        body: `En compliment del Reglament (UE) 2016/679 del Parlament Europeu i del Consell (RGPD) i la Llei Orgànica 3/2018, de 5 de desembre, de Protecció de Dades Personals i garantia dels drets digitals (LOPDGDD), s'informa que el responsable del tractament de les dades personals recollides a través d'aquest lloc web és:

Denominació social: Estètica Vela Segala
Domicili social: Plaça 1 d'Octubre, 6, 08470 Sant Celoni (Barcelona)
Telèfon: 938 67 58 22
WhatsApp: 621 30 72 35
Correu electrònic: vela@velasegala.com`,
      },
      {
        title: '2. Dades personals que tractem',
        body: `Les dades personals que podem tractar són les que vostè ens facilita voluntàriament a través de:

- Formulari de contacte: nom i cognoms, correu electrònic, telèfon (opcional), servei d'interès i missatge.
- Comunicacions per correu electrònic o telèfon: les dades que vostè ens faciliti en aquestes comunicacions.

No recollim dades de categories especials (dades de salut, origen racial o ètnic, creences religioses, etc.) llevat que vostè les inclogui expressament en el seu missatge i sota la seva exclusiva responsabilitat. En aquest cas, el tractament estarà emparat en el seu consentiment explícit (art. 9.2.a RGPD).`,
      },
      {
        title: '3. Finalitat i base legal del tractament',
        body: `Les seves dades personals es tracten amb les finalitats i bases jurídiques següents:

- Atendre i gestionar la seva sol·licitud d'informació, cita o consulta (base legal: interès legítim i/o execució d'un contracte o precontracte, art. 6.1.b RGPD).
- Enviar-li comunicacions relacionades amb els serveis que ens hagi sol·licitat (base legal: consentiment, art. 6.1.a RGPD).
- Complir amb les obligacions legals aplicables (base legal: compliment d'una obligació legal, art. 6.1.c RGPD).

No utilitzem les seves dades per elaborar perfils ni per prendre decisions automatitzades que l'afectin de manera significativa.`,
      },
      {
        title: '4. Conservació de les dades',
        body: `Conservem les seves dades durant el temps necessari per gestionar la seva sol·licitud i, posteriorment, durant els terminis de prescripció legal aplicables per atendre possibles responsabilitats derivades del tractament.

Un cop transcorreguts aquests terminis, les dades seran eliminades de manera segura o, si escau, anonimitzades de forma irreversible.`,
      },
      {
        title: '5. Destinataris de les dades',
        body: `No cedim les seves dades personals a tercers, llevat que hi hagi una obligació legal que ho exigeixi.

Podem compartir les seves dades amb proveïdors de serveis que actuen com a encarregats del tractament (p.ex. serveis d'allotjament web o plataformes d'enviament de correu electrònic), sempre sota contracte que garanteix el compliment del RGPD i amb les mesures de seguretat adequades.

No realitzem transferències internacionals de dades a països fora de l'Espai Econòmic Europeu (EEE) llevat que disposin d'un nivell adequat de protecció reconegut per la Comissió Europea o s'hagin adoptat les garanties apropiades.`,
      },
      {
        title: '6. Els seus drets',
        body: `De conformitat amb el RGPD i la LOPDGDD, vostè té dret a:

- Accés: conèixer quines dades personals seves tractem.
- Rectificació: corregir dades inexactes o incompletes.
- Supressió ("dret a l'oblit"): sol·licitar l'eliminació de les seves dades quan ja no siguin necessàries.
- Limitació del tractament: sol·licitar que suspendrem el tractament de les seves dades en determinades circumstàncies.
- Portabilitat: rebre les seves dades en un format estructurat i d'ús comú.
- Oposició: oposar-se al tractament de les seves dades per raons relacionades amb la seva situació particular.
- Retirada del consentiment: en qualsevol moment, sense que això afecti la licitud del tractament realitzat abans de la retirada.

Per exercir aquests drets, pot adreçar-se a: vela@velasegala.com, indicant el dret que desitja exercir i adjuntant còpia del seu document d'identitat.

Si considera que el tractament de les seves dades no s'ajusta a la normativa vigent, pot presentar una reclamació davant l'Agència Espanyola de Protecció de Dades (AEPD): www.aepd.es.`,
      },
      {
        title: '7. Seguretat de les dades',
        body: `Apliquem les mesures tècniques i organitzatives adequades per garantir un nivell de seguretat apropiat al risc del tractament, en particular enfront de l'accés no autoritzat, la pèrdua accidental, la destrucció o el dany de les dades, de conformitat amb l'article 32 del RGPD.`,
      },
      {
        title: "8. Menors d'edat",
        body: `Els nostres serveis no estan adreçats a menors de 14 anys. No recollim conscientment dades personals de menors. Si teniu coneixement que un menor ens ha facilitat les seves dades sense el consentiment dels seus tutors legals, us preguem que ens ho comuniqueu a vela@velasegala.com per procedir a la seva eliminació.`,
      },
      {
        title: '9. Modificacions de la política de privacitat',
        body: `Ens reservem el dret d'actualitzar la present Política de Privacitat per adaptar-la a canvis legislatius, jurisprudencials o de la nostra activitat. La data de la darrera actualització figura a l'inici d'aquest document.

Us recomanem que consulteu periòdicament aquesta pàgina per estar informats de qualsevol modificació.`,
      },
    ],
  },
}

export default function PrivacyPage() {
  const { lang } = useLang()
  return <LegalLayout {...content[lang]} />
}
