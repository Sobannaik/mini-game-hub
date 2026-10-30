import Layout from '../../components/Layout/Layout'
import Button from '../../components/Button/Button'
import './About.css'

const TEAM_MEMBERS = [
  { role: 'Lead', name: 'Soban Naik' },
  { role: 'Game Dev', name: 'Himanshu' },
  { role: 'Game Dev', name: 'Mudra' },
  { role: 'Game Dev', name: 'Prachi' },
]

function About() {
  return (
    <main className="about-page">
      <Layout>
        {/* Page header */}
        <div className="about-page__header">
          <h1 className="about-page__title">About Game Break</h1>
          <p className="about-page__lead">
            A collection of simple browser mini-games, built for quick entertainment.
          </p>
        </div>

        {/* Main content */}
        <div className="about-page__content">
          {/* Status note */}
          <section className="about-card about-card--note">
            <div className="about-card__icon" aria-hidden="true">⚠️</div>
            <div>
              <h2 className="about-card__title">Project Status</h2>
              <p className="about-card__text">
                This project is still incomplete and under development. Some games are
                fully playable, while others are still in progress and may require
                additional fixes, content, or polishing before being considered complete.
              </p>
            </div>
          </section>

          {/* What is it? */}
          <section className="about-card">
            <div className="about-card__icon" aria-hidden="true">🎮</div>
            <div>
              <h2 className="about-card__title">What is Game Break?</h2>
              <p className="about-card__text">
                Game Break is a lightweight, browser-based mini-game hub. No accounts,
                no downloads, no waiting. Open the site, pick a game, and start
                playing in seconds. Every game is designed to be finished in a few
                minutes — perfect for a short break between study sessions.
              </p>
            </div>
          </section>

          {/* Why we built it */}
          <section className="about-card">
            <div className="about-card__icon" aria-hidden="true">📚</div>
            <div>
              <h2 className="about-card__title">Why We Built It</h2>
              <p className="about-card__text">
                Game Break is a Semester 3 college project. The goal was to design
                and build a web application as a team — practising React, component
                architecture, routing, and collaborative workflow in a real project setting.
              </p>
            </div>
          </section>

          {/* Tech stack */}
          <section className="about-card">
            <div className="about-card__icon" aria-hidden="true">🛠️</div>
            <div>
              <h2 className="about-card__title">Tech Stack</h2>
              <ul className="about-card__tags">
                {['React 18', 'Vite', 'JavaScript', 'CSS', 'React Router'].map((tech) => (
                  <li key={tech} className="about-card__tag">{tech}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Team */}
          <section className="about-team">
            <h2 className="about-team__title">The Team</h2>
            <div className="about-team__grid">
              {TEAM_MEMBERS.map(({ role, name }) => (
                <div key={name} className="about-team__card">
                  <div className="about-team__avatar" aria-hidden="true">👤</div>
                  <div className="about-team__info">
                    <span className="about-team__name">{name}</span>
                    <span className="about-team__role">{role}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="about-page__cta">
          <Button to="/games" size="lg">
            Browse All Games
          </Button>
        </div>
      </Layout>
    </main>
  )
}

export default About
