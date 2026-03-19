export default function Footer() {
  return (
    <footer className="hidden md:block bg-white border-t border-border/60">
      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-8 lg:px-12 py-16">
        <div className="grid grid-cols-[280px_1fr] gap-12">
          {/* Left - Brand */}
          <div>
            <h2
              className="text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight text-text-primary"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Du<br />Lịch
            </h2>
            <p className="mt-6 text-text-secondary text-[15px] leading-relaxed italic" style={{ fontFamily: 'var(--font-display)' }}>
              Defining the zeitgeist of digital aesthetics. An editorial exploration of interface couture.
            </p>
            <p
              className="mt-12 text-text-muted text-xs tracking-[0.25em] uppercase"
              style={{ fontFamily: 'monospace' }}
            >
              ISSUE NO. 42 / 2025
            </p>
          </div>

          {/* Right - Links + Newsletter */}
          <div className="grid grid-cols-3 gap-8">
            {/* THE ARCHIVE */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase mb-5 text-text-primary">
                The Archive
              </h4>
              <nav className="space-y-3">
                {['Collections', 'Runway', 'Exhibitions', 'Press Room'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-text-secondary text-[15px] hover:text-text-primary transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {link}
                  </a>
                ))}
              </nav>
            </div>

            {/* ATELIER */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase mb-5 text-text-primary">
                Atelier
              </h4>
              <nav className="space-y-3">
                {['Our Craft', 'Materials', 'Sustainability', 'Careers'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-text-secondary text-[15px] hover:text-text-primary transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {link}
                  </a>
                ))}
              </nav>
            </div>

            {/* NEWSLETTER */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase mb-5 text-text-primary">
                Newsletter
              </h4>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                Join the inner circle for early access and editorial insights.
              </p>
              <div className="relative mb-3">
                <input
                  type="email"
                  placeholder="Your e-mail address"
                  className="w-full border-b border-text-muted bg-transparent py-2 text-sm placeholder:text-text-muted focus:border-text-primary transition-colors outline-none"
                  style={{ borderRadius: 0 }}
                />
              </div>
              <button className="text-xs font-bold tracking-[0.15em] uppercase text-text-primary hover:text-primary transition-colors cursor-pointer">
                Subscribe now →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-6 flex items-end justify-between">
          {/* Large italic brand */}
          <h3
            className="text-3xl lg:text-4xl font-black italic text-text-muted/30 leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            DULICH
          </h3>

          {/* Copyright */}
          <p
            className="text-[10px] text-text-muted tracking-[0.15em] uppercase"
            style={{ fontFamily: 'monospace' }}
          >
            © 2025 Du Lịch editions. All rights reserved.
          </p>

          {/* Legal links */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-[10px] font-bold tracking-[0.15em] uppercase text-text-secondary hover:text-text-primary transition-colors"
            >
              Terms of service
            </a>
            <a
              href="#"
              className="text-[10px] font-bold tracking-[0.15em] uppercase text-text-secondary hover:text-text-primary transition-colors"
            >
              Privacy center
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
