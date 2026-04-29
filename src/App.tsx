/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue 
} from "motion/react";
import { 
  Github, 
  Linkedin, 
  Twitter, 
  ExternalLink, 
  ArrowRight, 
  Mail, 
  Layout, 
  Server, 
  Figma, 
  Zap,
  ChevronDown,
  Menu,
  X,
  Cloud,
  GraduationCap,
  Award
} from "lucide-react";
import React, { useState, useRef, useEffect, ReactNode, MouseEvent } from "react";
import Hls from "hls.js";
import ParticleBackground from "./components/ParticleBackground";
import { PERSONAL_INFO, PROJECTS, SKILLS, EXPERIENCES, CERTIFICATIONS } from "./constants";

// --- Utility Components ---

const BackgroundVideo = ({ url }: { url: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log("Video auto-play failed:", e));
      });
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(e => console.log("Video auto-play failed:", e));
      });
    }
  }, [url]);

  return (
    <div className="absolute inset-0 -z-20 overflow-hidden">
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        className="w-full h-full object-cover opacity-20 grayscale brightness-50 scale-110"
      />
      <div className="absolute inset-0 bg-zinc-950/40" />
    </div>
  );
};

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovered(!!target.closest("a, button, [data-cursor-hover]"));
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleHover);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleHover);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-indigo-500/50 pointer-events-none z-[9999] hidden md:block mix-blend-difference"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        scale: isHovered ? 2.5 : 1,
        backgroundColor: isHovered ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0)",
      }}
    />
  );
};

const Magnetic = ({ children }: { children: ReactNode, key?: React.Key }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

const Reveal = ({ children, delay = 0 }: { children: ReactNode, delay?: number, key?: React.Key }) => {
  return (
    <div className="overflow-hidden relative w-full">
      <motion.div
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// --- Main Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? "py-4 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-2xl" : "py-10 bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Magnetic>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-display font-bold tracking-tighter"
          >
            {PERSONAL_INFO.name.toUpperCase()}<span className="text-indigo-500">.</span>
          </motion.div>
        </Magnetic>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-10 items-center">
          {["Work", "Skills", "Experience", "Contact"].map((item, idx) => (
            <motion.a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors tracking-widest uppercase"
            >
              <Magnetic>{item}</Magnetic>
            </motion.a>
          ))}
          <Magnetic>
            <motion.a
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              href={`mailto:${PERSONAL_INFO.email}`}
              className="px-6 py-2.5 bg-indigo-500 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
            >
              Let's Talk
            </motion.a>
          </Magnetic>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-zinc-100"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-0 left-0 w-full bg-zinc-950 border-b border-zinc-800 p-8 pt-28 md:hidden flex flex-col gap-8 shadow-2xl"
          >
            {["Work", "Skills", "Experience", "Contact"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-4xl font-display font-bold text-zinc-500 hover:text-white"
              >
                {item}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const videoUrl = "https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8";

  return (
    <section className="relative min-h-[105vh] flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Video */}
      <BackgroundVideo url={videoUrl} />
      
      {/* Parallax Background Glows */}
      <motion.div style={{ y, opacity }} className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full -z-10" />
      <motion.div style={{ y: useTransform(y, v => v * -0.5), opacity }} className="absolute bottom-20 -right-20 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full -z-10" />

      <div className="max-w-5xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <span className="inline-block px-5 py-2 rounded-full border border-zinc-800/50 text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase bg-zinc-900/40 backdrop-blur-sm">
            Available for New Challenges
          </span>
        </motion.div>

        <h1 className="text-[12vw] md:text-[8vw] font-display font-medium tracking-tight leading-[0.85] mb-12 flex flex-col items-center">
          <Reveal>Building Fine</Reveal>
          <Reveal delay={0.1}>
            <span className="text-zinc-600 italic font-light serif">Intelligent</span>
          </Reveal>
          <Reveal delay={0.2}>Systems<span className="text-indigo-500">.</span></Reveal>
        </h1>

        <motion.p
          className="text-lg md:text-xl text-zinc-500 mb-14 max-w-2xl mx-auto leading-relaxed font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {PERSONAL_INFO.bio}
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Magnetic>
            <a 
              href="#work"
              className="group relative flex items-center gap-3 px-10 py-5 bg-zinc-100 text-zinc-950 rounded-full font-bold uppercase text-xs tracking-widest overflow-hidden transition-all hover:scale-105"
            >
              <span className="relative z-10 transition-colors group-hover:text-zinc-100">See my work</span>
              <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <ArrowRight className="relative z-10 transition-transform group-hover:translate-x-1 group-hover:text-zinc-100" size={18} />
            </a>
          </Magnetic>
          <div className="flex gap-4">
            <Magnetic>
              <a href={PERSONAL_INFO.socials.github} target="_blank" className="p-5 rounded-full border border-zinc-800 hover:border-zinc-500/40 transition-colors text-zinc-500 hover:text-white bg-zinc-900/20 backdrop-blur-md">
                <Github size={22} />
              </a>
            </Magnetic>
            <Magnetic>
              <a href={PERSONAL_INFO.socials.linkedin} target="_blank" className="p-5 rounded-full border border-zinc-800 hover:border-zinc-500/40 transition-colors text-zinc-500 hover:text-white bg-zinc-900/20 backdrop-blur-md">
                <Linkedin size={22} />
              </a>
            </Magnetic>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 10, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <ChevronDown className="text-zinc-700" size={32} strokeWidth={1} />
      </motion.div>
    </section>
  );
};

const Projects = () => {
  return (
    <section id="work" className="py-40 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
        <div className="flex flex-col gap-4">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-[10px] font-bold tracking-[0.4em] text-indigo-500 uppercase"
          >
            Archive / Selected Work
          </motion.span>
          <h2 className="text-6xl md:text-8xl font-display font-medium tracking-tighter">Cases<span className="text-zinc-700 italic font-light serif text-[5vw]">.</span></h2>
        </div>
        <div className="text-sm font-mono text-zinc-700 leading-relaxed max-w-xs md:text-right">
          Exploring the intersection of data science, cloud architecture, and user-centric design.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-32">
        {PROJECTS.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: idx % 2 * 0.2 }}
            className={`group relative ${idx % 2 !== 0 ? "md:translate-y-24" : ""}`}
          >
            <div className="overflow-hidden rounded-3xl aspect-[16/10] bg-zinc-900 border border-zinc-800/30 group-hover:border-indigo-500/20 transition-colors duration-700">
              <motion.img 
                src={project.image} 
                alt={project.title}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
              
              <div className="absolute top-8 right-8">
                <Magnetic>
                  <a 
                    href={project.link} 
                    target="_blank"
                    className="p-4 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-white hover:text-zinc-950"
                  >
                    <ArrowRight size={22} className="-rotate-45" />
                  </a>
                </Magnetic>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-display font-medium tracking-tight group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                <span className="text-xs font-mono text-zinc-700">{project.year}</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">{project.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {project.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-zinc-900/50 border border-zinc-800 text-[9px] font-bold tracking-widest text-zinc-500 uppercase rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Skills = () => {
  const icons = { Layout, Server, Figma, Zap };

  return (
    <section id="skills" className="py-40 px-6 bg-zinc-950 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20">
        <div className="md:w-1/3 flex flex-col gap-8">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-[10px] font-bold tracking-[0.4em] text-zinc-600 uppercase"
          >
            Capabilities
          </motion.span>
          <h2 className="text-6xl font-display font-medium tracking-tighter leading-tight">Expertise &<br />Focus Areas</h2>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
            Blending engineering rigor with artistic intuition to build digital products that leave an impact.
          </p>
        </div>

        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {SKILLS.map((skill, idx) => {
            const Icon = icons[skill.icon as keyof typeof icons] || Zap;
            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-10 rounded-[32px] border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
                <div className="relative z-10">
                  <div className="p-4 bg-zinc-100 text-zinc-950 rounded-2xl w-fit mb-8 shadow-xl">
                    <Icon size={28} />
                  </div>
                  <h3 className="font-display font-bold text-2xl mb-6">{skill.name}</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-600">
                      <span>Proficiency</span>
                      <span>{skill.level}%</span>
                    </div>
                    <div className="w-full h-[3px] bg-zinc-800/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Experience = () => {
  return (
    <section id="experience" className="py-40 px-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 mb-24">
        <motion.span 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="text-[10px] font-bold tracking-[0.4em] text-zinc-600 uppercase"
        >
          Timeline
        </motion.span>
        <h2 className="text-6xl md:text-8xl font-display font-medium tracking-tighter">Experience</h2>
      </div>

      <div className="flex flex-col">
        {EXPERIENCES.map((exp, idx) => (
          <motion.div 
            key={exp.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`group py-16 border-b border-zinc-900 last:border-0 hover:px-8 transition-all duration-500`}
          >
            <div className="flex flex-col md:grid md:grid-cols-12 gap-10 items-start">
              <div className="md:col-span-3">
                <span className="text-xs font-mono text-zinc-700 block mb-2">{exp.period}</span>
                <h3 className="text-2xl font-bold font-display group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{exp.company}</h3>
              </div>
              <div className="md:col-span-9">
                <h4 className="text-4xl font-display font-medium text-zinc-100 mb-6 italic">{exp.role}</h4>
                <p className="text-zinc-500 text-lg leading-relaxed max-w-2xl font-light">{exp.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Certifications = () => {
  const icons = { Cloud, GraduationCap, Award };

  return (
    <section id="credentials" className="py-40 px-6 bg-zinc-900/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-display font-medium tracking-tighter mb-24 text-center">Recognition</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {CERTIFICATIONS.map((cert, idx) => {
            const Icon = icons[cert.icon as keyof typeof icons] || Award;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -10, borderColor: "rgba(99, 102, 241, 0.3)" }}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-12 rounded-[40px] border border-zinc-800/40 bg-zinc-950/40 backdrop-blur-xl flex flex-col sm:flex-row gap-10 items-center sm:items-start transition-all duration-700"
              >
                <div className="p-6 bg-indigo-500/5 text-indigo-400 rounded-3xl shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={40} strokeWidth={1.5} />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold font-display mb-3 tracking-tight">{cert.title}</h3>
                  <div className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6 px-4 py-1.5 bg-indigo-500/10 rounded-full w-fit mx-auto sm:mx-0">{cert.issuer}</div>
                  <p className="text-zinc-500 text-sm leading-relaxed font-light">{cert.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-40 px-6 relative overflow-hidden bg-zinc-950">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           className="mb-20"
        >
          <span className="text-[10px] font-bold tracking-[0.4em] text-indigo-500 uppercase mb-8 block">Project Inquiry</span>
          <h2 className="text-7xl md:text-9xl font-display font-medium tracking-tighter leading-[0.8] mb-12">
            Let's create <br /> the <span className="text-zinc-700 italic font-light serif">Future</span>.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full mb-24 max-w-4xl">
          {[
            { label: "Email", value: PERSONAL_INFO.email, link: `mailto:${PERSONAL_INFO.email}`, icon: <Mail size={20} /> },
            { label: "Phone", value: PERSONAL_INFO.socials.phone, link: `tel:${PERSONAL_INFO.socials.phone}`, icon: <X size={20} /> },
            { label: "Github", value: "Z3GION", link: PERSONAL_INFO.socials.github, icon: <Github size={20} /> }
          ].map((item, i) => (
            <Magnetic key={i}>
              <motion.a
                href={item.link}
                target={item.label === "Github" ? "_blank" : undefined}
                whileHover={{ y: -5 }}
                className="p-10 rounded-[32px] border border-zinc-900 bg-zinc-900/20 flex flex-col items-center gap-4 group transition-colors hover:border-indigo-500/20"
              >
                <div className="text-zinc-600 group-hover:text-indigo-400 transition-colors">
                  {item.icon}
                </div>
                <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">{item.label}</span>
                <span className="text-sm font-medium transition-colors group-hover:text-white uppercase tracking-tight">{item.value}</span>
              </motion.a>
            </Magnetic>
          ))}
        </div>

        <Magnetic>
          <motion.a
            href={`mailto:${PERSONAL_INFO.email}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-4 px-14 py-6 bg-zinc-100 text-zinc-950 rounded-full font-bold text-lg shadow-2xl transition-all hover:pr-16"
          >
            Start a project
            <ArrowRight size={24} />
          </motion.a>
        </Magnetic>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-20 border-t border-zinc-900 bg-zinc-950 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
          <div className="text-2xl font-display font-medium tracking-tighter uppercase">{PERSONAL_INFO.name}<span className="text-indigo-500">.</span></div>
          <p className="text-zinc-700 text-[10px] uppercase font-bold tracking-widest">
            Handcrafted with precision & Passion
          </p>
        </div>
        
        <div className="flex flex-col md:items-end gap-6 text-center">
          <div className="flex gap-12">
            {["Services", "Archive", "Privacy", "Legal"].map(item => (
              <Magnetic key={item}><a href="#" className="text-[10px] font-bold tracking-widest text-zinc-600 hover:text-white transition-colors uppercase">{item}</a></Magnetic>
            ))}
          </div>
          <div className="text-zinc-800 text-[9px] font-mono uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {PERSONAL_INFO.name}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen grain bg-zinc-950 relative">
      <ParticleBackground />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <Projects />
        <Skills />
        <Experience />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

