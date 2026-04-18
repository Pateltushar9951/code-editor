import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Button, Card, Container, Form } from "react-bootstrap";
import { api } from "../../Services/api";
import { useAuth } from "../../Context/AuthContext";

function Register() {
  const history = useHistory();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.register(form);
      login(data);
      history.push("/web");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-page d-flex align-items-center justify-content-center">
      <Card className="auth-card">
        <Card.Body>
          <h3 className="text-center mb-3">Register</h3>
          <Form onSubmit={onSubmit}>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </Form.Group>
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
                minLength={6}
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
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </Form>
          <div className="auth-links mt-3">
            <Link to="/login">Already have an account?</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;
