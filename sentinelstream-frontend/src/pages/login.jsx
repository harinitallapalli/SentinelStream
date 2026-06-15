import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>SentinelStream</h1>

        <input
          type="text"
          placeholder="Username"
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
        />

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>

        <p>
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fb",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    width: "350px",
    boxShadow: "0 0 20px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default Login;
