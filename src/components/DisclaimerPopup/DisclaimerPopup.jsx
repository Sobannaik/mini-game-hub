import { useState } from 'react'
import './DisclaimerPopup.css'

function DisclaimerPopup() {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem('gamebreak-note-dismissed') !== 'true'
    } catch {
      return true
    }
  })

  const handleContinue = () => {
    try {
      localStorage.setItem('gamebreak-note-dismissed', 'true')
    } catch {
      // The note can still be dismissed when storage is unavailable.
    }
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="disclaimer-popup" role="presentation">
      <div
        className="disclaimer-popup__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-popup-title"
        aria-describedby="disclaimer-popup-description"
      >
        <div className="disclaimer-popup__icon" aria-hidden="true">!</div>
        <div className="disclaimer-popup__content">
          <p className="disclaimer-popup__eyebrow">Before you play</p>
          <h2 id="disclaimer-popup-title">A quick project note</h2>
          <p id="disclaimer-popup-description">
            Game Break is still under development. Some games may contain bugs,
            unfinished features, or controls that do not work perfectly on every device.
            Thanks for your patience while we continue improving the collection.
          </p>

          <button
            className="disclaimer-popup__button"
            type="button"
            onClick={handleContinue}
          >
            Got it, let’s play
          </button>
        </div>
      </div>
    </div>
  )
}

export default DisclaimerPopup