/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Skill, Experience } from './types';

export const PERSONAL_INFO = {
  name: "Dev Choudhary",
  role: "AI Developer & Salesforce Engineer",
  bio: "Building intelligent systems, automating enterprise workflows, and turning raw data into actionable decisions. Final-year B.Tech (AI) undergraduate specializing in AI/ML and Salesforce CRM engineering.",
  email: "devchaudhary07.2005@gmail.com",
  socials: {
    github: "https://github.com/Z3GION",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    phone: "+91-9664294721",
    location: "Jaipur, Rajasthan"
  }
};

export const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Digital Legacy Capsule",
    description: "Architected a time-locked digital vault using Python and Azure Cloud, allowing users to schedule secure data releases for future legacy management.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    tags: ["Python", "Azure", "Encryption"],
    year: "2024",
    link: "#"
  },
  {
    id: "2",
    title: "Novel Scraper Pro",
    description: "A robust Python-based automation tool for high-speed content extraction from various web novel platforms with automated formatting and PDF generation.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800",
    tags: ["Python", "BeautifulSoup", "Automation"],
    year: "2024",
    link: "#"
  },
  {
    id: "3",
    title: "Salesforce Lead Enricher",
    description: "Architected a full-stack Salesforce CRM application using REST API callouts and live data feeds to automatically enrich lead records with real-time business intelligence.",
    image: "https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=800",
    tags: ["Apex", "APIs", "REST", "OpenAI"],
    year: "2024",
    link: "https://github.com/Z3GION"
  },
  {
    id: "4",
    title: "Water Quality Predictor",
    description: "Fully deployed end-to-end ML web application predicting water potability from problem definition through model training to a live user-facing interface.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    tags: ["Python", "Flask", "Scikit-learn"],
    year: "2024",
    link: "#"
  },
  {
    id: "5",
    title: "Laptop Price Predictor",
    description: "Conducted extensive exploratory data analysis on real-world market data and achieved 85% model accuracy through iterative feature engineering.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800",
    tags: ["Python", "Pandas", "EDA"],
    year: "2023",
    link: "#"
  },
  {
    id: "6",
    title: "E-Cart System",
    description: "Built a fully functional responsive e-commerce platform with dynamic pricing logic and persistent sessions using React Hooks and LocalStorage.",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800",
    tags: ["React.js", "JavaScript", "LocalStorage"],
    year: "2023",
    link: "#"
  },
  {
    id: "7",
    title: "Typing Velocity",
    description: "A high-precision typing speed tester built with React, focusing on real-time WPM calculation and rhythmic accuracy visualization.",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800",
    tags: ["React", "JavaScript", "UI/UX"],
    year: "2023",
    link: "#"
  }
];

export const SKILLS: Skill[] = [
  { name: "Frontend Development", icon: "Layout", level: 95 },
  { name: "LLM & GenAI", icon: "Zap", level: 92 },
  { name: "Cloud (AWS/Azure)", icon: "Server", level: 88 },
  { name: "AI/ML Frameworks", icon: "Server", level: 90 },
  { name: "Salesforce Engine", icon: "Figma", level: 88 }
];

export const EXPERIENCES: Experience[] = [
  {
    id: "1",
    role: "Junior Bench Sales Recruiter",
    company: "Hidani Tech",
    period: "2025 - Present",
    description: "Manage end-to-end IT bench candidate recruitment pipelines, coordinating between consultants and vendors while meeting KPI goals."
  },
  {
    id: "2",
    role: "Data Science Intern",
    company: "Ice Hut Limited",
    period: "May 2024 - Aug 2024",
    description: "Engineered automated data pipelines for cleaning and preprocessing, and optimized ML models for predictive analysis."
  }
];

export const CERTIFICATIONS = [
  {
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    description: "Certified expertise in AWS cloud infrastructure, security, and core services for scalable AI deployment.",
    icon: "Cloud"
  },
  {
    title: "B.Tech in Computer Science (AI)",
    issuer: "Poornima Institute",
    description: "Expected 2026. Specialized coursework in Machine Learning, DBMS, and Cloud Computing.",
    icon: "GraduationCap"
  }
];
