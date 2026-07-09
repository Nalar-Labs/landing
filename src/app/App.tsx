import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Copy, Check, Menu, X, Layers, Code2, Palette, Cpu, FlaskConical, Microscope } from "lucide-react";
import { Modal } from "./components/Modal";
import { Cursor } from "./components/Cursor";

gsap.registerPlugin(ScrollTrigger);

/* ─── Constants ─────────────────────────────────────────────── */
const SPHERE_R = 2.85;
const CARD_W = 0.88;
const CARD_H = CARD_W * 0.64;
const TILT_OFFSETS = [0.13, -0.19, 0.22, -0.09, 0.07, -0.21, 0.16, -0.06, 0.11, -0.14,
                      0.19, -0.08, 0.06, -0.17, 0.13, -0.04, 0.09, -0.11, 0.15, -0.07];

/* ─── Data ──────────────────────────────────────────────────── */
const PORTFOLIO = [
  { img: "1551288049-bebda4e38f71", title: "Analytics Platform", client: "TechCorp" },
  { img: "1460925895917-afdab827c52f", title: "FinTech Suite", client: "Meridian Bank" },
  { img: "1498050108023-c5249f4df085", title: "Dev Platform", client: "CloudBase" },
  { img: "1555066931-4365d14bab8c", title: "AI Engine", client: "NeuralStack" },
  { img: "1518770660439-4636190af475", title: "IoT Dashboard", client: "Artix Labs" },
  { img: "1504868584819-f8e8b4b6d7e3", title: "Workspace OS", client: "FlowHQ" },
  { img: "1531297484001-80022131f5a1", title: "Mobile App", client: "Stride Health" },
  { img: "1552664730-d307ca884978", title: "Brand Strategy", client: "Lumien" },
  { img: "1541701494587-cb58502866ab", title: "Creative System", client: "Nova Studio" },
  { img: "1558591710-4b4a1ae0f435", title: "Visual Identity", client: "Axiom" },
  { img: "1561070791-2526d30994b5", title: "UX Research", client: "Helios" },
  { img: "1509395176047-4a66953fd231", title: "Digital Art", client: "Prism" },
  { img: "1526374965328-7f61d4dc18c5", title: "Security Platform", client: "Vault" },
  { img: "1556742049-0cfed4f6a45d", title: "SaaS Dashboard", client: "Operix" },
  { img: "1551434678-e076c223a692", title: "Engineering Hub", client: "Buildforce" },
  { img: "1497366216548-37526070297c", title: "Office Platform", client: "SpaceWell" },
  { img: "1542744094-3a31f272c490", title: "Data Science", client: "Insight Co" },
  { img: "1526256262350-7da7584cf5eb", title: "Product Design", client: "Orbit" },
  { img: "1524758631624-e2822132978", title: "Interior Tech", client: "Habitat AI" },
  { img: "1571019613454-1cb2f99b2d8b", title: "Health Tech", client: "Vitals AI" },
];

const SERVICE_GROUPS = [
  {
    title: "Consulting Service",
    items: [
      { icon: Layers, name: "AI Strategy & Implementation Roadmap", desc: "Plan where AI fits in your business, what to build, in what order, and how to measure success." },
      { icon: Code2, name: "Vibe-to-Production", desc: "Help turn prototype projects into clean, production-ready applications." },
      { icon: Palette, name: "Technical Cost Optimisation", desc: "Audit your current systems and recommend ways to reduce infrastructure, tooling, and operational costs." },
    ],
  },
  {
    title: "End-to-End Implementation Service",
    items: [
      { icon: Microscope, name: "Internal Tool Building", desc: "Migrate your team off paid SaaS subscriptions and replace them with custom in-house tools you own." },
      { icon: Cpu, name: "External Product Development", desc: "Build customer-facing products architected to scale to millions of users." },
      { icon: FlaskConical, name: "Agentic Deployment", desc: "Design and deploy AI agents that automate workflows across your business." },
    ],
  },
];

const APPROACH_STEPS = [
  { num: "1", phase: "Discovery & Scoping", desc: "Three structured sessions to understand your needs, assess fit, and plan in detail." },
  { num: "2", phase: "Project Execution", desc: "Focused sprints with regular check-ins, documented deliverables, and open-source tools." },
  { num: "3", phase: "Training & Handoff", desc: "Structured training sessions so your team can maintain and extend the work independently." },
];

const VALUES = [
  { belief: "We believe open source is awesome", desc: "SaaS tools rent you access to code you'll never own. Open-source alternatives are often better, always yours, and free forever. Our default is open source — and we'll show you what that unlocks." },
  { belief: "We believe vendor lock-in is evil", desc: "We don't write contracts designed to keep you dependent on us. Our goal is to build your team's capability so you can eventually handle the basics yourselves — freeing us to work on your tougher and more interesting challenges together." },
  { belief: "We believe in your business", desc: "If you're at a stage where you can invest in technology, you already have a working business. You don't need us to validate that. You need the right infrastructure to scale it — and that's exactly what we focus on." },
];

/* ─── Booking / referral ────────────────────────────────────── */
// Single source of truth for booking (Calendly).
const CALENDLY_URL = "https://calendly.com/garda4199/30min";

const STATS = [
  { value: "120+", label: "Clients Worldwide" },
  { value: "98%", label: "Client Retention" },
  { value: "$2.4B", label: "Revenue Generated" },
  { value: "8 yrs", label: "Industry Experience" },
];

const TEAM = [
  { name: "Amir Khoury", role: "Co-founder & CEO", img: "1507003211169-0a1dd7228f2d" },
  { name: "Leila Chen", role: "Head of Design", img: "1494790108377-be9c29b29330" },
  { name: "Marcus Reid", role: "Lead Engineer", img: "1472099645785-5658abf4ff4e" },
  { name: "Zara Osei", role: "AI Research Lead", img: "1580489944761-15a19d654956" },
];

/* ─── Globe helpers ─────────────────────────────────────────── */
function fibPoints(n: number): THREE.Vector3[] {
  const phi = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = phi * i;
    return new THREE.Vector3(
      Math.cos(t) * r * SPHERE_R,
      y * SPHERE_R,
      Math.sin(t) * r * SPHERE_R,
    );
  });
}

/* ─── Globe component ───────────────────────────────────────── */
type GlobeHandle = {
  enter: () => void;
  exit: () => void;
  setDepth: (depth: number) => void;
};

const Globe = forwardRef<GlobeHandle, {}>((_, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    camera?: THREE.PerspectiveCamera;
    inGlobe?: boolean;
  }>({});

useImperativeHandle(ref, () => ({
    enter: () => {
      const state = stateRef.current;
      if (!state.camera || state.inGlobe) return;
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      state.inGlobe = true;
      gsap.to(state.camera.position, {
        x: 0, y: 0, z: 0.1,
        duration: prefersReduced ? 0 : 1.8,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    },
    exit: () => {
      const state = stateRef.current;
      if (!state.camera || !state.inGlobe) return;
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      state.inGlobe = false;
      gsap.to(state.camera.position, {
        x: 0, y: 1.6, z: 7.8,
        duration: prefersReduced ? 0 : 1.8,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    },
    setDepth: (depth: number) => {
      const state = stateRef.current;
      if (!state.camera) return;
      const newZ = Math.max(0.1, depth);
      state.camera.position.z = newZ;
      state.camera.updateProjectionMatrix();
    },
  }));

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    try {
      /* Scene */
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100);
      camera.position.set(0, 1.6, 7.8);
      camera.lookAt(0, 0, 0);
      stateRef.current.camera = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0, 0);
      el.appendChild(renderer.domElement);

      /* Globe group */
      const glob = new THREE.Group();
      scene.add(glob);

      /* Subtle wireframe lattice */
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x222222,
        wireframe: true,
        transparent: true,
        opacity: 0.045,
      });
      glob.add(new THREE.Mesh(new THREE.SphereGeometry(SPHERE_R, 30, 18), wireMat));

      /* Image cards */
      const loader = new THREE.TextureLoader();
      const pts = fibPoints(PORTFOLIO.length);

      PORTFOLIO.forEach((item, i) => {
        const pos = pts[i];
        const url = `https://images.unsplash.com/photo-${item.img}?w=420&h=280&fit=crop&auto=format`;

        const placeCard = (tex?: THREE.Texture) => {
          const mat = tex
            ? new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
            : new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL((i / PORTFOLIO.length) * 0.85, 0.45, 0.62),
                side: THREE.DoubleSide,
              });

          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, CARD_H), mat);
          mesh.position.copy(pos);
          mesh.lookAt(pos.clone().multiplyScalar(2));
          mesh.rotateZ(TILT_OFFSETS[i % TILT_OFFSETS.length]);
          glob.add(mesh);
        };

        loader.load(
          url,
          (tex) => { tex.colorSpace = THREE.SRGBColorSpace; placeCard(tex); },
          undefined,
          () => placeCard(),
        );
      });

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let dragging = false;
      const ROT_SPEED = (Math.PI * 2) / 140; // radians / second

      const autoRotate = (_: number, dt: number) => {
        if (!dragging && !stateRef.current.inGlobe) {
          glob.rotation.y += ROT_SPEED * (dt / 1000); // dt is in milliseconds
        }
      };
      if (!prefersReduced) gsap.ticker.add(autoRotate);

      if (!prefersReduced) {
        gsap.from(glob.scale, { x: 0.72, y: 0.72, z: 0.72, duration: 1.6, ease: "power3.out", delay: 0.3 });
      }

      /* Render loop */
      let raf: number;
      const tick = () => { raf = requestAnimationFrame(tick); renderer.render(scene, camera); };
      tick();

      /* Pointer drag */
      let ox = 0, oy = 0;
      const onPD = (e: PointerEvent) => {
        dragging = true;
        ox = e.clientX; oy = e.clientY;
        renderer.domElement.setPointerCapture(e.pointerId);
        el.style.cursor = "grabbing";
      };

      const onPM = (e: PointerEvent) => {
        if (!dragging) return;
        glob.rotation.y += (e.clientX - ox) * 0.006;
        glob.rotation.x = Math.max(-0.65, Math.min(0.65, glob.rotation.x + (e.clientY - oy) * 0.003));
        ox = e.clientX; oy = e.clientY;
      };

      const onPU = () => {
        dragging = false;
        el.style.cursor = "grab";
        gsap.to(glob.rotation, { x: 0, duration: 1.2, ease: "power2.out" });
      };

      renderer.domElement.addEventListener("pointerdown", onPD);
      renderer.domElement.addEventListener("pointermove", onPM);
      renderer.domElement.addEventListener("pointerup", onPU);
      renderer.domElement.addEventListener("pointerleave", onPU);

      /* Resize */
      const onResize = () => {
        const nW = el.clientWidth, nH = el.clientHeight;
        renderer.setSize(nW, nH);
        camera.aspect = nW / nH;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      return () => {
        cancelAnimationFrame(raf);
        if (!prefersReduced) gsap.ticker.remove(autoRotate);
        renderer.domElement.removeEventListener("pointerdown", onPD);
        renderer.domElement.removeEventListener("pointermove", onPM);
        renderer.domElement.removeEventListener("pointerup", onPU);
        renderer.domElement.removeEventListener("pointerleave", onPU);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    } catch (err) {
      console.error("WebGL initialization failed:", err);
      if (el) el.innerHTML = "<p className='text-center py-20 text-muted-foreground'>3D globe requires WebGL support.</p>";
      return () => {};
    }
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-[720px] select-none"
      style={{ cursor: "grab" }}
    />
  );
});

/* ─── Nav ───────────────────────────────────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: "top -60",
      onUpdate: (self) => {
        navRef.current?.classList.toggle("shadow-sm", self.scroll() > 60);
      },
    });
    return () => trigger.kill();
  }, []);

  const links = [
    { label: "Portfolio", href: "#globe" },
    { label: "Services", href: "#services" },
    { label: "Team", href: "#team" },
  ];

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-[#fafaf8]/90 backdrop-blur-md transition-shadow duration-300"
    >
      <span className="font-['Instrument_Serif',serif] text-[1.65rem] tracking-tight text-foreground">
        Nalar Labs
      </span>

      {/* Pill nav */}
      <div className="hidden md:flex items-center gap-0.5 bg-[#e6e4df] rounded-full px-2 py-1.5">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="px-5 py-2 text-[0.82rem] font-medium text-black/65 hover:text-black hover:bg-white/70 rounded-full transition-all duration-200"
          >
            {l.label}
          </a>
        ))}
        <a
          href="#contact"
          className="ml-1 px-5 py-2 text-[0.82rem] font-medium bg-black text-white rounded-full hover:bg-neutral-800 transition-colors duration-200"
        >
          Contact Us
        </a>
      </div>

      {/* Mobile toggle */}
      <button
        className="md:hidden p-1 rounded hover:bg-black/5"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-[#fafaf8] border-t border-border px-8 py-6 flex flex-col gap-5 md:hidden shadow-lg">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-base font-medium"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a href="#contact" className="text-base font-medium" onClick={() => setOpen(false)}>
            Contact Us
          </a>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ──────────────────────────────────────────────────── */
function HeroSection({ onRefer }: { onRefer: () => void }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".h-item", {
        opacity: 0,
        y: 44,
        duration: 1.05,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.15,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="pt-36 pb-10 text-center px-6">
      <p className="h-item inline-block text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-8">
        AI-Native Design &amp; Engineering Studio
      </p>

      <h1 className="h-item font-['Instrument_Serif',serif] text-[clamp(2.6rem,5.2vw,5.4rem)] leading-[1.07] text-foreground max-w-5xl mx-auto">
        {"We're a world class team of AI-Native"}
        <br className="hidden sm:block" />
        {" Designers & Engineers"}
      </h1>

      <p className="h-item mt-5 font-['Instrument_Serif',serif] italic text-[clamp(1.15rem,2.2vw,1.9rem)] text-muted-foreground">
        Ready to help you &amp; your business evolve
      </p>

      <div className="h-item mt-11 flex flex-wrap justify-center gap-4">
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2.5 bg-foreground text-background px-9 py-4 text-[0.82rem] font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/40 btn-press"
        >
          Book a call
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
        <button
          onClick={onRefer}
          className="inline-flex items-center border border-foreground/20 px-9 py-4 text-[0.82rem] font-medium tracking-widest uppercase hover:border-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-black/40 btn-press"
        >
          Refer someone
        </button>
      </div>
    </section>
  );
}

/* ─── Globe section ─────────────────────────────────────────── */
function GlobeSection() {
  const ref = useRef<HTMLElement>(null);
  const globeRef = useRef<GlobeHandle>(null);
  const [inGlobe, setInGlobe] = useState(false);
  const [depth, setDepth] = useState(0);
  const globeSectionRef = useRef<HTMLElement>(null);
  const maxDepthRef = useRef(7.8);
  const minDepthRef = useRef(0.1);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".globe-label", {
        opacity: 0,
        y: 12,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!inGlobe) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scrollDelta = e.deltaY;
      
      setDepth((prevDepth) => {
        const newDepth = Math.max(
          minDepthRef.current,
          Math.min(maxDepthRef.current, prevDepth + scrollDelta * 0.01)
        );

        globeRef.current?.setDepth?.(newDepth);

        if (newDepth >= maxDepthRef.current - 0.3) {
          setInGlobe(false);
          globeRef.current?.exit();
          window.scrollTo({ top: globeSectionRef.current?.offsetTop || 0, behavior: 'smooth' });
        }

        return newDepth;
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [inGlobe]);

  const handleEnter = () => {
    setInGlobe(true);
    setDepth(maxDepthRef.current);
    globeRef.current?.enter();
  };

  return (
    <section id="globe" ref={globeSectionRef} className="relative -mt-2 overflow-hidden">
      <p className="globe-label text-center text-[0.68rem] font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-1 pt-2">
        Drag to explore · {PORTFOLIO.length} projects worldwide
      </p>
      
      <div className="relative h-[720px]">
        <Globe ref={globeRef} />
        
        {!inGlobe && (
          <button
            onClick={handleEnter}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 text-[0.75rem] font-semibold tracking-widest uppercase bg-black text-white hover:bg-foreground transition-colors rounded z-10 focus:outline-none focus:ring-2 focus:ring-white/60 whitespace-nowrap"
          >
            Step inside the globe
          </button>
        )}
        
        {inGlobe && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[0.7rem] font-semibold tracking-widest uppercase text-muted-foreground bg-white/80 px-4 py-2 backdrop-blur-sm rounded z-10">
            Scroll ↑ to go deeper · Scroll ↓ to exit
          </div>
        )}
      </div>
      
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#fafaf8] to-transparent" />
    </section>
  );
}


/* ─── Stats bar ─────────────────────────────────────────────── */
function StatsBar() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".stat-item", {
        opacity: 0,
        y: 24,
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="border-y border-border py-16 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        {STATS.map((s) => (
          <div key={s.label} className="stat-item text-center">
            <div className="font-['Instrument_Serif',serif] text-[clamp(2.4rem,4vw,4rem)] leading-none text-foreground">
              {s.value}
            </div>
            <div className="mt-2.5 text-[0.67rem] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Services ──────────────────────────────────────────────── */
function ServicesSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".svc-card", {
        opacity: 0,
        y: 30,
        duration: 0.72,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
      gsap.from(".approach-step", {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="services" ref={ref} className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-18">
          <p className="text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-4">
            How we help
          </p>
          <h2 className="font-['Instrument_Serif',serif] text-[clamp(2rem,4vw,3.6rem)] leading-[1.1] max-w-2xl">
            Two ways to work together
          </h2>
        </div>

        {/* Service Groups */}
        <div className="mt-16 space-y-16">
          {SERVICE_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="font-['Instrument_Serif',serif] text-2xl mb-8 text-foreground">{group.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
                {group.items.map((s) => (
                  <div
                    key={s.name}
                    className="svc-card bg-[#fafaf8] p-9 hover:bg-white transition-colors duration-200"
                  >
                    <s.icon size={20} className="text-muted-foreground mb-7" strokeWidth={1.5} />
                    <h4 className="font-['Instrument_Serif',serif] text-lg mb-3 text-foreground">{s.name}</h4>
                    <p className="text-[0.83rem] text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Approach Steps */}
        <div className="mt-20 pt-16 border-t border-border">
          <h3 className="font-['Instrument_Serif',serif] text-2xl mb-12 text-foreground">Our approach</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {APPROACH_STEPS.map((step) => (
              <div key={step.phase} className="approach-step">
                <div className="text-4xl font-['Instrument_Serif',serif] text-muted-foreground/40 mb-4">{step.num}</div>
                <h4 className="font-['Instrument_Serif',serif] text-lg mb-3 text-foreground">{step.phase}</h4>
                <p className="text-[0.83rem] text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Values Section ───────────────────────────────────────────── */
function ValuesSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".value-card", {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="values" ref={ref} className="py-28 px-6 bg-white/40">
      <div className="max-w-6xl mx-auto">
        <div className="mb-18">
          <p className="text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-4">
            Our philosophy
          </p>
          <h2 className="font-['Instrument_Serif',serif] text-[clamp(2rem,4vw,3.6rem)] leading-[1.1] max-w-3xl">
            Why we do this
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {VALUES.map((v) => (
            <div key={v.belief} className="value-card">
              <div className="mb-6 pb-6 border-t-2 border-foreground/20" />
              <h3 className="font-['Instrument_Serif',serif] text-[clamp(1.4rem,2.4vw,1.9rem)] italic leading-snug mb-4 text-foreground">
                {v.belief}
              </h3>
              <p className="text-[1.02rem] text-foreground/70 leading-[1.75]">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Copy-to-clipboard button ──────────────────────────────── */
function CopyButton({ value, label, primary = false }: { value: string; label: string; primary?: boolean }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); }, []);

  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[0.8rem] font-semibold tracking-widest uppercase transition-all focus:outline-none focus:ring-2 focus:ring-black/40 btn-press";
  const variant = primary
    ? "bg-foreground text-background hover:opacity-80"
    : "border border-foreground/20 hover:border-foreground/60";

  return (
    <button onClick={copy} className={`${base} ${variant}`} aria-live="polite">
      {copied ? (<><Check size={15} /> Copied</>) : (<><Copy size={15} /> {label}</>)}
    </button>
  );
}

/* ─── Referral modal ────────────────────────────────────────── */
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

function ReferralModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [referrerEmail, setReferrerEmail] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [touched, setTouched] = useState({ referrer: false, client: false });
  const [generated, setGenerated] = useState<string | null>(null);

  const referrerValid = isEmail(referrerEmail);
  const clientValid = isEmail(clientEmail);
  const canGenerate = referrerValid && clientValid;

  useEffect(() => {
    if (!open) {
      setReferrerEmail("");
      setClientEmail("");
      setTouched({ referrer: false, client: false });
      setGenerated(null);
    }
  }, [open]);

  const generate = () => {
    if (!canGenerate) return;
    const url = new URL(CALENDLY_URL);
    url.searchParams.set("email", clientEmail.trim());
    url.searchParams.set("utm_source", "referral");
    url.searchParams.set("utm_content", referrerEmail.trim());
    setGenerated(url.toString());
  };

  const inputClass =
    "w-full border border-foreground/20 bg-white/70 px-4 py-3 text-[0.95rem] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-black/40";

  return (
    <Modal open={open} onClose={onClose} title="Refer someone">
      <p className="text-[1rem] text-muted-foreground leading-relaxed mb-6">
        Add your details and your contact&apos;s, and we&apos;ll generate a booking link
        to share. We use your email to credit you when it turns into a project.
      </p>
      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="referrer-email"
            className="block text-[0.72rem] font-semibold tracking-widest uppercase text-muted-foreground mb-2"
          >
            Your email
          </label>
          <input
            id="referrer-email"
            type="email"
            autoComplete="email"
            value={referrerEmail}
            onChange={(e) => { setReferrerEmail(e.target.value); setGenerated(null); }}
            onBlur={() => setTouched((t) => ({ ...t, referrer: true }))}
            placeholder="you@company.com"
            className={inputClass}
          />
          {touched.referrer && referrerEmail.trim() !== "" && !referrerValid && (
            <p className="mt-1.5 text-[0.75rem] text-[#dc2626]">Enter a valid email address.</p>
          )}
        </div>
        <div>
          <label
            htmlFor="client-email"
            className="block text-[0.72rem] font-semibold tracking-widest uppercase text-muted-foreground mb-2"
          >
            Their email
          </label>
          <input
            id="client-email"
            type="email"
            value={clientEmail}
            onChange={(e) => { setClientEmail(e.target.value); setGenerated(null); }}
            onBlur={() => setTouched((t) => ({ ...t, client: true }))}
            placeholder="client@business.com"
            className={inputClass}
          />
          {touched.client && clientEmail.trim() !== "" && !clientValid && (
            <p className="mt-1.5 text-[0.75rem] text-[#dc2626]">Enter a valid email address.</p>
          )}
        </div>

        {generated ? (
          <div className="flex flex-col gap-3 pt-1">
            <div className="text-[0.8rem] text-foreground/70 break-all border border-foreground/10 bg-white/70 px-4 py-3 leading-relaxed">
              {generated}
            </div>
            <CopyButton value={generated} label="Copy referral link" primary />
          </div>
        ) : (
          <button
            onClick={generate}
            disabled={!canGenerate}
            className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3.5 text-[0.8rem] font-semibold tracking-widest uppercase transition-opacity focus:outline-none focus:ring-2 focus:ring-black/40 disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:opacity-80 btn-press"
          >
            Generate referral link
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ─── Refer Section ────────────────────────────────────────────── */
function ReferSection({ onRefer }: { onRefer: () => void }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".refer-cta", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="refer" ref={ref} className="py-24 px-6 bg-white/40">
      <div className="max-w-3xl mx-auto text-center">
        <div className="refer-cta">
          <p className="text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-6">
            Growing together
          </p>
          <h2 className="font-['Instrument_Serif',serif] text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.15] mb-8">
            Know someone who should work with us?
          </h2>
          <p className="text-[0.9rem] text-muted-foreground mb-10 max-w-lg mx-auto">
            If you know a business that needs help building software infrastructure they own, we'd love to hear about them. Let's start a conversation.
          </p>
          <button
            onClick={onRefer}
            className="inline-flex items-center gap-2.5 bg-foreground text-background px-8 py-3.5 text-[0.8rem] font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/40 btn-press"
          >
            Suggest a referral
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Team ──────────────────────────────────────────────────── */
function TeamSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".team-card", {
        opacity: 0,
        y: 34,
        duration: 0.85,
        ease: "power2.out",
        stagger: 0.11,
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="team" ref={ref} className="py-28 px-6 bg-[#f2f0eb]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-4">
            The team
          </p>
          <h2 className="font-['Instrument_Serif',serif] text-[clamp(2rem,4vw,3.6rem)] leading-[1.1] max-w-xl">
            World-class minds, one shared vision
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {TEAM.map((t) => (
            <div key={t.name} className="team-card group">
              <div className="aspect-[3/4] bg-[#d8d5ce] overflow-hidden mb-4">
                <img
                  src={`https://images.unsplash.com/photo-${t.img}?w=400&h=530&fit=crop&auto=format`}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
              </div>
              <h3 className="font-['Instrument_Serif',serif] text-lg leading-snug">{t.name}</h3>
              <p className="text-[0.78rem] text-muted-foreground mt-1">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Contact ───────────────────────────────────────────────── */
function ContactSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cta-item", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={ref} className="py-32 px-6 bg-[#0d0d0d] text-white">
      <div className="max-w-4xl mx-auto text-center">
        <p className="cta-item text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-white/40 mb-7">
          Work with us
        </p>
        <h2 className="cta-item font-['Instrument_Serif',serif] text-[clamp(2.4rem,5vw,5rem)] leading-[1.08] mb-10">
          {"Let's build something extraordinary together"}
        </h2>
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-item group inline-flex items-center gap-3 border border-white/25 px-11 py-4.5 text-[0.82rem] font-medium tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/60 btn-press"
        >
          Book a call
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-[#0d0d0d] border-t border-white/10 px-8 py-8">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <span className="font-['Instrument_Serif',serif] text-white text-xl">Nalar Labs</span>
        <span className="text-white/35 text-xs">© 2025 Nalar Labs. All rights reserved.</span>
        <div className="flex gap-6 text-xs text-white/35">
          {["Privacy", "Terms", "Twitter", "LinkedIn"].map((l) => (
            <a key={l} href="#" className="hover:text-white/70 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─── App ───────────────────────────────────────────────────── */
export default function App() {
  const [referOpen, setReferOpen] = useState(false);

  return (
    <main className="bg-[#fafaf8] min-h-screen overflow-x-hidden">
      <Cursor />
      <Nav />
      <HeroSection onRefer={() => setReferOpen(true)} />
      <GlobeSection />
      <StatsBar />
      <ValuesSection />
      <ServicesSection />
      <ReferSection onRefer={() => setReferOpen(true)} />
      <TeamSection />
      <ContactSection />
      <Footer />
      <ReferralModal open={referOpen} onClose={() => setReferOpen(false)} />
    </main>
  );
}
