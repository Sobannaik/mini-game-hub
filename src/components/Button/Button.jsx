import { Link } from 'react-router-dom'
import './Button.css'

/**
 * Reusable Button component.
 *
 * Props:
 *  - children   — button label / content
 *  - onClick    — click handler (when used as a plain button)
 *  - to         — if provided, renders as a <Link> instead of <button>
 *  - variant    — 'primary' (default) | 'ghost' | 'outline'
 *  - size       — 'sm' | 'md' (default) | 'lg'
 *  - disabled   — disables the button
 *  - className  — additional CSS classes
 */
function Button({
  children,
  onClick,
  to,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, className]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
