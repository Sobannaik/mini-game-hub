import './Layout.css'

/**
 * Layout — centred page wrapper.
 *
 * Props:
 *  - children
 *  - className — additional classes (e.g. 'layout--wide')
 */
function Layout({ children, className = '' }) {
  return (
    <div className={`layout ${className}`.trim()}>
      {children}
    </div>
  )
}

export default Layout
