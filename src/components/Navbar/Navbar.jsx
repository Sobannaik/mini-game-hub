import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Layout from '../Layout/Layout'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/',       label: 'Home'  },
  { to: '/games',  label: 'Games' },
  { to: '/about',  label: 'About' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="navbar">
      <Layout className="navbar__inner">
        {/* Logo */}
        <NavLink to="/" className="navbar__logo" onClick={closeMenu}>
          <span className="navbar__logo-icon" aria-hidden="true">🎮</span>
          <span className="navbar__logo-text">Game Break</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="navbar__nav" aria-label="Main navigation">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Hamburger — mobile only */}
        <button
          className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="navbar__hamburger-bar" />
          <span className="navbar__hamburger-bar" />
          <span className="navbar__hamburger-bar" />
        </button>
      </Layout>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav className="navbar__mobile-nav" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                isActive
                  ? 'navbar__mobile-link navbar__mobile-link--active'
                  : 'navbar__mobile-link'
              }
              onClick={closeMenu}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

export default Navbar
