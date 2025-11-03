import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, register } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = mode === 'login' 
        ? await login(email, password)
        : await register(email, password, name)

      if (result.success) {
        onClose()
        setEmail('')
        setPassword('')
        setName('')
      } else {
        setError(result.error || 'Authentication failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal__close" onClick={onClose}>✕</button>
        
        <h2 className="auth-modal__title">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="auth-modal__subtitle">
          {mode === 'login' 
            ? 'Sign in to save your searches and studies' 
            : 'Join us to track your research'}
        </p>

        <div className="auth-modal__form">
          {mode === 'register' && (
            <div className="auth-modal__field">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className="auth-modal__field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="auth-modal__field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="auth-modal__error">
              {error}
            </div>
          )}

          <button 
            onClick={handleSubmit}
            className="auth-modal__submit"
            disabled={loading || !email || !password || (mode === 'register' && !name)}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div className="auth-modal__toggle">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('register')}>Sign Up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('login')}>Sign In</button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .auth-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(74, 74, 74, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .auth-modal {
          background: var(--morandi-card);
          border-radius: var(--radius);
          padding: 40px;
          width: 90%;
          max-width: 440px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          position: relative;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .auth-modal__close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          font-size: 24px;
          color: var(--morandi-text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .auth-modal__close:hover {
          background: rgba(139, 157, 158, 0.1);
          color: var(--morandi-text);
          transform: rotate(90deg);
        }

        .auth-modal__title {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: var(--morandi-text);
          background: linear-gradient(135deg, var(--morandi-primary), var(--morandi-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-modal__subtitle {
          margin: 0 0 32px 0;
          color: var(--morandi-text-muted);
          font-size: 14px;
        }

        .auth-modal__form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-modal__field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .auth-modal__field label {
          font-size: 13px;
          font-weight: 600;
          color: var(--morandi-text);
        }

        .auth-modal__field input {
          padding: 12px 16px;
          border: 2px solid var(--morandi-border);
          border-radius: var(--radius-sm);
          font-size: 14px;
          color: var(--morandi-text);
          font-family: inherit;
          transition: all 0.2s ease;
          background: white;
        }

        .auth-modal__field input:focus {
          outline: none;
          border-color: var(--morandi-primary);
          box-shadow: 0 0 0 3px var(--morandi-primary-light);
        }

        .auth-modal__error {
          padding: 12px 16px;
          background: rgba(184, 155, 155, 0.15);
          border: 1px solid var(--morandi-error);
          border-radius: var(--radius-xs);
          color: #8b6b6b;
          font-size: 13px;
        }

        .auth-modal__submit {
          padding: 14px 24px;
          background: linear-gradient(135deg, var(--morandi-primary), var(--morandi-secondary));
          color: white;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
        }

        .auth-modal__submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 157, 158, 0.3);
        }

        .auth-modal__submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .auth-modal__toggle {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: var(--morandi-text-muted);
        }

        .auth-modal__toggle button {
          background: none;
          border: none;
          color: var(--morandi-primary);
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-size: inherit;
          text-decoration: underline;
          transition: color 0.2s ease;
        }

        .auth-modal__toggle button:hover {
          color: var(--morandi-primary-hover);
          transform: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  )
}
