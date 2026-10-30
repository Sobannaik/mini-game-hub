import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { audioManager } from '../../utils/audioManager'
import './AudioPlayer.css'

function getRouteSection(pathname) {
  if (pathname === '/games') return 'arcade'
  if (pathname.startsWith('/games/')) {
    return pathname.includes('maze') ? 'adventure' : 'arcade'
  }
  return 'home'
}

function AudioPlayer() {
  const location = useLocation()
  const [preferences, setPreferences] = useState(() => audioManager.getPreferences())
  const [themeLabel, setThemeLabel] = useState(() => audioManager.getMusicLabel())

  useEffect(() => {
    audioManager.initialize()
    const syncPreferences = (event) => setPreferences(event.detail)
    const applySection = (event) => audioManager.setSection(event.detail?.section)
    const syncSectionLabel = (event) => setThemeLabel(event.detail?.label || audioManager.getMusicLabel())
    window.addEventListener('gamebreak-audio-preferences', syncPreferences)
    window.addEventListener('gamebreak-audio-section', applySection)
    window.addEventListener('gamebreak-audio-section-updated', syncSectionLabel)
    return () => {
      window.removeEventListener('gamebreak-audio-preferences', syncPreferences)
      window.removeEventListener('gamebreak-audio-section', applySection)
      window.removeEventListener('gamebreak-audio-section-updated', syncSectionLabel)
      audioManager.destroy()
    }
  }, [])

  useEffect(() => {
    audioManager.setSection(getRouteSection(location.pathname))
    setThemeLabel(audioManager.getMusicLabel())
  }, [location.pathname])

  const updatePreference = (key, value) => {
    audioManager.setPreferences({ [key]: value })
  }

  return (
    <details className="audio-player">
      <summary className="audio-player__summary" aria-label="Open audio settings">
        <span aria-hidden="true">♫</span>
        <span>Audio</span>
        <span className="audio-player__summary-state">
          {preferences.muted ? 'Muted' : preferences.musicEnabled || preferences.effectsEnabled ? 'On' : 'Off'}
        </span>
      </summary>

      <div className="audio-player__panel" aria-label="Audio settings">
        <div className="audio-player__heading">
          <strong>Sound settings</strong>
          <span>{themeLabel}</span>
        </div>

        <label className="audio-player__toggle">
          <span>Background music</span>
          <input
            type="checkbox"
            checked={preferences.musicEnabled}
            onChange={(event) => updatePreference('musicEnabled', event.target.checked)}
          />
        </label>
        <label className="audio-player__volume">
          <span>Music volume <output>{Math.round(preferences.musicVolume * 100)}%</output></span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={preferences.musicVolume}
            onChange={(event) => updatePreference('musicVolume', Number(event.target.value))}
            aria-label="Music volume"
          />
        </label>

        <label className="audio-player__toggle">
          <span>Sound effects</span>
          <input
            type="checkbox"
            checked={preferences.effectsEnabled}
            onChange={(event) => updatePreference('effectsEnabled', event.target.checked)}
          />
        </label>
        <label className="audio-player__volume">
          <span>Effects volume <output>{Math.round(preferences.effectsVolume * 100)}%</output></span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={preferences.effectsVolume}
            onChange={(event) => updatePreference('effectsVolume', Number(event.target.value))}
            aria-label="Sound effects volume"
          />
        </label>

        <button
          type="button"
          className="audio-player__mute"
          aria-pressed={preferences.muted}
          onClick={() => updatePreference('muted', !preferences.muted)}
        >
          {preferences.muted ? 'Unmute all audio' : 'Mute all audio'}
        </button>
        <p className="audio-player__hint" role="status">
          Music starts after your first interaction.
        </p>
      </div>
    </details>
  )
}

export default AudioPlayer
