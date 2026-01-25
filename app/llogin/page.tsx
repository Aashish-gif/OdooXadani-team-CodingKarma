
// app/login/page.tsx
import './style.css';

export default function LoginPage() {
  return (
    <section>
      {/* Background animated squares */}
      {Array.from({ length: 250 }).map((_, index) => (
        <span key={index}></span>
      ))}

      <div className="signin">
        <div className="content">
          <h2>Sign In</h2>

          <div className="form">
            <div className="inputBox">
              <input type="text" required />
              <i>Username</i>
            </div>

            <div className="inputBox">
              <input type="password" required />
              <i>Password</i>
            </div>

            <div className="links">
              <a href="#">Forgot Password</a>
            </div>

            <div className="inputBox">
              <input type="submit" value="Login" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}