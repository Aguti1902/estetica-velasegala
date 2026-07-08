import { useLang } from '../context/LanguageContext'
import LegalLayout from '../components/LegalLayout'

const content = {
  es: {
    label: 'Información legal',
    title: 'Aviso Legal',
    updated: 'Última actualización: mayo 2026',
    sections: [
      {
        title: '1. Datos identificativos',
        body: `En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilita la siguiente información:

Denominación social: Estètica Vela Segala
Nombre comercial: Vela Segala Estètica
Domicilio social: Plaça 1 d'Octubre, 6, 08470 Sant Celoni (Barcelona)
Teléfono: 938 67 58 22
WhatsApp: 621 30 72 35
Correo electrónico: vela@velasegala.com
Actividad: Centro de estética y medicina estética`,
      },
      {
        title: '2. Objeto y ámbito de aplicación',
        body: `El presente Aviso Legal regula el acceso y uso del sitio web de Estètica Vela Segala (en adelante, "el Sitio Web"), así como los derechos y obligaciones de los usuarios que accedan al mismo.

El acceso y/o uso de este Sitio Web atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las condiciones de uso aquí reflejadas. Estas condiciones serán de aplicación independientemente de las condiciones específicas que, en su caso, resulten de obligado cumplimiento.`,
      },
      {
        title: '3. Condiciones de acceso y uso del portal',
        body: `El acceso al Sitio Web es libre y gratuito. No obstante, Estètica Vela Segala puede condicionar la utilización de algunos de los servicios ofrecidos a través del Sitio Web a la previa cumplimentación del correspondiente formulario de contacto o de reserva.

El usuario se compromete a hacer un uso correcto del Sitio Web de conformidad con la Ley y el presente Aviso Legal. El usuario responderá frente a Estètica Vela Segala o frente a terceros de cualesquiera daños y perjuicios que pudieran causarse como consecuencia del incumplimiento de dicha obligación.`,
      },
      {
        title: '4. Usuarios',
        body: `El acceso, navegación y uso del Sitio Web, así como los espacios habilitados para interactuar con los usuarios, implica la aceptación expresa y sin reservas de todos los términos del presente Aviso Legal.

Los usuarios se comprometen a:
- Hacer un uso adecuado de los contenidos y servicios ofrecidos.
- No emplearlos para actividades ilícitas, contrarias a la buena fe o al ordenamiento jurídico vigente.
- No introducir, almacenar o difundir mediante el portal información o material que sea difamatorio, obsceno, amenazante, ilegal o que vulnere derechos de terceros.
- No difundir, transmitir o poner a disposición de terceros cualquier información, elemento o contenido que infrinja los derechos de propiedad intelectual, industrial o de protección de datos.

El usuario garantiza que los datos personales facilitados a Estètica Vela Segala son veraces y que comunicará cualquier modificación en los mismos.`,
      },
      {
        title: '5. Propiedad intelectual e industrial',
        body: `Estètica Vela Segala es titular de todos los derechos de propiedad intelectual e industrial de su Sitio Web, así como de los elementos contenidos en el mismo: imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos; combinaciones de colores, estructura y diseño; selección de materiales usados; programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.

Todos los derechos reservados. En virtud de lo dispuesto en la Ley de Propiedad Intelectual, quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública —incluida su modalidad de puesta a disposición— de la totalidad o parte de los contenidos de este Sitio Web, con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización expresa de Estètica Vela Segala.

El usuario se compromete a respetar los derechos de propiedad intelectual e industrial titularidad de Estètica Vela Segala. Podrá visualizar los elementos del portal e incluso imprimirlos, copiarlos y almacenarlos en el disco duro de su ordenador o en cualquier otro soporte físico siempre y cuando sea única y exclusivamente para su uso personal y privado.`,
      },
      {
        title: '6. Exclusión de garantías y responsabilidad',
        body: `Estètica Vela Segala no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo y no limitativo:

- Errores u omisiones en los contenidos, o falta de disponibilidad del portal.
- La transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.
- El uso que los usuarios puedan hacer de los materiales de este Sitio Web, infringiendo las condiciones aquí establecidas.
- Contenidos de terceros o servicios de terceros a los que se enlace desde el Sitio Web.

Estètica Vela Segala no garantiza la disponibilidad y continuidad del funcionamiento del Sitio Web. Cuando ello sea razonablemente posible, se advertirá previamente de las interrupciones en el funcionamiento del mismo.`,
      },
      {
        title: '7. Modificaciones',
        body: `Estètica Vela Segala se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su Sitio Web, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través del mismo como la forma en la que éstos aparezcan presentados o localizados.

Estètica Vela Segala se reserva igualmente la facultad de modificar en cualquier momento las condiciones de acceso al Sitio Web.`,
      },
      {
        title: '8. Enlaces a terceros',
        body: `El Sitio Web puede incluir enlaces a sitios web de terceros. Estètica Vela Segala no ejerce ningún tipo de control sobre dichos sitios ni sus contenidos.

En ningún caso Estètica Vela Segala asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a un sitio web ajeno, ni garantizará la disponibilidad técnica, calidad, fiabilidad, exactitud, amplitud, veracidad, validez y constitucionalidad de cualquier material o información contenida en ninguno de dichos hipervínculos u otros sitios de Internet.

La inclusión de estas conexiones externas no implica ningún tipo de asociación, fusión o participación con las entidades conectadas.`,
      },
      {
        title: '9. Legislación aplicable y jurisdicción',
        body: `La relación entre Estètica Vela Segala y el usuario se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y Tribunales de la ciudad de Barcelona, salvo que la Ley establezca otra jurisdicción preceptiva.`,
      },
    ],
  },
  ca: {
    label: 'Informació legal',
    title: 'Avís Legal',
    updated: 'Darrera actualització: maig 2026',
    sections: [
      {
        title: '1. Dades identificatives',
        body: `En compliment de l'article 10 de la Llei 34/2002, d'11 de juliol, de Serveis de la Societat de la Informació i de Comerç Electrònic (LSSI-CE), es facilita la informació següent:

Denominació social: Estètica Vela Segala
Nom comercial: Vela Segala Estètica
Domicili social: Plaça 1 d'Octubre, 6, 08470 Sant Celoni (Barcelona)
Telèfon: 938 67 58 22
WhatsApp: 621 30 72 35
Correu electrònic: vela@velasegala.com
Activitat: Centre d'estètica i medicina estètica`,
      },
      {
        title: "2. Objecte i àmbit d'aplicació",
        body: `El present Avís Legal regula l'accés i l'ús del lloc web d'Estètica Vela Segala (d'ara endavant, "el Lloc Web"), així com els drets i obligacions dels usuaris que hi accedeixin.

L'accés i/o l'ús d'aquest Lloc Web atribueix la condició d'USUARI, que accepta, des d'aquest accés i/o ús, les condicions d'ús aquí reflectides. Aquestes condicions seran aplicables independentment de les condicions específiques que, si escau, siguin d'obligat compliment.`,
      },
      {
        title: "3. Condicions d'accés i ús del portal",
        body: `L'accés al Lloc Web és lliure i gratuït. No obstant això, Estètica Vela Segala pot condicionar la utilització d'alguns dels serveis oferts a través del Lloc Web a la prèvia emplenament del corresponent formulari de contacte o de reserva.

L'usuari es compromet a fer un ús correcte del Lloc Web de conformitat amb la Llei i el present Avís Legal. L'usuari respondrà davant d'Estètica Vela Segala o davant de tercers de qualsevol dany i perjudici que pugui causar-se com a conseqüència de l'incompliment d'aquesta obligació.`,
      },
      {
        title: '4. Usuaris',
        body: `L'accés, la navegació i l'ús del Lloc Web impliquen l'acceptació expressa i sense reserves de tots els termes del present Avís Legal.

Els usuaris es comprometen a:
- Fer un ús adequat dels continguts i serveis oferts.
- No emprar-los per a activitats il·lícites, contràries a la bona fe o a l'ordenament jurídic vigent.
- No introduir, emmagatzemar ni difondre mitjançant el portal informació o material que sigui difamatori, obscè, amenaçador, il·legal o que vulneri drets de tercers.
- No difondre, transmetre ni posar a disposició de tercers qualsevol informació, element o contingut que infringeixi els drets de propietat intel·lectual, industrial o de protecció de dades.

L'usuari garanteix que les dades personals facilitades a Estètica Vela Segala són verídiques i que comunicarà qualsevol modificació en les mateixes.`,
      },
      {
        title: '5. Propietat intel·lectual i industrial',
        body: `Estètica Vela Segala és titular de tots els drets de propietat intel·lectual i industrial del seu Lloc Web, així com dels elements continguts en el mateix: imatges, so, àudio, vídeo, programari o textos; marques o logotips; combinacions de colors, estructura i disseny; selecció de materials usats; programes d'ordinador necessaris per al seu funcionament, accés i ús, etc.

Tots els drets reservats. En virtut del que disposa la Llei de Propietat Intel·lectual, queden expressament prohibides la reproducció, la distribució i la comunicació pública —inclosa la seva modalitat de posada a disposició— de la totalitat o part dels continguts d'aquest Lloc Web, amb fins comercials, en qualsevol suport i per qualsevol mitjà tècnic, sense l'autorització expressa d'Estètica Vela Segala.`,
      },
      {
        title: '6. Exclusió de garanties i responsabilitat',
        body: `Estètica Vela Segala no es fa responsable, en cap cas, dels danys i perjudicis de qualsevol naturalesa que poguessin ocasionar, a títol enunciatiu i no limitatiu:

- Errors o omissions en els continguts, o manca de disponibilitat del portal.
- La transmissió de virus o programes maliciosos o lesius en els continguts, malgrat haver adoptat totes les mesures tecnològiques necessàries per evitar-ho.
- L'ús que els usuaris puguin fer dels materials d'aquest Lloc Web, infringint les condicions aquí establertes.
- Continguts de tercers o serveis de tercers als quals s'enllaça des del Lloc Web.`,
      },
      {
        title: '7. Modificacions',
        body: `Estètica Vela Segala es reserva el dret d'efectuar sense previ avís les modificacions que consideri oportunes en el seu Lloc Web, podent canviar, suprimir o afegir tant els continguts i serveis que es prestin a través del mateix com la forma en la qual aquests apareguin presentats o localitzats.`,
      },
      {
        title: '8. Enllaços a tercers',
        body: `El Lloc Web pot incloure enllaços a llocs web de tercers. Estètica Vela Segala no exerceix cap mena de control sobre aquests llocs ni els seus continguts.

En cap cas Estètica Vela Segala assumirà cap responsabilitat pels continguts d'algun enllaç pertanyent a un lloc web aliè, ni garantirà la disponibilitat tècnica, qualitat, fiabilitat, exactitud, amplitud, veracitat, validesa i constitucionalitat de qualsevol material o informació continguda en cap d'aquests hipervincles o altres llocs d'Internet.`,
      },
      {
        title: '9. Legislació aplicable i jurisdicció',
        body: `La relació entre Estètica Vela Segala i l'usuari es regirà per la normativa espanyola vigent i qualsevol controvèrsia se sotmetrà als Jutjats i Tribunals de la ciutat de Barcelona, llevat que la Llei estableixi una altra jurisdicció preceptiva.`,
      },
    ],
  },
}

export default function AvisoLegalPage() {
  const { lang } = useLang()
  const c = content[lang]
  return <LegalLayout {...c} />
}
