const SETTINGS_KEY = 'gamebreak-audio-settings'
const MUSIC_TRACKS = {
  home: '/audio/music/home.wav',
  arcade: '/audio/music/arcade.wav',
  adventure: '/audio/music/adventure.wav',
}
const MUSIC_LABELS = {
  home: 'Mellow Keys',
  arcade: 'Arcade Pulse',
  adventure: 'Cloudlight Ambient',
}
const SOUND_EFFECTS = {
  'ui-click': '/audio/sfx/ui-click.wav',
  navigation: '/audio/sfx/navigation.wav',
  start: '/audio/sfx/start.wav',
  success: '/audio/sfx/success.wav',
  invalid: '/audio/sfx/invalid.wav',
  draw: '/audio/sfx/draw.wav',
  move: '/audio/sfx/move.wav',
  collect: '/audio/sfx/collect.wav',
  jump: '/audio/sfx/jump.wav',
  collision: '/audio/sfx/collision.wav',
  'power-up': '/audio/sfx/power-up.wav',
  'game-over': '/audio/sfx/game-over.wav',
  pause: '/audio/sfx/pause.wav',
}
const DEFAULT_PREFERENCES = {
  musicEnabled: false,
  effectsEnabled: true,
  musicVolume: 0.24,
  effectsVolume: 0.46,
  muted: false,
}

function clampVolume(value, fallback) {
  const volume = Number(value)
  return Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : fallback
}

function loadPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    return {
      musicEnabled: typeof saved.musicEnabled === 'boolean' ? saved.musicEnabled : DEFAULT_PREFERENCES.musicEnabled,
      effectsEnabled: typeof saved.effectsEnabled === 'boolean' ? saved.effectsEnabled : DEFAULT_PREFERENCES.effectsEnabled,
      musicVolume: clampVolume(saved.musicVolume, DEFAULT_PREFERENCES.musicVolume),
      effectsVolume: clampVolume(saved.effectsVolume, DEFAULT_PREFERENCES.effectsVolume),
      muted: typeof saved.muted === 'boolean' ? saved.muted : DEFAULT_PREFERENCES.muted,
    }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

class AudioManager {
  constructor() {
    this.preferences = loadPreferences()
    this.section = 'home'
    this.unlocked = false
    this.initialized = false
    this.currentMusic = null
    this.previousMusic = null
    this.currentTrack = null
    this.fadeFrame = 0
    this.fadeStart = 0
    this.activeEffects = new Set()
    this.onPreferenceChange = null
    this.onInteraction = this.handleInteraction.bind(this)
    this.onClick = this.handleClick.bind(this)
    this.onCustomSound = this.handleCustomSound.bind(this)
    this.onVisibilityChange = this.handleVisibilityChange.bind(this)
  }

  initialize() {
    if (this.initialized || typeof document === 'undefined') return
    this.initialized = true
    document.addEventListener('pointerdown', this.onInteraction, true)
    document.addEventListener('keydown', this.onInteraction, true)
    document.addEventListener('click', this.onClick, true)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    window.addEventListener('gamebreak-sfx', this.onCustomSound)
  }

  destroy() {
    if (!this.initialized || typeof document === 'undefined') return
    document.removeEventListener('pointerdown', this.onInteraction, true)
    document.removeEventListener('keydown', this.onInteraction, true)
    document.removeEventListener('click', this.onClick, true)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    window.removeEventListener('gamebreak-sfx', this.onCustomSound)
    this.stopMusic()
    this.activeEffects.forEach((audio) => audio.pause())
    this.activeEffects.clear()
    this.initialized = false
  }

  getPreferences() {
    return { ...this.preferences }
  }

  setPreferences(nextValues) {
    this.preferences = { ...this.preferences, ...nextValues }
    this.preferences.musicVolume = clampVolume(this.preferences.musicVolume, DEFAULT_PREFERENCES.musicVolume)
    this.preferences.effectsVolume = clampVolume(this.preferences.effectsVolume, DEFAULT_PREFERENCES.effectsVolume)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.preferences))
    } catch {
      // Audio controls remain usable when browser storage is unavailable.
    }
    this.applyAudioState()
    window.dispatchEvent(new CustomEvent('gamebreak-audio-preferences', { detail: this.getPreferences() }))
  }

  setSection(section) {
    if (!MUSIC_TRACKS[section] || section === this.section) return
    this.section = section
    window.dispatchEvent(new CustomEvent('gamebreak-audio-section-updated', {
      detail: { section, label: this.getMusicLabel() },
    }))
    if (this.unlocked) this.startMusic()
  }

  handleInteraction() {
    if (this.unlocked) return
    this.unlocked = true
    if (this.preferences.musicEnabled && !this.preferences.muted) this.startMusic()
  }

  handleClick(event) {
    const target = event.target instanceof Element
      ? event.target.closest('button, a, [role="button"]')
      : null
    if (!target || target.hasAttribute('data-audio-ignore')) return

    const requested = target.getAttribute('data-sfx')
    if (requested && SOUND_EFFECTS[requested]) {
      this.playSfx(requested)
      return
    }

    this.playSfx(target.tagName === 'A' ? 'navigation' : 'ui-click')
  }

  handleCustomSound(event) {
    const sound = event.detail?.name
    if (typeof sound === 'string') this.playSfx(sound)
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.pauseMusic()
    } else if (this.unlocked && this.preferences.musicEnabled && !this.preferences.muted) {
      this.startMusic()
    }
  }

  applyAudioState() {
    if (this.preferences.muted || !this.preferences.musicEnabled) {
      this.pauseMusic()
    } else if (this.unlocked) {
      const activeTrack = MUSIC_TRACKS[this.section] || MUSIC_TRACKS.home
      if (this.currentMusic && !this.currentMusic.paused && this.currentTrack === activeTrack) {
        this.currentMusic.volume = this.preferences.musicVolume
      } else {
        this.startMusic()
      }
    }

    if (this.preferences.muted || !this.preferences.effectsEnabled) {
      this.activeEffects.forEach((audio) => audio.pause())
      this.activeEffects.clear()
    }
  }

  async startMusic() {
    if (!this.unlocked || this.preferences.muted || !this.preferences.musicEnabled) return

    const track = MUSIC_TRACKS[this.section] || MUSIC_TRACKS.home
    if (track === this.currentTrack && this.currentMusic && !this.currentMusic.paused) return

    if (this.fadeFrame) cancelAnimationFrame(this.fadeFrame)
    if (this.previousMusic) {
      this.previousMusic.pause()
      this.previousMusic = null
    }

    const outgoing = this.currentMusic
    const incoming = new Audio(track)
    incoming.preload = 'none'
    incoming.loop = true
    incoming.volume = 0

    try {
      await incoming.play()
    } catch {
      incoming.pause()
      return
    }

    this.currentMusic = incoming
    this.currentTrack = track
    this.previousMusic = outgoing
    this.fadeStart = performance.now()

    const crossfade = (now) => {
      const progress = Math.min(1, (now - this.fadeStart) / 900)
      const targetVolume = this.preferences.musicVolume
      incoming.volume = targetVolume * progress
      if (outgoing) outgoing.volume = targetVolume * (1 - progress)

      if (progress < 1) {
        this.fadeFrame = requestAnimationFrame(crossfade)
        return
      }

      if (outgoing) outgoing.pause()
      this.previousMusic = null
      this.fadeFrame = 0
    }

    this.fadeFrame = requestAnimationFrame(crossfade)
  }

  pauseMusic() {
    if (this.fadeFrame) cancelAnimationFrame(this.fadeFrame)
    this.fadeFrame = 0
    this.currentMusic?.pause()
    this.previousMusic?.pause()
    this.previousMusic = null
  }

  stopMusic() {
    this.pauseMusic()
    this.currentMusic = null
    this.currentTrack = null
  }

  playSfx(name) {
    const source = SOUND_EFFECTS[name]
    if (!source || this.preferences.muted || !this.preferences.effectsEnabled || typeof Audio === 'undefined') return

    const audio = new Audio(source)
    audio.preload = 'none'
    audio.volume = this.preferences.effectsVolume
    this.activeEffects.add(audio)
    audio.addEventListener('ended', () => this.activeEffects.delete(audio), { once: true })
    audio.addEventListener('error', () => this.activeEffects.delete(audio), { once: true })
    audio.play().catch(() => this.activeEffects.delete(audio))
  }

  getMusicLabel() {
    return MUSIC_LABELS[this.section] || MUSIC_LABELS.home
  }
}

export const audioManager = new AudioManager()