import { Link } from 'react-router-dom'

export default function MarketingFooter() {
  const year = new Date().getFullYear()

  const links = [
    { to: '/',            label: 'Home'        },
    { to: '/how-it-works',label: 'How It Works'},
    { to: '/pricing',     label: 'Pricing'     },
    { to: '/resources',   label: 'Resources'   },
    { to: '/faq',         label: 'FAQ'         },
    { to: '/contact',     label: 'Contact'     },
  ]

  return (
    <footer style={{
      background: '#0B1F3A',
      color: 'rgba(255,255,255,0.55)',
      padding: '40px 5%',
      textAlign: 'center',
      fontSize: '0.85rem',
    }}>
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <p style={{ margin: 0 }}>
        © {year} CalCheq Pty Ltd · Purpose-built calibration management for Australian processing plants ·{' '}
        <a
          href="mailto:info@calcheq.com"
          style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.color = '#fff'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
        >
          info@calcheq.com
        </a>
      </p>
    </footer>
  )
}
