import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8080/jobs";
const STORAGE_KEY = "jobPortalJobs";

const getStoredJobs = () => {
  try {
    const savedJobs = localStorage.getItem(STORAGE_KEY);
    return savedJobs ? JSON.parse(savedJobs) : [];
  } catch (error) {
    return [];
  }
};

const saveJobs = jobs => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
};

const emptyForm = {
  name: "",
  title: "",
  company: "",
  location: "",
  salary: ""
};

function JobPortal() {
  const [jobs, setJobs] = useState(() => getStoredJobs());
  const [form, setForm] = useState(emptyForm);
  const [darkMode, setDarkMode] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch(API);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        setJobs(data);
        saveJobs(data);
      } catch (error) {
        setJobs(getStoredJobs());
      }
    };

    loadJobs();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addJob = async () => {
    const trimmedForm = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()])
    );

    if (!trimmedForm.title || !trimmedForm.company) {
      return;
    }

    const jobToAdd = { ...trimmedForm, id: Date.now() };
    const nextJobs = [...jobs, jobToAdd];

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trimmedForm)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const savedJob = await response.json();
      const updatedJobs = [...jobs, savedJob];
      setJobs(updatedJobs);
      saveJobs(updatedJobs);
      setForm(emptyForm);
      return;
    } catch (error) {
      setJobs(nextJobs);
      saveJobs(nextJobs);
      setForm(emptyForm);
    }
  };

  const deleteJob = async id => {
    const nextJobs = jobs.filter(job => job.id !== id);

    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      // Keep the UI in sync even when the backend is unavailable.
    }

    setJobs(nextJobs);
    saveJobs(nextJobs);
  };

  const companies = [...new Set(jobs.map(job => job.company).filter(Boolean))];
  const candidates = jobs.filter(job => job.name);

  return (
    <div className={`job-app ${darkMode ? "dark-mode" : ""}`}>
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">C</div>
          <div>
            <div className="brand-name">Career Connect</div>
            <div className="brand-subtitle">Career Platform</div>
          </div>
        </div>

        <nav className="nav">
          <a href="#jobs">Find Jobs</a>
          <a href="#companies">Companies</a>
          <a href="#candidates">Candidates</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="top-actions">
          <button type="button" className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light mode" : "Dark mode"}
          </button>
          <a className="signin-btn" href="#candidates">Candidate profile</a>
        </div>
      </header>

      <main className="page-shell">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Build your future with confidence</span>
            <h1>Find the right role for your next big move.</h1>
            <p>
              Discover opportunities tailored to your experience, build your profile,
              and connect with teams that match your ambitions.
            </p>

            <div className="hero-actions">
              <a className="primary-btn" href="#jobs">Explore jobs</a>
              <a className="secondary-btn" href="#post-job">Post a job</a>
            </div>

            <div className="hero-metrics">
              <div>
                <strong>12k+</strong>
                <span>Open roles</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>Candidate rating</span>
              </div>
              <div>
                <strong>1.2k</strong>
                <span>New this week</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="profile-card">
              <div className="mini-header">
                <span className="status-dot" />
                <span>Live hiring</span>
              </div>
              <h3>Senior Product Designer</h3>
              <p>Northstar Labs • Remote • Full-time</p>
              <div className="salary-row">
                <span>$120k - $150k</span>
                <span className="tag">Top match</span>
              </div>
            </div>

            <div className="insight-box">
              <div>
                <small>Talent match</small>
                <strong>96%</strong>
              </div>
              <div>
                <small>Interview rate</small>
                <strong>71%</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-panel" id="post-job">
          <div className="panel-header">
            <h2>Post a job opportunity</h2>
            <span>{jobs.length} roles available</span>
          </div>

          <div className="form">
            <input name="name" value={form.name} placeholder="Candidate / Job Name" onChange={handleChange} />
            <input name="title" value={form.title} placeholder="Job Title" onChange={handleChange} />
            <input name="company" value={form.company} placeholder="Company" onChange={handleChange} />
            <input name="location" value={form.location} placeholder="Location" onChange={handleChange} />
            <input name="salary" value={form.salary} placeholder="Salary" onChange={handleChange} />
            <button type="button" onClick={addJob}>Add Job</button>
          </div>
        </section>

        <section className="results-header" id="jobs">
          <div>
            <span className="section-kicker">Recommended roles</span>
            <h2>Fresh opportunities</h2>
          </div>
          <a className="filter-btn" href="#job-list">View all</a>
        </section>

        <div className="grid" id="job-list">
          {jobs.length === 0 ? (
            <div className="empty-state">No jobs added yet. Start by publishing a new opportunity.</div>
          ) : (
            jobs.map(job => (
              <div className="card" key={job.id}>
                <div className="card-topline">
                  <span className="company-badge">{job.company || "Company"}</span>
                  <span className="card-type">Full-time</span>
                </div>

                <h3>{job.title}</h3>
                <p>{job.company}</p>
                <p>{job.location}</p>
                <p>₹ {job.salary}</p>

                <div className="card-actions">
                  <button
                    type="button"
                    className="apply-btn"
                    disabled={appliedJobs.includes(job.id)}
                    onClick={() => setAppliedJobs([...appliedJobs, job.id])}
                  >
                    {appliedJobs.includes(job.id) ? "Applied" : "Apply now"}
                  </button>
                  <button type="button" className="delete-btn" onClick={() => deleteJob(job.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        <section className="directory-section" id="companies">
          <div className="section-heading">
            <span className="section-kicker">Explore employers</span>
            <h2>Companies hiring</h2>
          </div>
          {companies.length ? (
            <div className="directory-list">
              {companies.map(company => (
                <a className="directory-item" href="#job-list" key={company}>
                  <span className="directory-icon">{company.charAt(0).toUpperCase()}</span>
                  <span>{company}</span>
                  <span className="directory-arrow" aria-hidden="true">&#8599;</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="section-empty">Company listings will appear here when jobs are posted.</p>
          )}
        </section>

        <section className="directory-section" id="candidates">
          <div className="section-heading">
            <span className="section-kicker">Meet the talent</span>
            <h2>Candidate profiles</h2>
          </div>
          {candidates.length ? (
            <div className="directory-list">
              {candidates.map(candidate => (
                <a className="directory-item" href="#post-job" key={candidate.id}>
                  <span className="directory-icon">{candidate.name.charAt(0).toUpperCase()}</span>
                  <span>{candidate.name}</span>
                  <span className="directory-detail">{candidate.title}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="section-empty">Add a candidate name in the job form to feature a profile here.</p>
          )}
          <a className="secondary-btn section-action" href="#post-job">Create a profile</a>
        </section>

        <section className="directory-section pricing-section" id="pricing">
          <div className="section-heading">
            <span className="section-kicker">Straightforward access</span>
            <h2>Simple, free job discovery</h2>
          </div>
          <p className="section-empty">Browse roles, explore companies, and publish opportunities at no cost.</p>
          <a className="primary-btn section-action" href="#jobs">Browse jobs</a>
        </section>
      </main>
    </div>
  );
}

export default JobPortal;
