import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

function SenzioLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="senzio-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8B5CF6" />
          <stop offset="100%" stop-color="#06B6D4" />
        </linearGradient>
      </defs>
      <path 
        d="M35,25 C45,15 65,15 75,30 C85,45 65,55 50,50 C35,45 15,55 25,70 C35,85 55,85 65,75" 
        stroke="url(#senzio-logo-grad)" 
        strokeWidth="10" 
        strokeLinecap="round" 
      />
      <circle cx="35" cy="25" r="7" fill="#8B5CF6" />
      <circle cx="65" cy="75" r="7" fill="#06B6D4" />
      <circle cx="50" cy="50" r="5" fill="#F8FAFC" />
    </svg>
  )
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#05050A] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-[#05050A]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <SenzioLogo className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Senzio
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800 bg-[#0F0F1A] p-8 md:p-12 shadow-xl">
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-white sm:text-4xl text-center">
            Aviso de Privacidad Integral
          </h1>
          
          <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
            <p className="text-slate-300 mb-6">
              Senzio, con domicilio legal para oír y recibir notificaciones en Antonio García Cuba 68, Colonia Obrera, Alcaldía Cuauhtémoc, Ciudad de México, es el responsable del uso, tratamiento y protección de sus datos personales, en cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Al respecto, le informamos lo siguiente:
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">1. DATOS PERSONALES QUE RECABAREMOS</h2>
            <p className="text-slate-400 mb-4">
              Para prestar nuestros servicios de automatización, recopilamos la información del Cliente bajo las siguientes categorías:
            </p>
            <ul className="list-disc pl-5 text-slate-400 mb-6 space-y-3">
              <li><strong className="text-slate-200">Datos de Identificación y Contacto:</strong> Nombre completo del representante legal o persona física, razón social del negocio, correo electrónico institucional y número de teléfono.</li>
              <li><strong className="text-slate-200">Datos de Facturación y Pago:</strong> Registro Federal de Contribuyentes (RFC), régimen fiscal, dirección fiscal y datos bancarios o de tarjetas de crédito/débito. <em>Nota: Senzio no almacena sus datos bancarios en sus servidores; estos son recopilados y procesados de forma encriptada y segura directamente por la pasarela de pagos Stripe.</em></li>
              <li><strong className="text-slate-200">Datos de Integración Técnica y Uso:</strong> Fichas de API Keys, tokens de acceso a bases de datos, credenciales de configuración de la API de Meta Business y metadatos de uso de la plataforma (fechas, horas y registros de ejecución de flujos automatizados).</li>
              <li><strong className="text-slate-200">Exclusión de Datos Sensibles:</strong> Senzio no solicita ni recopila bajo ninguna circunstancia datos personales sensibles (origen racial, estado de salud, creencias religiosas, preferencia sexual, etc.).</li>
              <li><strong className="text-slate-200">Distinción Legal de Datos de Terceros (Clientes Finales):</strong> En términos de la legislación vigente, el Cliente actúa como el único Responsable de los datos personales de los clientes finales que interactúan con sus agendas y citas. Senzio actúa exclusivamente en calidad de Encargado del tratamiento de dicha información, limitándose a procesar, almacenar y ejecutar los flujos automatizados programados por el Cliente, quien mantiene la propiedad absoluta de dichos datos.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">2. ¿PARA QUÉ FINES UTILIZAREMOS SUS DATOS?</h2>
            <p className="text-slate-400 mb-4">
              Los datos personales que recabamos de usted serán utilizados para las siguientes <strong>finalidades primarias</strong>, indispensables para la correcta prestación del servicio:
            </p>
            <ul className="list-disc pl-5 text-slate-400 mb-6 space-y-2">
              <li>Crear, dar de alta y administrar su cuenta de acceso en la plataforma Senzio.</li>
              <li>Diseñar, personalizar, configurar e implementar los flujos automatizados de agendas y citas de acuerdo con los requerimientos de su negocio.</li>
              <li>Gestionar e interconectar técnicamente la plataforma con herramientas de terceros autorizadas por usted (tales como la API de Meta Business).</li>
              <li>Procesar los cargos recurrentes mensuales derivados del servicio contratado.</li>
              <li>Brindar soporte técnico y atención a clientes ante incidencias del sistema.</li>
            </ul>
            <p className="text-slate-400 mb-4">
              <strong>Finalidades secundarias:</strong>
            </p>
            <ul className="list-disc pl-5 text-slate-400 mb-6 space-y-2">
              <li>Enviar notificaciones sobre actualizaciones del sistema, lanzamientos de nuevas funciones tecnológicas o promociones exclusivas de Senzio.</li>
            </ul>
            <p className="text-sm text-slate-500 italic mb-6">
              (Si usted no desea recibir estas comunicaciones accesorias, puede solicitar la baja en cualquier momento enviando un correo electrónico a nuestro medio de contacto legal).
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">3. TRANSFERENCIA DE DATOS PERSONALES</h2>
            <p className="text-slate-400 mb-4">
              Senzio no comercializa, transfiere ni comparte sus datos personales con terceros para fines publicitarios ajenos a la plataforma. No obstante, para garantizar la operatividad de la infraestructura tecnológica, se realizan las siguientes transferencias necesarias que no requieren de su consentimiento explícito:
            </p>
            <ul className="list-disc pl-5 text-slate-400 mb-6 space-y-3">
              <li><strong className="text-slate-200">Stripe Inc.:</strong> Para la gestión automatizada del modelo de suscripción mensual recurrente y el procesamiento de pagos.</li>
              <li><strong className="text-slate-200">Meta Platforms, Inc. (Meta Business / API de WhatsApp):</strong> Para la correcta canalización, envío, recepción y ejecución de los flujos de mensajería automatizada contratados.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">4. DERECHOS ARCO Y REVOCACIÓN DEL CONSENTIMIENTO</h2>
            <p className="text-slate-400 mb-4">
              Usted goza del derecho constitucional de Acceso a sus datos personales, a solicitar su Rectificación en caso de inexactitud, a exigir su Cancelación y eliminación de nuestros registros si considera que no se usan conforme a la ley, y a manifestar su Oposición para fines específicos (Derechos ARCO).
            </p>
            <p className="text-slate-400 mb-4">
              Para el ejercicio de cualquiera de los Derechos ARCO, o para revocar el consentimiento previamente otorgado, usted deberá enviar una solicitud formal por escrito al correo electrónico:
            </p>
            <p className="text-cyan-400 font-medium bg-cyan-950/30 p-4 rounded-lg border border-cyan-900/50 mb-4 text-center">
              contacto@senzio.mx
            </p>
            <p className="text-slate-400 mb-6">
              Su solicitud deberá incluir: nombre completo, documentos que acrediten su identidad, y una descripción clara de los datos y derechos que desea ejercer. Recibirá una respuesta en los plazos marcados por la LFPDPPP.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">5. LIBERACIÓN DE IDENTIFICADORES POR BAJA DEL SERVICIO</h2>
            <p className="text-slate-400 mb-6">
              En caso de que decida cancelar o dar de baja de forma definitiva el servicio de Senzio, la plataforma se compromete a liberar por completo y desvincular técnicamente cualquier identificador, credencial o número telefónico de WhatsApp/Meta utilizado en las automatizaciones, devolviéndolo íntegramente al Cliente para su uso independiente.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">6. USO DE COOKIES Y TECNOLOGÍAS DE RASTREO</h2>
            <p className="text-slate-400 mb-6">
              Nuestra plataforma web utiliza cookies técnicas y herramientas de análisis esenciales para mantener la seguridad de sus inicios de sesión, recordar sus preferencias de configuración de agenda y medir el rendimiento del sistema. Estas herramientas recopilan datos de forma anónima, como el tipo de navegador y sistema operativo utilizado, y pueden ser deshabilitadas por usted directamente desde el menú de configuración de su navegador de internet.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">7. CAMBIOS AL AVISO DE PRIVACIDAD</h2>
            <p className="text-slate-400 mb-4">
              El presente aviso de privacidad puede verse modificado o actualizado debido a reformas legales, directivas del INAI, o la incorporación de nuevas herramientas dentro de los servicios de Senzio. Todo cambio sustancial le será notificado de inmediato a través de un aviso visible dentro del panel de control de la plataforma o mediante un correo electrónico enviado a su cuenta registrada.
            </p>
            <p className="text-sm font-medium text-slate-500 mt-8 text-right">
              Fecha de última actualización: Julio de 2026.
            </p>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-900 bg-[#05050A] py-8 mt-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SenzioLogo className="h-6 w-6" />
            <span className="text-sm font-bold text-white">Senzio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terminos" className="text-xs text-slate-400 hover:text-white transition-colors">Términos y Condiciones</Link>
            <Link href="/privacidad" className="text-xs text-slate-400 hover:text-white transition-colors">Aviso de Privacidad</Link>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 Senzio. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
