import React, { useState, useEffect } from "react";
import { Row, Col, Container } from "react-bootstrap";
import Editor from "./WebEditor/Editor";
import Footer from "./Footer";

import { useLocalStorage } from "../Hooks/LocalStorage";
import { useAuth } from "../Context/AuthContext";
import { api } from "../Services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

function LaunguageManager() {
  const { token, user, logout } = useAuth();

  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type });
    return URL.createObjectURL(blob);
  };

  const htmlDefault = `<h2>Hello User</h2>`;

  const cssDefault = `body{
  text-align:center;
}`;

  const [htmlVal, updateHtmlStrorage] = useLocalStorage("html", htmlDefault);
  const [cssVal, updateCssStrorage] = useLocalStorage("css", cssDefault);
  const [jsVal, updateJsStrorage] = useLocalStorage("js", "");

  const [html, updateHtml] = useState(htmlVal);
  const [css, updateCss] = useState(cssVal);
  const [js, updateJs] = useState(jsVal);
  const [projectName, setProjectName] = useState("My Project");
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);

  const cssURL = getBlobURL(css, "text/css");
  const jsURL = getBlobURL(js, "text/javascript");

  const srcDoc = `
      <!DOCTYPE html>
      <html>
      <head>
      ${css && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
      <script src="https://code.jquery.com/jquery-3.5.1.min.js"
      integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
      </head>
        <body>${html}
        ${js && `<script src="${jsURL}"></script>`}
        </body>
      </html>`;

  useEffect(() => {
    setTimeout(() => {}, 500);
    updateHtmlStrorage(html);
    updateCssStrorage(css);
    updateJsStrorage(js);
  }, [html, css, js]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    setErrorMessage("");
    try {
      const data = await api.getMyProjects(token);
      setProjects(data.projects || []);
    } catch (err) {
      setErrorMessage(err.message || "Failed to fetch projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const saveProject = async () => {
    setErrorMessage("");
    setActionMessage("");
    try {
      const payload = {
        projectId: currentProjectId,
        name: projectName,
        html,
        css,
        js,
      };
      const result = await api.saveProject(token, payload);
      if (result.projectId) {
        setCurrentProjectId(result.projectId);
      }
      setActionMessage(result.message || "Project saved");
      fetchProjects();
    } catch (err) {
      setErrorMessage(err.message || "Failed to save project");
    }
  };

  const loadProject = async (projectId) => {
    setErrorMessage("");
    setActionMessage("");
    try {
      const result = await api.getProjectById(token, projectId);
      const project = result.project;
      setCurrentProjectId(project.id);
      setProjectName(project.name);
      updateHtml(project.html);
      updateCss(project.css);
      updateJs(project.js);
      setActionMessage("Project loaded");
    } catch (err) {
      setErrorMessage(err.message || "Failed to load project");
    }
  };

  const downloadCurrentProject = async () => {
    if (!currentProjectId) {
      setErrorMessage("Save the project first before downloading ZIP");
      return;
    }

    try {
      setErrorMessage("");
      setActionMessage("");
      const response = await fetch(api.getDownloadUrl(currentProjectId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to download zip");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const fileName = `${projectName.replace(/[^a-zA-Z0-9_-]/g, "_") || "project"}.zip`;
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setActionMessage("ZIP downloaded");
    } catch (err) {
      setErrorMessage(err.message || "Failed to download zip");
    }
  };

  return (
    <div className="editor-workspace">
      <Container fluid className="editor-auth-header">
        <Row className="align-items-center">
          <Col md={3} className="py-2">
            <div className="editor-user">
              <i className="far fa-user-circle mr-2"></i>
              {user?.name || user?.email}
            </div>
          </Col>
          <Col md={3} className="py-2">
            <input
              className="project-name-input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
            />
          </Col>
          <Col md={6} className="py-2 d-flex justify-content-md-end flex-wrap">
            <button className="editor-action-btn" onClick={saveProject}>
              <i className="far fa-save mr-2"></i>
              Save Project
            </button>
            <button
              className="editor-action-btn"
              onClick={downloadCurrentProject}
            >
              <i className="fas fa-file-archive mr-2"></i>
              Download ZIP
            </button>
            <button
              className="editor-action-btn secondary"
              onClick={fetchProjects}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh Projects
            </button>
            <button className="editor-action-btn danger" onClick={logout}>
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </Col>
        </Row>
        {(actionMessage || errorMessage) && (
          <Row>
            <Col>
              {actionMessage && (
                <p className="editor-ok-message">{actionMessage}</p>
              )}
              {errorMessage && (
                <p className="editor-error-message">{errorMessage}</p>
              )}
            </Col>
          </Row>
        )}
      </Container>

      <Container fluid className="saved-projects-strip">
        <Row className="align-items-center">
          <Col>
            <div className="saved-projects-inner">
              {loadingProjects && (
                <span className="saved-project-empty">Loading projects...</span>
              )}
              {!loadingProjects && projects.length === 0 && (
                <span className="saved-project-empty">
                  No projects yet. Save your first one.
                </span>
              )}
              {!loadingProjects &&
                projects.map((project) => (
                  <button
                    key={project.id}
                    className={`saved-project-btn ${
                      currentProjectId === project.id ? "active" : ""
                    }`}
                    onClick={() => loadProject(project.id)}
                  >
                    {project.name}
                  </button>
                ))}
            </div>
          </Col>
        </Row>
      </Container>

      <Container fluid={true} className="pane pane-top">
        <Row noGutters={true}>
          <Col md={4} className="editor-lang">
            <div className="editor-text">
              <i className="fab fa-html5"> </i> Html
            </div>

            <Editor
              launguage="xml"
              value={html}
              onChange={(newVal) => {
                updateHtml(newVal);
              }}
            />
          </Col>

          <Col md={4} className="editor-lang">
            <div className="editor-text">
              <i className="fab fa-css3-alt"></i> Css
            </div>
            <Editor
              launguage="css"
              value={css}
              onChange={(newVal) => {
                updateCss(newVal);
              }}
            />
          </Col>

          <Col md={4} className="editor-lang">
            <div className="editor-text">
              <i className="fab fa-js-square"></i> Js
            </div>
            <Editor
              launguage="javascript"
              value={js}
              onChange={(newVal) => {
                updateJs(newVal);
              }}
            />
          </Col>
        </Row>
      </Container>

      <Container fluid={true} className="pane pane-bottom">
        <Row noGutters={true}>
          <iframe
            srcDoc={srcDoc}
            className="output-pane"
            title="Live preview"
            allowFullScreen
          ></iframe>
        </Row>
      </Container>

      <Footer />
    </div>
  );
}

export default LaunguageManager;
