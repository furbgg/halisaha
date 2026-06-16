import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { COMPANY_NAME, COMPANY_SLOGAN, SOCIAL_INSTAGRAM } from '../../config/brand';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-white/10 bg-[#050804] pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo variant="small" />
            <p className="text-sm text-slate-400 max-w-xs text-center md:text-left">
              {COMPANY_SLOGAN}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-center md:text-left">
            <Link to="/rueckerstattung" className="text-secondary/60 hover:text-secondary text-sm transition-colors">{t('footer.refundPolicy', 'Rückerstattungsrichtlinien')}</Link>
            <Link to="/datenschutz" className="text-secondary/60 hover:text-secondary text-sm transition-colors">{t('footer.privacy', 'Datenschutz')}</Link>
            <Link to="/impressum" className="text-secondary/60 hover:text-secondary text-sm transition-colors">{t('footer.imprint', 'Impressum')}</Link>
            <Link to="/barrierefreiheit" className="text-secondary/60 hover:text-secondary text-sm transition-colors">{t('footer.accessibility', 'Barrierefreiheit')}</Link>
            <Link to="/kontakt" className="text-secondary/60 hover:text-secondary text-sm transition-colors">{t('footer.contact', 'Kontakt')}</Link>
            <Link to="/agb" className="text-secondary/60 hover:text-secondary text-sm transition-colors">{t('footer.terms', 'AGB')}</Link>
            <Link to="/faq" className="text-secondary/60 hover:text-secondary text-sm transition-colors">{t('footer.faq', 'FAQ')}</Link>
          </div>

          <div className="flex gap-4">
            <a 
              href={SOCIAL_INSTAGRAM}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-colors hover:bg-primary hover:text-white"
            >
              <span className="sr-only">Instagram</span>
              <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h-.165zm-3.77 1.795c-.95.043-1.46.25-1.813.387a2.932 2.932 0 00-1.097.712 2.932 2.932 0 00-.712 1.097c-.138.353-.344.862-.387 1.814-.043.95-.05 1.225-.05 3.535s.007 2.586.05 3.535c.043.95.25 1.46.387 1.813a2.932 2.932 0 00.712 1.097 2.932 2.932 0 001.097.712c.353.138.862.344 1.815.387.95.043 1.225.05 3.535.05s2.586-.007 3.535-.05c.95-.043 1.46-.25 1.813-.387a2.932 2.932 0 001.097-.712 2.932 2.932 0 00.712-1.097c.138-.353.344-.862.387-1.815.043-.95.05-1.225.05-3.535s-.007-2.586-.05-3.535c-.043-.95-.25-1.46-.387-1.813a2.932 2.932 0 00-.712-1.097 2.932 2.932 0 00-1.097-.712c-.353-.138-.862-.344-1.815-.387-.95-.043-1.225-.05-3.535-.05s-2.586.007-3.535.05z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M12.309 6.878a5.434 5.434 0 110 10.868 5.434 5.434 0 010-10.868zm0 1.795a3.639 3.639 0 100 7.278 3.639 3.639 0 000-7.278z" clipRule="evenodd" />
                <path d="M16.924 5.96a1.18 1.18 0 11-2.36 0 1.18 1.18 0 012.36 0z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} {COMPANY_NAME}. {t('footer.allRightsReserved', 'Alle Rechte vorbehalten.')}</p>
        </div>
      </div>
    </footer>
  );
}
