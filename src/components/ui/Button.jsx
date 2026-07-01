import './Button.css'

export default function Button({ children, variant = 'primary', size = 'md', loading = false, ...props }) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${loading ? 'btn--loading' : ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className="btn__spinner" />}
      <span className={loading ? 'btn__content--hidden' : ''}>{children}</span>
    </button>
  )
}
