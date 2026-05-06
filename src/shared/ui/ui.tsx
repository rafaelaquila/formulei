import type { ReactNode } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'inverted' | 'outlined'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}

interface CardProps {
  title?: string
  children: ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <section className="card">
      {title ? <h2 className="card-title">{title}</h2> : null}
      <div className="card-content">{children}</div>
    </section>
  )
}

interface FieldProps {
  label: string
  /** Omitido quando o filho é um componente composto (ex.: combobox). */
  htmlFor?: string
  className?: string
  children: ReactNode
}

export function Field({ label, htmlFor, className = '', children }: FieldProps) {
  if (htmlFor) {
    return (
      <label className={`field ${className}`.trim()} htmlFor={htmlFor}>
        <span className="field-label">{label}</span>
        {children}
      </label>
    )
  }

  return (
    <div className={`field ${className}`.trim()}>
      <span className="field-label">{label}</span>
      {children}
    </div>
  )
}
