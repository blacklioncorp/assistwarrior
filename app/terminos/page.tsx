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

export default function TerminosPage() {
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
            Términos y Condiciones de Uso
          </h1>
          
          <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
            <p className="text-slate-300 mb-6">
              Bienvenido a Senzio. Los presentes Términos y Condiciones regulan el acceso y uso de nuestra plataforma de automatizaciones de agendas y citas personalizadas para negocios. Al contratar y utilizar nuestros servicios, usted acepta de manera expresa y sin reservas los términos aquí descritos. Si no está de acuerdo con ellos, deberá abstenerse de utilizar la plataforma.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-purple-400">1. DEFINICIÓN DEL SERVICIO</h2>
            <p className="text-slate-400 mb-6">
              Senzio es una plataforma digital dedicada al diseño, desarrollo e implementación de sistemas automatizados para la gestión, control y optimización de agendas y citas, adaptada de manera personalizada a las necesidades operativas de cada negocio cliente.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-purple-400">2. CUENTAS, ACCESO Y SEGURIDAD</h2>
            <p className="text-slate-400 mb-4">
              Para utilizar Senzio, el cliente dispondrá de una cuenta de acceso.
            </p>
            <ul className="list-disc pl-5 text-slate-400 mb-6 space-y-2">
              <li><strong className="text-slate-200">Responsabilidad del Cliente:</strong> El cliente es el único y absoluto responsable de mantener la confidencialidad de sus credenciales de acceso (usuarios y contraseñas).</li>
              <li><strong className="text-slate-200">Uso Indebido:</strong> Senzio no se hará responsable por pérdidas, modificaciones o filtraciones de información derivadas de un descuido, hackeo por malas prácticas de seguridad del cliente o transferencias de credenciales a terceros no autorizados.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-purple-400">3. INTEGRACIONES Y SERVICIOS DE TERCEROS (APIs)</h2>
            <p className="text-slate-400 mb-4">
              Para la correcta personalización y funcionamiento de las automatizaciones (por ejemplo, envío de mensajes automatizados), el servicio requiere interactuar con herramientas externas.
            </p>
            <ul className="list-disc pl-5 text-slate-400 mb-6 space-y-2">
              <li><strong className="text-slate-200">Permisos y Conexiones:</strong> El cliente autoriza expresamente a Senzio a solicitar y configurar los permisos necesarios para realizar las conexiones de API Keys correspondientes, incluyendo, de forma enunciativa más no limitativa, la API de Meta Business.</li>
              <li><strong className="text-slate-200">Uso de Licencias:</strong> El cliente se compromete a cumplir con los términos y políticas que dichos terceros (como Meta) exijan. Senzio actúa únicamente como el integrador técnico de estas herramientas.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-purple-400">4. PROPIEDAD DE LOS DATOS E INTELECTUAL</h2>
            <ul className="list-disc pl-5 text-slate-400 mb-6 space-y-2">
              <li><strong className="text-slate-200">Propiedad de los Datos:</strong> Todos los datos, registros de citas, información de clientes finales e información comercial generada o cargada en la plataforma son propiedad exclusiva del cliente. Senzio no comercializará ni se adjudicará la propiedad de dicha información.</li>
              <li><strong className="text-slate-200">Propiedad Intelectual de Senzio:</strong> Todo el código fuente, la arquitectura de software, los flujos de automatización base, los diseños, interfaces, marcas, logotipos y desarrollos tecnológicos de la plataforma son propiedad exclusiva de Senzio. Queda estrictamente prohibida su reproducción, copia, distribución o ingeniería inversa sin autorización previa y por escrito.</li>
              <li><strong className="text-slate-200">Liberación de Identificadores:</strong> En caso de que el cliente decida dar de baja el servicio, Senzio garantiza que su número telefónico/identificador utilizado para las integraciones será liberado y devuelto en su totalidad para que quede libre y pueda ser utilizado de forma independiente por el cliente.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-purple-400">5. POLÍTICAS DE PAGO, CANCELACIÓN Y REEMBOLSOS</h2>
            <ul className="list-disc pl-5 text-slate-400 mb-6 space-y-2">
              <li><strong className="text-slate-200">Tarifa y Recurrencia:</strong> El servicio de Senzio tiene un costo mensual fijo de $1,500.00 MXN (Mil quinientos pesos 00/100 Moneda Nacional). No se ofrecen periodos de prueba gratuitos.</li>
              <li><strong className="text-slate-200">Método de Pago:</strong> Los cobros se realizarán de manera automática y recurrente de forma mensual a través de la pasarela de pagos Stripe.</li>
              <li><strong className="text-slate-200">Días de Gracia y Suspensión:</strong> En caso de que un cobro recurrente falle o no se liquide en la fecha de corte, el cliente contará con un periodo de 7 días naturales de gracia para regularizar su situación de pago. Si transcurrido este plazo el pago no se concreta, el servicio y el acceso a la plataforma serán suspendidos de inmediato.</li>
              <li><strong className="text-slate-200">Cancelaciones:</strong> El cliente puede darse de baja del servicio en cualquier momento. Al cancelar, no se realizarán reembolsos en efectivo ni parciales; sin embargo, el cliente conservará el derecho de disfrutar y utilizar el servicio con total normalidad hasta que concluya el corte de su mes facturado.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-purple-400">6. LÍMITE DE RESPONSABILIDAD</h2>
            <ul className="list-disc pl-5 text-slate-400 mb-6 space-y-2">
              <li><strong className="text-slate-200">Fallas Fuera de Control:</strong> Senzio realiza sus mejores esfuerzos para mantener la estabilidad del sistema; sin embargo, no se hace responsable por fallas técnicas, caídas del servidor, interrupciones del servicio o mal funcionamiento que estén fuera de su control directo (tales como caídas globales de AWS, Google, fallas en la API de Meta Business, cortes de energía o del proveedor de internet del cliente).</li>
              <li><strong className="text-slate-200">Exclusión de Daños Económicos:</strong> Bajo ninguna circunstancia Senzio será responsable ante el cliente o ante terceros por pérdidas económicas, lucro cesante, pérdida de clientes, daños comerciales o cualquier daño directo o indirecto derivado de fallas en las citas agendadas o mal funcionamiento del sistema automatizado. El uso de la plataforma es bajo el propio riesgo del cliente.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-purple-400">7. JURISDICCIÓN Y LEYES APLICABLES</h2>
            <p className="text-slate-400 mb-4">
              Para la interpretación, cumplimiento y resolución de cualquier controversia, disputa o reclamación legal derivada de los presentes Términos y Condiciones, las partes se someten expresamente a las leyes aplicables de la República Mexicana.
            </p>
            <p className="text-slate-400 mb-6">
              Asimismo, ambas partes acuerdan someterse a la jurisdicción de los tribunales competentes ubicados en la Alcaldía Cuauhtémoc de la Ciudad de México, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
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
