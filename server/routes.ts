import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import {
  connectDB,
  isMongoConnected,
  getCollectionNames,
  getCollectionDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from "./db";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set");
}
const JWT_SECRET = process.env.JWT_SECRET;
const upload = multer({ storage: multer.memoryStorage() });

const FALLBACK_DATA = {
  profile: {
    name: "Jullan Maglinte",
    title: "Fullstack Developer",
    bio: "I designed and build clean, modern digital experiences.",
    description:
      "Fullstack Developer crafting clean, responsive, and modern web applications with attention to detail, smooth user experiences, and scalable backend solutions.",
    location: "Philippines",
    availability: "Freelance",
    avatar: null,
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "jullan@example.com",
    facebook: "https://facebook.com",
    cvUrl: null,
  },
  skills: [
    { _id: "1", name: "HTML", category: "Frontend" },
    { _id: "2", name: "CSS", category: "Frontend" },
    { _id: "3", name: "Python", category: "Backend" },
    { _id: "4", name: "JavaScript", category: "Frontend" },
    { _id: "5", name: "Vue.js", category: "Frontend" },
    { _id: "6", name: "CSharp", category: "Backend" },
    { _id: "7", name: "Figma", category: "Design" },
    { _id: "8", name: "TypeScript", category: "Frontend" },
    { _id: "9", name: "MongoDB", category: "Database" },
    { _id: "10", name: "Canva", category: "Design" },
    { _id: "11", name: "Git & GitHub", category: "Tools" },
    { _id: "12", name: "ExpressJS", category: "Backend" },
  ],
  projects: [
    {
      _id: "1",
      title: "Portfolio Website",
      description: "My personal portfolio website built with React and Framer Motion, featuring a stacked card design system.",
      technologies: ["React", "TypeScript", "TailwindCSS", "Framer Motion"],
      github: "https://github.com",
      liveDemo: "",
      image: null,
      category: "Web",
    },
    {
      _id: "2",
      title: "Task Manager App",
      description: "A fullstack task management application with real-time updates, drag & drop, and team collaboration.",
      technologies: ["Vue.js", "ExpressJS", "MongoDB", "Socket.io"],
      github: "https://github.com",
      liveDemo: "",
      image: null,
      category: "Web",
    },
    {
      _id: "3",
      title: "E-Commerce Platform",
      description: "A modern online store with product catalog, cart management, and secure payment integration.",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      github: "https://github.com",
      liveDemo: "",
      image: null,
      category: "Web",
    },
  ],
  experiences: [
    {
      _id: "1",
      company: "Freelance",
      role: "Full Stack Developer",
      period: "2023 – Present",
      description: "Building web applications for various clients using React, Node.js, and MongoDB.",
      technologies: ["React", "Node.js", "MongoDB"],
    },
    {
      _id: "2",
      company: "Personal Projects",
      role: "UI/UX Designer & Developer",
      period: "2022 – 2023",
      description: "Designing and building modern interfaces with Figma and implementing them with clean code.",
      technologies: ["Figma", "Vue.js", "CSS"],
    },
  ],
};

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    (req as any).admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

async function getPortfolioCollection(name: string): Promise<any[]> {
  if (!isMongoConnected) return (FALLBACK_DATA as any)[name] || [];
  const docs = await getCollectionDocuments(name);
  return docs.length > 0 ? docs : (FALLBACK_DATA as any)[name] || [];
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await connectDB();

  // ── Portfolio Data ──────────────────────────────────────────────
  app.get("/api/portfolio", async (_req, res) => {
    try {
      let profile = { ...FALLBACK_DATA.profile };
      if (isMongoConnected) {
        const profileDatas = await getCollectionDocuments("profiledatas");
        const settings = await getCollectionDocuments("settings");
        if (profileDatas.length > 0) {
          const { _id, __v, createdAt, updatedAt, ...rest } = profileDatas[0] as any;
          profile = { ...profile, ...rest };
        } else if (settings.length > 0) {
          const { _id, __v, ...rest } = settings[0] as any;
          profile = { ...profile, ...rest };
        }
      }
      const skills = await getPortfolioCollection("skills");
      const projects = await getPortfolioCollection("projects");
      const experiences = await getPortfolioCollection("experiences");
      res.json({ profile, skills, projects, experiences, connected: isMongoConnected });
    } catch (err) {
      res.status(500).json({ message: "Failed to load portfolio data" });
    }
  });

  // ── Contact Form ────────────────────────────────────────────────
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const contactDoc = {
        name,
        email,
        message,
        createdAt: new Date(),
        read: false,
      };

      if (isMongoConnected) {
        await createDocument("contacts", contactDoc);
      }

      if (process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "portfolio@resend.dev",
            to: FALLBACK_DATA.profile.email,
            subject: `New message from ${name}`,
            html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`,
          });
        } catch (emailErr) {
          console.error("[email] Failed to send:", emailErr);
        }
      }

      res.json({ success: true, message: "Message sent successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // ── AI Chat ─────────────────────────────────────────────────────
  async function buildPortfolioContext(): Promise<string> {
    let profile: any = { ...FALLBACK_DATA.profile };
    let skills: any[] = [];
    let projects: any[] = [];
    let experiences: any[] = [];

    if (isMongoConnected) {
      try {
        const profileDatas = await getCollectionDocuments("profiledatas");
        if (profileDatas.length > 0) {
          const { _id, __v, createdAt, updatedAt, ...rest } = profileDatas[0] as any;
          profile = { ...profile, ...rest };
        }
        skills = await getCollectionDocuments("skills");
        projects = await getCollectionDocuments("projects");
        experiences = await getCollectionDocuments("experiences");
      } catch {}
    }

    const skillNames = skills.map((s: any) => s.name || s.skill).filter(Boolean).join(", ")
      || "HTML, CSS, JavaScript, TypeScript, Vue.js, React, Node.js, Python, MongoDB, ExpressJS, Git, Figma";

    const projectLines = projects.map((p: any) => {
      const tags = Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || p.technologies?.join?.(", ") || "");
      const parts = [`- ${p.title || p.name}`];
      if (tags) parts.push(`(${tags})`);
      if (p.description || p.shortDesc) parts.push(`– ${(p.description || p.shortDesc || "").slice(0, 120)}`);
      if (p.link || p.demo) parts.push(`[Demo: ${p.link || p.demo}]`);
      if (p.github) parts.push(`[GitHub: ${p.github}]`);
      return parts.join(" ");
    }).join("\n") || "- SSAAM (Student School Activities Attendance Monitoring) – Vue 3, Node.js, MongoDB, Face Recognition";

    const expLines = experiences.map((e: any) => {
      const period = e.year || (e.startDate ? `${e.startDate}–${e.endDate || "Present"}` : "");
      return `- [${(e.type || "work").toUpperCase()}] ${e.title}${e.company ? ` at ${e.company}` : ""}${period ? ` (${period})` : ""}${e.description ? ` – ${e.description.slice(0, 120)}` : ""}`;
    }).join("\n") || "- Fullstack Developer at Freelance (2022–Present)\n- BS Information Technology, PUP (2020–2024)";

    return `
You are an AI assistant embedded in Jullan Maglinte's developer portfolio. Be helpful, friendly, and concise. Keep answers under 3 sentences unless detail is truly needed. Only answer questions relevant to Jullan's professional profile, portfolio, or related tech topics.

== LIVE PROFILE (from database) ==
Name: ${profile.name || "Jullan Maglinte"}
Title: ${profile.title || "Fullstack Developer"}
Location: ${profile.location || "Philippines"}
Availability: ${profile.availability || "Freelance"}
Bio: ${profile.bio || "Designs and builds clean, modern digital experiences"}
About: ${profile.about || profile.description || ""}
Email: ${profile.email || ""}
GitHub: ${profile.github || ""}
LinkedIn: ${profile.linkedin || ""}

== SKILLS ==
${skillNames}

== EXPERIENCES ==
${expLines}

== PROJECTS ==
${projectLines}

Answer questions about Jullan's portfolio, skills, experience, projects, and availability. If asked for contact info, share the email above.
    `.trim();
  }

  // ── Streaming AI endpoint ──
  app.post("/api/ai/stream", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) return res.status(400).json({ message: "Message is required" });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      if (!process.env.GEMINI_API_KEY) {
        res.write(`data: ${JSON.stringify({ text: "AI assistant is not configured yet. Please add your Gemini API key in Secrets." })}\n\n`);
        res.write("data: [DONE]\n\n");
        return res.end();
      }

      const portfolioContext = await buildPortfolioContext();
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const contents = [
        { role: "user",  parts: [{ text: portfolioContext }] },
        { role: "model", parts: [{ text: "Understood! I have Jullan's live portfolio data and I'm ready to answer questions about him." }] },
        ...(history || []),
        { role: "user",  parts: [{ text: message }] },
      ];

      const stream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents,
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err: any) {
      console.error("[ai/stream] error:", err?.message || err);
      res.write(`data: ${JSON.stringify({ text: "Sorry, something went wrong. Please try again." })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  });

  // ── Non-streaming AI endpoint ──
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) return res.status(400).json({ message: "Message is required" });

      if (!process.env.GEMINI_API_KEY) {
        return res.json({ reply: "AI assistant is not configured yet. Please add your Gemini API key in Secrets." });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const portfolioContext = await buildPortfolioContext();
      const contents = [
        { role: "user",  parts: [{ text: portfolioContext }] },
        { role: "model", parts: [{ text: "Understood! I have Jullan's live portfolio data and I'm ready to answer questions about him." }] },
        ...(history || []),
        { role: "user",  parts: [{ text: message }] },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      res.status(500).json({ message: "AI error: " + err.message });
    }
  });

  // ── Admin Auth ──────────────────────────────────────────────────
  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || "admin";
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";

    if (username !== adminUser || password !== adminPass) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token });
  });

  // ── Admin: Profile ─────────────────────────────────────────────
  app.get("/api/admin/profile", authMiddleware, async (_req, res) => {
    try {
      let profile = { ...FALLBACK_DATA.profile };
      if (isMongoConnected) {
        const docs = await getCollectionDocuments("profiledatas");
        if (docs.length > 0) {
          const { _id, __v, createdAt, updatedAt, ...rest } = docs[0] as any;
          profile = { ...profile, ...rest };
        }
      }
      res.json({ profile });
    } catch {
      res.status(500).json({ message: "Failed to load profile" });
    }
  });

  app.put("/api/admin/profile", authMiddleware, async (req, res) => {
    try {
      if (!isMongoConnected) return res.status(503).json({ message: "Database not connected" });
      const data = req.body;
      const docs = await getCollectionDocuments("profiledatas");
      if (docs.length > 0) {
        await updateDocument("profiledatas", (docs[0] as any)._id, { ...data, updatedAt: new Date() });
      } else {
        await createDocument("profiledatas", { ...data, createdAt: new Date() });
      }
      res.json({ message: "Profile saved" });
    } catch {
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  // ── Admin: Collections ──────────────────────────────────────────
  app.get("/api/admin/collections", authMiddleware, async (_req, res) => {
    try {
      if (!isMongoConnected) {
        return res.json({ collections: ["projects", "skills", "experiences", "contacts", "settings"], connected: false });
      }
      const names = await getCollectionNames();
      res.json({ collections: names, connected: true });
    } catch {
      res.status(500).json({ message: "Failed to list collections" });
    }
  });

  app.get("/api/admin/collections/:name", authMiddleware, async (req, res) => {
    try {
      const { name } = req.params;
      if (!isMongoConnected) {
        return res.json({ documents: (FALLBACK_DATA as any)[name] || [], connected: false });
      }
      const docs = await getCollectionDocuments(name);
      res.json({ documents: docs, connected: true });
    } catch {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/admin/collections/:name", authMiddleware, async (req, res) => {
    try {
      if (!isMongoConnected) return res.status(503).json({ message: "Database not connected" });
      const result = await createDocument(req.params.name, { ...req.body, createdAt: new Date() });
      res.json({ success: true, result });
    } catch {
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put("/api/admin/collections/:name/:id", authMiddleware, async (req, res) => {
    try {
      if (!isMongoConnected) return res.status(503).json({ message: "Database not connected" });
      const result = await updateDocument(req.params.name, req.params.id, req.body);
      res.json({ success: true, result });
    } catch {
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/admin/collections/:name/:id", authMiddleware, async (req, res) => {
    try {
      if (!isMongoConnected) return res.status(503).json({ message: "Database not connected" });
      await deleteDocument(req.params.name, req.params.id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  app.delete("/api/admin/collections/:name", authMiddleware, async (req, res) => {
    try {
      if (!isMongoConnected) return res.status(503).json({ message: "Database not connected" });
      const mongoose = await import("mongoose");
      await mongoose.default.connection.db!.dropCollection(req.params.name);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to drop collection" });
    }
  });

  // ── Admin: Media Upload ─────────────────────────────────────────
  app.post("/api/admin/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
      if (!process.env.CLOUDINARY_URL) {
        return res.status(503).json({ message: "Cloudinary not configured" });
      }
      if (!req.file) return res.status(400).json({ message: "No file provided" });

      const cloudinary = await import("cloudinary");
      cloudinary.v2.config({ cloudinary_url: process.env.CLOUDINARY_URL });

      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.v2.uploader.upload(dataURI, {
        folder: "portfolio",
      });

      res.json({ url: result.secure_url, publicId: result.public_id });
    } catch (err: any) {
      res.status(500).json({ message: "Upload failed: " + err.message });
    }
  });

  app.delete("/api/admin/media/:publicId", authMiddleware, async (req, res) => {
    try {
      if (!process.env.CLOUDINARY_URL) return res.status(503).json({ message: "Cloudinary not configured" });
      const cloudinary = await import("cloudinary");
      cloudinary.v2.config({ cloudinary_url: process.env.CLOUDINARY_URL });
      await cloudinary.v2.uploader.destroy(req.params.publicId);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // ── Admin: Messages ─────────────────────────────────────────────
  app.get("/api/admin/messages", authMiddleware, async (_req, res) => {
    try {
      if (!isMongoConnected) return res.json({ messages: [] });
      const msgs = await getCollectionDocuments("contacts");
      res.json({ messages: msgs });
    } catch {
      res.status(500).json({ message: "Failed to load messages" });
    }
  });

  return httpServer;
}
