import { ImageIcon } from 'lucide-react'

interface OnboardingImageProps {
  src?: string | null
  alt: string
  className?: string
}

export function OnboardingImage({ src, alt, className = '' }: OnboardingImageProps) {
  if (src) {
    return <img src={src} alt={alt} className={`object-cover ${className}`} />
  }

  // Placeholder cuando no hay imagen
  return (
    <div className={`flex flex-col items-center justify-center bg-[#0F0F1A] rounded-xl border border-[#1a1a2e] ${className}`}>
      <ImageIcon className="w-12 h-12 text-[#64748B]" />
      <p className="text-[#64748B] text-sm mt-2">Ilustración próximamente</p>
    </div>
  )
}
