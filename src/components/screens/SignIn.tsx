import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, Info } from 'lucide-react'
import { useT } from '@/i18n'

type AuthScreen = 'login' | 'idkaryawan' | 'phone' | 'otp' | 'forgot'
type IntroPhase = 'playing' | 'leaving' | 'done'

interface SignInProps {
  onLogin: () => void
}

const LETTER_DELAYS = [300, 380, 460, 540, 620, 700]

export default function SignIn({ onLogin }: SignInProps) {
  const t = useT()
  const a = t.auth

  const [introPhase, setIntroPhase] = useState<IntroPhase>('playing')
  const [stageClass, setStageClass] = useState('intro-pending')
  const [screen, setScreen] = useState<AuthScreen>('login')
  const [showPw, setShowPw] = useState(false)
  const [showPwId, setShowPwId] = useState(false)
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [otpTimer, setOtpTimer] = useState(59)
  const [otpResendReady, setOtpResendReady] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const leave = setTimeout(() => setIntroPhase('leaving'), 1800)
    const done  = setTimeout(() => {
      setIntroPhase('done')
      setStageClass('reveal')
    }, 2260)
    return () => { clearTimeout(leave); clearTimeout(done) }
  }, [])

  useEffect(() => {
    if (screen !== 'otp') return
    setOtpTimer(59)
    setOtpResendReady(false)
    timerRef.current = setInterval(() => {
      setOtpTimer(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setOtpResendReady(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [screen])

  const goTo = (s: AuthScreen) => setScreen(s)

  const skipIntro = () => {
    if (introPhase !== 'playing') return
    setIntroPhase('leaving')
    setTimeout(() => { setIntroPhase('done'); setStageClass('reveal') }, 460)
  }

  const handleOtpChange = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otpValues]
    next[idx] = value
    setOtpValues(next)
    if (value && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = ['', '', '', '', '', '']
    digits.split('').forEach((d, i) => { next[i] = d })
    setOtpValues(next)
    otpRefs.current[Math.min(digits.length, 5)]?.focus()
  }

  const otpComplete = otpValues.every(v => v !== '')

  const fmt = (n: number) => String(n).padStart(2, '0')
  const timerDisplay = `${fmt(Math.floor(otpTimer / 60))}:${fmt(otpTimer % 60)}`

  return (
    <>
      {/* ===== Intro Splash ===== */}
      {introPhase !== 'done' && (
        <div
          className={`intro${introPhase === 'leaving' ? ' is-leaving' : ''}`}
          onClick={skipIntro}
        >
          <div className="intro__inner">
            <div className="intro__mark"><span>S</span></div>
            <div className="intro__word">
              {'SEVAKA'.split('').map((l, i) => (
                <span key={i} style={{ animationDelay: `${LETTER_DELAYS[i]}ms` }}>{l}</span>
              ))}
            </div>
            <div className="intro__tagline">{a.tagline}</div>
          </div>
        </div>
      )}

      {/* ===== Auth Stage ===== */}
      <div className={`auth-stage ${stageClass}`}>
        <div className="auth-card">

          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand__s">S</div>
            <div className="auth-brand__text">
              <span className="auth-brand__name">SEVAKA</span>
              <span className="auth-brand__sub">Human Resource Information System</span>
            </div>
          </div>

          {/* ===== Screen: Login (email) ===== */}
          <section className={`auth-screen${screen === 'login' ? ' is-active' : ''}`}>
            <h1 className="auth-screen__title">{a.signIn}</h1>
            <form className="auth-form" onSubmit={e => { e.preventDefault(); goTo('otp') }}>
              <div className="field">
                <label className="field__label">{a.emailLabel}</label>
                <input className="field__input" type="email" autoComplete="email" placeholder={a.emailPlaceholder} />
              </div>
              <div className="field field--pw">
                <label className="field__label">{a.passwordLabel}</label>
                <input
                  className="field__input"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={a.passwordPlaceholder}
                />
                <button className="field__eye" type="button" aria-label={a.showPassword} onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              <button className="auth-submit" type="submit">{a.signIn}</button>
            </form>

            <div className="auth-or">{a.or}</div>
            <div className="auth-alts">
              <button className="auth-btn" type="button" onClick={onLogin}>
                <svg className="auth-btn__gicon" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
                  <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                  <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
                  <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
                </svg>
                {a.signInWithGoogle}
              </button>
              <button className="auth-btn" type="button" onClick={() => goTo('idkaryawan')}>
                {a.signInWithEmployeeId}
              </button>
              <button className="auth-btn" type="button" onClick={() => goTo('phone')}>
                {a.signInWithPhone}
              </button>
            </div>
            <div className="auth-foot-link">
              <a href="#" onClick={e => { e.preventDefault(); goTo('forgot') }}>{a.forgotPassword}</a>
            </div>
          </section>

          {/* ===== Screen: Employee ID ===== */}
          <section className={`auth-screen${screen === 'idkaryawan' ? ' is-active' : ''}`}>
            <h1 className="auth-screen__title auth-screen__title--sm">{a.employeeIdTitle}</h1>
            <p className="auth-screen__lead">{a.employeeIdLead}</p>
            <form className="auth-form" onSubmit={e => { e.preventDefault(); goTo('otp') }}>
              <div className="field">
                <label className="field__label">{a.companyUsername}</label>
                <input className="field__input" placeholder={a.companyUsernamePlaceholder} />
              </div>
              <div className="field">
                <label className="field__label field__label-info">
                  <span>{a.nikLabel}</span>
                  <Info size={14} />
                </label>
                <input className="field__input" placeholder={a.nikPlaceholder} />
              </div>
              <div className="field field--pw">
                <label className="field__label">{a.passwordLabel}</label>
                <input
                  className="field__input"
                  type={showPwId ? 'text' : 'password'}
                  placeholder={a.passwordPlaceholder}
                />
                <button className="field__eye" type="button" aria-label={a.showPassword} onClick={() => setShowPwId(v => !v)}>
                  {showPwId ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              <button className="auth-submit" type="submit">{a.signIn}</button>
            </form>
            <div className="auth-or">{a.or}</div>
            <div className="auth-alts">
              <button className="auth-btn" type="button" onClick={() => goTo('login')}>
                {a.useOtherMethod}
              </button>
            </div>
            <div className="auth-foot-link">
              <a href="#" onClick={e => { e.preventDefault(); goTo('forgot') }}>{a.forgotPassword}</a>
            </div>
          </section>

          {/* ===== Screen: Phone ===== */}
          <section className={`auth-screen${screen === 'phone' ? ' is-active' : ''}`}>
            <h1 className="auth-screen__title auth-screen__title--sm">{a.phoneTitle}</h1>
            <form className="auth-form" onSubmit={e => { e.preventDefault(); goTo('otp') }}>
              <div className="field">
                <label className="field__label">{a.phoneLabel}</label>
                <div className="field--phone">
                  <span className="field__prefix">+62</span>
                  <input className="field__input" type="tel" inputMode="numeric" placeholder={a.phonePlaceholder} />
                </div>
              </div>
              <button className="auth-submit" type="submit">{a.continue}</button>
            </form>
            <div className="auth-or">{a.or}</div>
            <div className="auth-alts">
              <button className="auth-btn" type="button" onClick={() => goTo('login')}>
                {a.useOtherMethod}
              </button>
            </div>
          </section>

          {/* ===== Screen: OTP ===== */}
          <section className={`auth-screen${screen === 'otp' ? ' is-active' : ''}`}>
            <h1 className="auth-screen__title auth-screen__title--sm">{a.otpTitle}</h1>
            <p className="auth-screen__lead">
              {a.otpLead}{' '}
              <b><a href="mailto:employee@sevaka.id">employee@sevaka.id</a></b>. {a.otpLead2}
            </p>

            <div className="auth-form auth-form--otp">
              <div className="otp-row">
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el }}
                    className={`otp-box${val ? ' is-filled' : ''}`}
                    maxLength={1}
                    inputMode="numeric"
                    autoComplete={idx === 0 ? 'one-time-code' : undefined}
                    aria-label={`Digit ${idx + 1}`}
                    value={val}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                  />
                ))}
              </div>

              <label className="checkbox otp-remember">
                <input type="checkbox" />
                <span className="checkbox__box"></span>
                <span>{a.otpRemember}</span>
              </label>

              <button
                className="auth-submit"
                type="button"
                disabled={!otpComplete}
                onClick={onLogin}
              >
                {a.verify}
              </button>
            </div>

            <div className="otp-resend">
              <span>{a.otpNotReceived}</span>
              <br />
              {!otpResendReady ? (
                <span>
                  {a.otpResendIn}{' '}
                  <span className="otp-resend__count">{timerDisplay}</span>
                </span>
              ) : (
                <button
                  className="otp-resend__link"
                  type="button"
                  onClick={() => { setOtpTimer(59); setOtpResendReady(false) }}
                >
                  {a.otpResend}
                </button>
              )}
            </div>

            <div className="otp-via">{a.otpOrResend}</div>
            <div className="otp-channels">
              <button className="auth-btn" type="button" disabled>{a.sms}</button>
              <button className="auth-btn" type="button" disabled>{a.whatsapp}</button>
            </div>
          </section>

          {/* ===== Screen: Forgot Password ===== */}
          <section className={`auth-screen${screen === 'forgot' ? ' is-active' : ''}`}>
            <h1 className="auth-screen__title auth-screen__title--sm">{a.forgotTitle}</h1>
            <p className="auth-screen__lead">{a.forgotLead}</p>
            <form className="auth-form" onSubmit={e => { e.preventDefault(); goTo('otp') }}>
              <div className="field">
                <label className="field__label">{a.emailLabel}</label>
                <input className="field__input" type="email" placeholder={a.emailPlaceholder} />
              </div>
              <button className="auth-submit" type="submit">{a.sendResetLink}</button>
            </form>
            <div className="auth-foot-link">
              <a href="#" onClick={e => { e.preventDefault(); goTo('login') }}>{a.backToSignIn}</a>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="auth-footer">
          <div className="auth-footer__links">
            <a href="#" onClick={e => e.preventDefault()}>{a.privacyPolicy}</a>
            <span className="auth-footer__dot">•</span>
            <a href="#" onClick={e => e.preventDefault()}>{a.termsOfUse}</a>
            <span className="auth-footer__dot">•</span>
            <a href="#" onClick={e => e.preventDefault()}>{a.aboutSevaka}</a>
          </div>
          <div className="auth-footer__copy">{a.copyright}</div>
        </div>
      </div>
    </>
  )
}
