import React, { useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Button, Card, Container, Form } from "react-bootstrap";
import { api } from "../../Services/api";
import { useAuth } from "../../Context/AuthContext";

function Login() {
  const history = useHistory();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from || "/web";
      history.replace(redirectTo);
    }
  }, [history, isAuthenticated, location.state]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login(form);
      login(data);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-page d-flex align-items-center justify-content-center">
      <Card className="auth-card">
        <Card.Body>
          <h3 className="text-center mb-3">Login</h3>
          <Form onSubmit={onSubmit}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
              />
              <Form.Check
                type="checkbox"
                label="Show Password"
                className="mt-2"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
            </Form.Group>
            {error && <p className="auth-error">{error}</p>}
            <Button type="submit" block disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </Form>
          <div className="auth-links mt-3">
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to="/register">Create account</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
