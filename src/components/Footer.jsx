import { Logo } from '../assets/icons/Logo'
import { useT } from '../i18n/context'
import { RevealGroup } from './ui/Reveal'

export function Footer() {
  const t = useT()
  const year = new Date().getFullYear()

  return (
    <footer id="contact" className="border-t border-ash/60 bg-white pt-16 pb-10">
      <div className="container-page">
        <RevealGroup className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-5">
            <Logo tagline={t.nav.brandTagline} />
            <p className="max-w-[320px] text-body-sm text-graphite">{t.footer.description}</p>

            <div className="flex flex-wrap gap-2 pt-1">
              {t.footer.social.items.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="rounded-pill border border-ash px-4 py-1.5 text-caption font-medium text-graphite transition-colors duration-200 ease-[var(--ease-out-soft)] hover:border-ink hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {t.footer.columns.map((column) => (
            <nav key={column.id} className="flex flex-col gap-4">
              <h3 className="font-display text-body-sm font-bold text-ink">{column.title}</h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      className="text-body-sm text-graphite transition-colors duration-200 hover:text-signal"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="flex flex-col gap-4">
            <h3 className="font-display text-body-sm font-bold text-ink">
              {t.footer.contact.title}
            </h3>
            <address className="flex flex-col gap-3 text-body-sm text-graphite not-italic">
              <span>{t.footer.contact.address}</span>
              <a
                href={`mailto:${t.footer.contact.email}`}
                className="transition-colors duration-200 hover:text-signal"
              >
                {t.footer.contact.email}
              </a>
              <a
                href={`tel:${t.footer.contact.phone.replace(/[^\d+]/g, '')}`}
                className="transition-colors duration-200 hover:text-signal"
              >
                {t.footer.contact.phone}
              </a>
            </address>
          </div>
        </RevealGroup>

        <div className="mt-14 border-t border-ash/60 pt-6">
          <p className="text-caption text-steel">
            © {year} {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
