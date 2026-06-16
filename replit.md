# Jullan Maglinte — Developer Portfolio

A modern, interactive developer portfolio with a stacked card UI, AI assistant, and admin dashboard.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, Wouter, Shadcn/UI
- **Backend**: Express.js 5, Node.js 20
- **Database**: MongoDB (Mongoose) for portfolio content; PostgreSQL (Drizzle ORM) available
- **AI**: Google Gemini 2.5 Flash via `@google/genai`
- **Media**: Cloudinary for image uploads
- **Email**: Resend for contact form notifications

## Running the Project

```bash
npm run dev      # Start development server on port 5000
npm run build    # Build for production
npm run start    # Run production build
npm run db:push  # Push Drizzle schema to PostgreSQL
```

## Required Secrets

All configured in Replit Secrets:

| Secret | Purpose |
|---|---|
| `JWT_SECRET` | Signs admin auth tokens |
| `MONGODB_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Google Gemini AI assistant |
| `CLOUDINARY_URL` | Media uploads |
| `RESEND_API_KEY` | Contact form emails |
| `ADMIN_USERNAME` | Admin dashboard login |
| `ADMIN_PASSWORD` | Admin dashboard password |

## Project Structure

```
client/       React frontend
server/       Express backend (routes.ts, db.ts, index.ts)
shared/       Shared TypeScript types & Drizzle schema
```

## Key Features

1. **Stacked card portfolio** — swipeable About / Projects / Experience cards
2. **AI Chat assistant** — Gemini-powered, answers questions about Jullan
3. **Admin dashboard** — `/admin` route, JWT-protected CMS for all content
4. **Contact form** — stores messages in MongoDB, sends email via Resend
5. **Cloudinary media** — admin can upload project images

## User Preferences

- Keep existing code structure and file layout
- Use `npx tsx` to run TypeScript server files (tsx is in node_modules but not global PATH)
