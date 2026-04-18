import React from "react";
import { Row, Col, Container } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import sh1 from "../Assets/shape-1.svg";
import sh2 from "../Assets/shape-2.svg";
import sh3 from "../Assets/shape-3.svg";
import sh6 from "../Assets/shape-6.svg";
import homeImg from "../Assets/img0.png";
import { Link } from "react-router-dom";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function Home() {
  return (
    <div className="home-shell">
      <Container className="home-wrapper">
        <img src={sh1} alt="fig1" className="shape shape-1" />
        <img src={sh2} alt="fig2" className="shape shape-2" />
        <img src={sh3} alt="fig3" className="shape shape-3" />
        <img src={sh6} alt="fig6" className="shape shape-6" />
        <Row className="text-center home-hero-row">
          <Col md={6}>
            <img
              src={homeImg}
              className="img-fluid home-hero-image"
              alt="main img"
            />
          </Col>
          <Col md={6} className="home-copy">
            <p className="home-kicker">Professional Online IDE</p>
            <h1 className="home-title">Code From Anywhere, Build Faster</h1>
            <p className="home-description">
              With this online code editor you can edit HTML, CSS and JavaScript
              code, and live preview of site instantly.
            </p>
            <Button
              variant="primary"
              className="home-cta-btn"
              as={Link}
              to="/login"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Login to Start
            </Button>

            <div className="home-secondary-link">
              <Link to="/register">New user? Create an account</Link>
            </div>

            {/* <h2 style={{ color: "#f0c19e", paddingTop: "70px" }}>
              Generate README in Seconds
            </h2>
            <h5
              style={{
                textAlign: "justify",
                color: "rgb(154 179 205)",
                paddingTop: "10px",
              }}
            >
              Online markdown editor, with custom toolbar to help you make your
              readme easily.
            </h5>
            <Button variant="primary" style={btnStyle} as={Link} to="/markdown">
              Markdown Editor
            </Button> */}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;
