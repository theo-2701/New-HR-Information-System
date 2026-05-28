export default function SignIn({ onLogin }) {
  return (
    <section className="screen is-active">
      <div className="auth-bg">
        <div className="auth-card">
          <div className="brand">
            <div className="brand__s">S</div>
            <div className="brand__text">
              <span className="brand__name">SEVAKA</span>
              <span className="brand__sub">Human Resource Information System</span>
            </div>
          </div>

          <div className="auth-card__heading">
            <h2>Masuk dengan ID Karyawan</h2>
            <p>Pastikan perusahaan Anda sudah memiliki username perusahaan sebelum melakukan login dengan ID karyawan.</p>
          </div>

          <form className="auth-card__form" onSubmit={(e) => { e.preventDefault(); onLogin() }}>
            <div className="field">
              <label className="field__label">Username Perusahaan<em>*</em></label>
              <input className="field__input" placeholder="Masukkan Username Perusahaan" defaultValue="perusahaan.id" autoComplete="organization" />
            </div>
            <div className="field">
              <label className="field__label">Employee ID<em>*</em></label>
              <input className="field__input" placeholder="EMP-XXXX" defaultValue="EMP-2041" autoComplete="username" />
            </div>
            <div className="field">
              <label className="field__label">Password<em>*</em></label>
              <input className="field__input" type="password" placeholder="Masukkan Password" defaultValue="••••••••" autoComplete="current-password" />
            </div>

            <div className="auth-card__form-row">
              <label className="checkbox">
                <input type="checkbox" defaultChecked />
                <span className="checkbox__box"></span>
                Ingat saya
              </label>
              <a href="#">Lupa password?</a>
            </div>

            <button className="btn btn--primary" type="submit" style={{ width: '100%', justifyContent: 'center', height: '44px', borderRadius: '999px' }}>
              Masuk
            </button>
          </form>

          <div style={{ textAlign: 'center', font: '500 12px/1.4 var(--font-body)', color: 'var(--fg-3)' }}>
            Butuh akses? Hubungi <a href="#" style={{ color: 'var(--color-secondary-500)', fontWeight: 600 }}>Administrator HR</a> perusahaan Anda.
          </div>
        </div>
      </div>
    </section>
  )
}
