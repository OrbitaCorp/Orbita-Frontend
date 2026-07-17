import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/modules/landing/context/ThemeContext';

export type LegalKey = 'terminos' | 'privacidad' | 'cookies';

export const LEGAL_CONTENT: Record<LegalKey, { title: string; date: string; sections: { subtitle: string; text: string }[] }> = {
  terminos: {
    title: 'Términos de uso',
    date: 'Última actualización: 13 de Mayo, 2026',
    sections: [
      { subtitle: '1. Aceptación de los términos', text: 'Al acceder y utilizar Órbita, aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguna parte de los términos, no podrás acceder al servicio.' },
      { subtitle: '2. Uso de la plataforma', text: 'Órbita proporciona un servicio integral de gestión empresarial. Te comprometes a utilizarlo solo para fines legales y de una manera que no infrinja los derechos de terceros.' },
      { subtitle: '3. Cuentas de usuario', text: 'Eres responsable de salvaguardar la contraseña y de cualquier actividad bajo tu cuenta. No puedes compartirla con personas ajenas a tu organización.' },
      { subtitle: '4. Modificaciones del servicio', text: 'Nos reservamos el derecho de retirar o modificar nuestro servicio a nuestra entera discreción sin previo aviso.' },
    ],
  },
  privacidad: {
    title: 'Política de privacidad',
    date: 'Última actualización: 13 de Mayo, 2026',
    sections: [
      { subtitle: '1. Recopilación de información', text: 'Recopilamos varios tipos de información para proporcionar y mejorar nuestro servicio, incluyendo datos personales y de uso.' },
      { subtitle: '2. Uso de datos', text: 'Utilizamos los datos para proporcionar el servicio, notificarte sobre cambios y ofrecer soporte al cliente.' },
      { subtitle: '3. Seguridad de los datos', text: 'Utilizamos encriptación de extremo a extremo y medidas estándar de la industria para proteger tu información.' },
      { subtitle: '4. Tus derechos', text: 'Tienes derecho a acceder, actualizar o eliminar la información que tenemos sobre ti. Contactá a nuestro equipo de soporte.' },
    ],
  },
  cookies: {
    title: 'Política de cookies',
    date: 'Última actualización: 13 de Mayo, 2026',
    sections: [
      { subtitle: '1. ¿Qué son las cookies?', text: 'Las cookies son archivos con datos que se envían a tu navegador desde un sitio web y se almacenan en tu dispositivo.' },
      { subtitle: '2. Cómo las usamos', text: 'Utilizamos cookies para el correcto funcionamiento de la plataforma y recordar tus preferencias.' },
      { subtitle: '3. Tipos de cookies', text: 'Usamos cookies de sesión, preferencias y seguridad.' },
      { subtitle: '4. Gestión', text: 'Puedes configurar tu navegador para rechazar cookies, aunque algunas partes del servicio podrían dejar de funcionar.' },
    ],
  },
};

interface Props {
  isOpen:     boolean;
  contentKey: LegalKey | null;
  onClose:    () => void;
}

export function LegalModal({ isOpen, contentKey, onClose }: Props) {
  const { isDark } = useTheme();

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      window.addEventListener('keydown', onEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !contentKey) return null;
  const content = LEGAL_CONTENT[contentKey];
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`legal-modal-in relative w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden
        ${isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'}`}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{content.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{content.date}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar"
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {content.sections.map((s, i) => (
              <div key={i}>
                <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{s.subtitle}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
              Para consultas legales contactá a <strong>legal@orbita.app</strong>
            </p>
          </div>
        </div>

        <div className={`px-6 py-4 border-t flex justify-end ${isDark ? 'border-white/10 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
