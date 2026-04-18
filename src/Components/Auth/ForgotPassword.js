import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Button, Card, Container, Form } from "react-bootstrap";
import { api } from "../../Services/api";

function ForgotPassword() {
  const history = useHistory();

  const [form, setForm] = useState({ email: "", newPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await api.forgotPassword(form);
      setSuccess(data.message || "Password updated");
      setTimeout(() => history.push("/login"), 1200);
    } catch (err) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-page d-flex align-items-center justify-content-center">
      <Card className="auth-card">
        <Card.Body>
          <h3 className="text-center mb-3">Forgot Password</h3>
          <Form onSubmit={onSubmit}>
            <Form.Group>
              <Form.Label>Registered Email</Form.Label>
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
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                minLength={6}
                required
                value={form.newPassword}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, newPassword: e.target.value }))
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
            {success && <p className="auth-success">{success}</p>}
            <Button type="submit" block disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </Button>
          </Form>
          <div className="auth-links mt-3">
            <Link to="/login">Back to login</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ForgotPassword;
