"use client"

import { PlayCircle } from 'lucide-react'

interface DemoVideoProps {
  videoUrl?: string
}

export function DemoVideo({ videoUrl }: DemoVideoProps) {
  return (
    <div className="w-full max-w-[800px] mx-auto aspect-video rounded-2xl overflow-hidden border border-[#1a1a2e] bg-[#0F0F1A] shadow-2xl relative group">
      {videoUrl ? (
        <video 
          src={videoUrl} 
          controls 
          className="w-full h-full object-cover"
          poster="/demo-poster.jpg"
        >
          Tu navegador no soporta el tag de video.
        </video>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="h-16 w-16 mb-6 rounded-full bg-gradient-to-tr from-purple-600/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <PlayCircle className="h-10 w-10 text-cyan-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Ve cómo Senzio agenda una cita en menos de 3 mensajes
          </h3>
          <p className="text-sm text-slate-400 font-medium">
            Video demo disponible próximamente
          </p>
        </div>
      )}
    </div>
  )
}
