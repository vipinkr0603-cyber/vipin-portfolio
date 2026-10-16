const { useState, useEffect, useRef, useCallback } = React;
const html = htm.bind(React.createElement);

/* ================= DATA ================= */
const PROFILE = {
    name: "Vipin Kumar",
    email: "vipin.kr0603@gmail.com",
    phone: "+91 9973782311",
    linkedin: "https://www.linkedin.com/in/vipin-kumar-701792406",
    github: "#", // put your GitHub profile link here
};

const NAV = ["home", "about", "skills", "projects", "education", "contact"];

const SKILLS = [
    { icon: "☕", title: "Java", items: ["Core Java", "OOP", "Collections", "Exception Handling"] },
    { icon: "🧠", title: "DSA", items: ["Data Structures", "Problem Solving"] },
    { icon: "🌐", title: "Frontend", items: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "React"] },
    { icon: "🌱", title: "Backend", items: ["Spring", "Spring Boot", "JDBC", "Servlets"] },
    { icon: "🗄️", title: "Database", items: ["SQL", "MySQL"] },
    { icon: "🛠️", title: "Tools", items: ["Git", "GitHub", "VS Code", "Eclipse", "IntelliJ IDEA"] },
];

const PROJECTS = [
    {
        icon: "🎓",
        title: "Student Management System",
        text: "A Java-based application for managing student information with CRUD operations and database connectivity.",
        tech: ["Java", "OOP", "JDBC", "MySQL"],
        type: "Backend",
        link: "#",
    },
    {
        icon: "💻",
        title: "Personal Portfolio",
        text: "A responsive personal portfolio website designed to showcase my skills, projects and developer profile.",
        tech: ["HTML", "CSS", "JavaScript", "React"],
        type: "Frontend",
        link: "#",
    },
];

/* ================= HOOKS ================= */
function useTyping(words, speed = 80, pause = 1600) {
    const [text, setText] = useState("");
    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) { setText(words[0]); return; }
        let w = 0, c = 0, del = false, t;
        const tick = () => {
            const word = words[w];
            setText(word.slice(0, c));
            let d = del ? speed / 2 : speed;
            if (!del && c === word.length) { del = true; d = pause; }
            else if (del && c === 0) { del = false; w = (w + 1) % words.length; d = 350; }
            else c += del ? -1 : 1;
            t = setTimeout(tick, d);
        };
        tick();
        return () => clearTimeout(t);
    }, []);
    return text;
}

function useInView(options) {
    const ref = useRef(null);
    const [seen, setSeen] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setSeen(true); io.disconnect(); }
        }, options || { threshold: 0.15 });
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return [ref, seen];
}

function useActiveSection(ids) {
    const [active, setActive] = useState(ids[0]);
    useEffect(() => {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
        }, { rootMargin: "-45% 0px -50% 0px" });
        ids.forEach((id) => { const el = document.getElementById(id); el && io.observe(el); });
        return () => io.disconnect();
    }, []);
    return active;
}

function useScrollProgress() {
    const [p, setP] = useState(0);
    useEffect(() => {
        const on = () => {
            const h = document.documentElement;
            setP((h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100);
        };
        on();
        window.addEventListener("scroll", on, { passive: true });
        return () => window.removeEventListener("scroll", on);
    }, []);
    return p;
}

/* ================= SMALL COMPONENTS ================= */
function Reveal({ children, delay = 0, className = "" }) {
    const [ref, seen] = useInView();
    return html`<div ref=${ref} className=${"reveal " + (seen ? "in " : "") + className}
        style=${{ transitionDelay: delay + "ms" }}>${children}</div>`;
}

function SectionTitle({ eyebrow, children }) {
    return html`<${Reveal}>
        <div className="section-head">
            <span className="eyebrow">${eyebrow}</span>
            <h2 className="section-title">${children}</h2>
        </div>
    <//>`;
}

function Counter({ to, suffix = "" }) {
    const [ref, seen] = useInView();
    const [n, setN] = useState(0);
    useEffect(() => {
        if (!seen) return;
        const start = performance.now(), dur = 1200;
        let raf;
        const step = (now) => {
            const k = Math.min((now - start) / dur, 1);
            setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
            if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [seen]);
    return html`<span ref=${ref}>${n}${suffix}</span>`;
}

/* 3D tilt + cursor glow on cards */
function Tilt({ children, className = "" }) {
    const ref = useRef(null);
    const move = (e) => {
        const el = ref.current;
        if (!el || window.matchMedia("(hover: none)").matches) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--rx", ((0.5 - y) * 8).toFixed(2) + "deg");
        el.style.setProperty("--ry", ((x - 0.5) * 8).toFixed(2) + "deg");
        el.style.setProperty("--mx", x * 100 + "%");
        el.style.setProperty("--my", y * 100 + "%");
    };
    const leave = () => {
        const el = ref.current;
        if (!el) return;
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
    };
    return html`<div ref=${ref} className=${"tilt " + className} onMouseMove=${move} onMouseLeave=${leave}>${children}</div>`;
}

/* ================= SECTIONS ================= */
function Navbar({ active, theme, toggleTheme }) {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const esc = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", esc);
        return () => document.removeEventListener("keydown", esc);
    }, []);
    return html`
        <header className="header">
            <nav className="navbar">
                <a href="#home" className="logo">Vipin<span>.</span></a>
                <ul className=${"nav-links " + (open ? "open" : "")}>
                    ${NAV.map((id) => html`
                        <li key=${id}>
                            <a href=${"#" + id} className=${active === id ? "active" : ""} onClick=${() => setOpen(false)}>
                                ${id[0].toUpperCase() + id.slice(1)}
                            </a>
                        </li>`)}
                </ul>
                <div className="nav-actions">
                    <button className="icon-btn" type="button" onClick=${toggleTheme}
                        aria-label=${theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
                        ${theme === "dark" ? "☀️" : "🌙"}
                    </button>
                    <button className="icon-btn menu-btn" type="button" aria-expanded=${open}
                        aria-label=${open ? "Close menu" : "Open menu"} onClick=${() => setOpen(!open)}>
                        ${open ? "✕" : "☰"}
                    </button>
                </div>
            </nav>
        </header>`;
}

function Hero() {
    const role = useTyping(["Full Stack Developer", "Spring Boot Learner", "Problem Solver", "React Enthusiast"]);
    return html`
        <section id="home" className="hero">
            <div className="hero-copy">
                <span className="pill"><i className="dot"></i> Open to internships & entry-level roles</span>
                <p className="hello">Hello, I'm</p>
                <h1 className="gradient-text">${PROFILE.name}</h1>
                <h2 className="role">Java <span className="typed">${role}</span></h2>
                <p className="lead">
                    Computer Science & Engineering student passionate about Java development,
                    web technologies and building real-world applications.
                </p>
                <div className="buttons">
                    <a href="#projects" className="btn">View Projects <span aria-hidden="true">→</span></a>
                    <a href=${PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="btn outline">LinkedIn</a>
                    <a href="#contact" className="btn ghost">Contact</a>
                </div>
            </div>

            <div className="hero-art" aria-hidden="true">
                <div className="code-card">
                    <div className="code-bar"><i></i><i></i><i></i><span>Developer.java</span></div>
                    <pre><code>
<b className="k">public class</b> <b className="t">Developer</b> {"{"}
  <b className="k">String</b> name = <b className="s">"Vipin Kumar"</b>;
  <b className="k">String</b>[] stack = {"{"}
    <b className="s">"Java"</b>, <b className="s">"Spring Boot"</b>,
    <b className="s">"MySQL"</b>, <b className="s">"React"</b>
  {"}"};
  <b className="k">int</b> graduation = <b className="n">2027</b>;

  <b className="k">void</b> <b className="f">build</b>() {"{"}
    <b className="c">// keep learning, keep shipping</b>
  {"}"}
{"}"}
                    </code></pre>
                </div>
                <span className="float f1">☕</span>
                <span className="float f2">⚛️</span>
                <span className="float f3">🌱</span>
            </div>

            <a href="#about" className="scroll-hint" aria-label="Scroll to About"><span></span></a>
        </section>`;
}

function About() {
    return html`
        <section id="about" className="section">
            <${SectionTitle} eyebrow="01 — About">Who I am<//>
            <div className="about-grid">
                <${Reveal}>
                    <div className="about-text">
                        <p>
                            I am a Computer Science & Engineering student at RNTU, expected to graduate in 2027.
                            I am developing my skills in Java Full Stack Development and enjoy solving programming
                            problems and creating web applications.
                        </p>
                        <p>
                            My current learning areas include Core Java, OOP, Data Structures & Algorithms,
                            JavaScript, React, SQL, MySQL, JDBC, Servlets, Spring and Spring Boot.
                        </p>
                    </div>
                <//>
                <${Reveal} delay=${120}>
                    <div className="stats">
                        <div className="stat"><strong><${Counter} to=${2} /></strong><span>Projects</span></div>
                        <div className="stat"><strong><${Counter} to=${20} suffix="+" /></strong><span>Technologies</span></div>
                        <div className="stat"><strong>2027</strong><span>Graduation</span></div>
                    </div>
                <//>
            </div>
        </section>`;
}

function Skills() {
    return html`
        <section id="skills" className="section">
            <${SectionTitle} eyebrow="02 — Skills">My toolkit<//>
            <div className="grid skills-grid">
                ${SKILLS.map((s, i) => html`
                    <${Reveal} key=${s.title} delay=${i * 70}>
                        <${Tilt} className="card skill-card">
                            <div className="skill-icon">${s.icon}</div>
                            <h3>${s.title}</h3>
                            <div className="chips">
                                ${s.items.map((it) => html`<span key=${it} className="chip">${it}</span>`)}
                            </div>
                        <//>
                    <//>`)}
            </div>
        </section>`;
}

function Projects() {
    const filters = ["All", "Frontend", "Backend"];
    const [f, setF] = useState("All");
    const list = PROJECTS.filter((p) => f === "All" || p.type === f);
    return html`
        <section id="projects" className="section">
            <${SectionTitle} eyebrow="03 — Projects">Things I've built<//>
            <${Reveal}>
                <div className="filters" role="tablist">
                    ${filters.map((x) => html`
                        <button key=${x} role="tab" aria-selected=${f === x}
                            className=${"filter " + (f === x ? "on" : "")} onClick=${() => setF(x)}>${x}</button>`)}
                </div>
            <//>
            <div className="grid projects-grid">
                ${list.map((p, i) => html`
                    <${Reveal} key=${p.title} delay=${i * 100}>
                        <${Tilt} className="card project-card">
                            <div className="project-top">
                                <div className="project-icon">${p.icon}</div>
                                <span className="tag">${p.type}</span>
                            </div>
                            <h3>${p.title}</h3>
                            <p>${p.text}</p>
                            <div className="chips">
                                ${p.tech.map((t) => html`<span key=${t} className="chip outline">${t}</span>`)}
                            </div>
                            <a href=${p.link} className="project-link">View Project <span aria-hidden="true">↗</span></a>
                        <//>
                    <//>`)}
            </div>
        </section>`;
}

function Education() {
    return html`
        <section id="education" className="section">
            <${SectionTitle} eyebrow="04 — Education">Where I study<//>
            <${Reveal}>
                <div className="timeline">
                    <div className="tl-dot"></div>
                    <${Tilt} className="card edu-card">
                        <span className="tag">Expected Graduation: 2027</span>
                        <h3>B.Tech — Computer Science & Engineering</h3>
                        <p>RNTU (Rabindranath Tagore University)</p>
                    <//>
                </div>
            <//>
        </section>`;
}

function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");

    const set = (k) => (e) => {
        setForm({ ...form, [k]: e.target.value });
        setErrors({ ...errors, [k]: false });
    };

    const submit = (e) => {
        e.preventDefault();
        const bad = {
            name: !form.name.trim(),
            email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
            message: !form.message.trim(),
        };
        setErrors(bad);
        if (Object.values(bad).some(Boolean)) {
            setStatus("error");
            return;
        }
        const subject = encodeURIComponent("Portfolio message from " + form.name.trim());
        const body = encodeURIComponent(form.message.trim() + "\n\n" + form.name.trim() + "\n" + form.email.trim());
        window.location.href = "mailto:" + PROFILE.email + "?subject=" + subject + "&body=" + body;
        setStatus("ok");
        setForm({ name: "", email: "", message: "" });
    };

    return html`
        <section id="contact" className="section">
            <${SectionTitle} eyebrow="05 — Contact">Let's connect<//>
            <div className="contact-grid">
                <${Reveal}>
                    <div className="contact-info">
                        <p className="lead">
                            I'm open to internships, entry-level opportunities and professional networking.
                            Say hello — I reply fast.
                        </p>
                        <a className="contact-row" href=${"mailto:" + PROFILE.email}>
                            <span className="ci">📧</span><div><small>Email</small>${PROFILE.email}</div>
                        </a>
                        <a className="contact-row" href=${"tel:" + PROFILE.phone.replace(/\s/g, "")}>
                            <span className="ci">📱</span><div><small>Phone</small>${PROFILE.phone}</div>
                        </a>
                        <a className="contact-row" href=${PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
                            <span className="ci">🔗</span><div><small>LinkedIn</small>View profile</div>
                        </a>
                    </div>
                <//>
                <${Reveal} delay=${120}>
                    <form className="card form" onSubmit=${submit} noValidate>
                        <label>
                            <span>Name</span>
                            <input className=${errors.name ? "invalid" : ""} type="text" placeholder="Your name"
                                value=${form.name} onInput=${set("name")} />
                        </label>
                        <label>
                            <span>Email</span>
                            <input className=${errors.email ? "invalid" : ""} type="email" placeholder="you@example.com"
                                value=${form.email} onInput=${set("email")} />
                        </label>
                        <label>
                            <span>Message</span>
                            <textarea className=${errors.message ? "invalid" : ""} rows="5" placeholder="How can I help?"
                                value=${form.message} onInput=${set("message")}></textarea>
                        </label>
                        <p className=${"form-status " + status} role="status">
                            ${status === "error" ? "Fill in every field and use a valid email address." : ""}
                            ${status === "ok" ? "Opening your email app to send the message." : ""}
                        </p>
                        <button type="submit" className="btn">Send Message <span aria-hidden="true">→</span></button>
                    </form>
                <//>
            </div>
        </section>`;
}

function Footer() {
    return html`
        <footer className="footer">
            <p>© ${new Date().getFullYear()} ${PROFILE.name} | Java Full Stack Developer</p>
            <p className="made">Built with HTML, CSS, JavaScript & React</p>
        </footer>`;
}

/* ================= APP ================= */
function App() {
    const [theme, setTheme] = useState(() => {
        try {
            const s = localStorage.getItem("theme");
            if (s) return s;
        } catch (e) {}
        return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    });
    const active = useActiveSection(NAV);
    const progress = useScrollProgress();

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        try { localStorage.setItem("theme", theme); } catch (e) {}
    }, [theme]);

    const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

    // Soft spotlight that follows the cursor
    useEffect(() => {
        const on = (e) => {
            document.documentElement.style.setProperty("--cx", e.clientX + "px");
            document.documentElement.style.setProperty("--cy", e.clientY + "px");
        };
        window.addEventListener("pointermove", on, { passive: true });
        return () => window.removeEventListener("pointermove", on);
    }, []);

    return html`
        <${React.Fragment}>
            <div className="progress" style=${{ width: progress + "%" }}></div>
            <div className="bg" aria-hidden="true">
                <span className="blob b1"></span>
                <span className="blob b2"></span>
                <span className="blob b3"></span>
                <span className="grid-lines"></span>
                <span className="spotlight"></span>
            </div>
            <${Navbar} active=${active} theme=${theme} toggleTheme=${toggleTheme} />
            <main>
                <${Hero} />
                <${About} />
                <${Skills} />
                <${Projects} />
                <${Education} />
                <${Contact} />
            </main>
            <${Footer} />
        <//>`;
}

ReactDOM.createRoot(document.getElementById("root")).render(html`<${App} />`);
