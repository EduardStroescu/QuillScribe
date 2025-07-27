<p align="center">
  <a href="https://quillscribe.vercel.app/" target="blank"><img src="https://raw.githubusercontent.com/EduardStroescu/PubImages/main/WebsiteImages/quillScribe.jpg" alt="QuillScribe Preview" /></a>
</p>

# QuillScribe

## Introduction

A real-time collaborative text editor built for teams to create and edit content like articles, blog posts, and PDFs. With support for shared workspaces, organized files, and folders, it provides a streamlined environment for seamless teamwork.

## Overview

This project delivers a real-time text editing platform powered by Next.js 14, integrated with Supabase and Socket.io. It enables live collaboration within team workspaces, complete with shared folders and files. Key features include synchronized cursors and real-time text selection, fostering a responsive and interactive editing experience.

The platform follows a typical SaaS model—free to use with optional monthly subscriptions that unlock advanced features such as increased storage and enhanced customization options.

### Features

- Real-time Collaboration
- Real-time cursors
- Real-time text selection
- Real-time database and collaboration
- Real-time presence
- Move to trash functionality
- Custom emoji picker
- Light mode/dark mode
- Next.js 14 app router
- Free plan restrictions
- Monthly payments/subscriptions
- Custom email 2FA invitation
- Custom Rich text editor
- Update profile settings
- Manage payments in a portal
- Supabase Authentication
- Web sockets
- Optimistic UI
- Responsive design
- Typescript

### Technologies Used

- [Next.JS 14 | Typescript](https://github.com/vercel/next.js)
- [Supabase](https://github.com/supabase/supabase)
- [Drizzle-ORM](https://github.com/drizzle-team/drizzle-orm)
- [Stripe](https://github.com/stripe/stripe-node)
- [Tailwind](https://tailwindcss.com/)
- [Socket.io](https://github.com/socketio/socket.io)
- [React-Hook-Form](https://github.com/react-hook-form/react-hook-form)
- [Zod](https://github.com/colinhacks/zod)
- [Quill](https://github.com/quilljs/quill)
- [Quill-Cursors](https://github.com/reedsy/quill-cursors)
- [Emoji-Picker-React](https://github.com/ealush/emoji-picker-react)
- [Next-Themes](https://github.com/pacocoursey/next-themes)
- [Shadcn](https://github.com/shadcn-ui/ui)
- [Radix-UI](https://www.radix-ui.com/)
- EsLint

<h3 color="red">IMPORTANT</h3>

Please see the [notes](#notes) at the end of this document. As it is important in running the project both locally and in production.

```
Remember to update `.env` with your Supabase keys, website URL and Stripe keys!

Example:
_Provided by Supabase_
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SERVICE_ROLE_KEY=
PW=

NEXT_PUBLIC_SITE_URL= http://localhost:3000 || Live Url
NEXT_PUBLIC_SOCKET_URL= http://localhost:3333 || Separate Websocket backend

_Provided by Stripe_

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET= /* For Development Use Only */ Given by Stripe when creating
a self-hosted webhook endpoint for supabase product population and test purchases.
STRIPE_WEBHOOK_SECRET_LIVE= /* For Production Use Only / Don't include at all when
 viewing locally */

_Provide Demo Accounts made on Supabase_

NEXT_PUBLIC_PRO_DEMO_EMAIL=
NEXT_PUBLIC_PRO_DEMO_PASS=
NEXT_PUBLIC_FREE_DEMO_EMAIL=
NEXT_PUBLIC_FREE_DEMO_PASS=
```

```
update next.config (NextJS > v14) with:

/** @type  {import('next').NextConfig} */

const  nextConfig  = {
 images: {
  remotePatterns: [{
   protocol:  "https",
   hostname:  "", - Add the same url as .env NEXT_PUBLIC_SUPABASE_URL || Ex: ###.supabase.co
},],},};

module.exports  =  nextConfig;

```

## Local development

```bash
git clone https://github.com/EduardStroescu/QuillScribe.git
npm install
npm run dev
```

## Building for production

```bash
npm run build
```

<h2 color="red" id="notes">
Notes
</h2>

Deploying the WebSocket Gateway to Vercel will cause issues with the connection(resulting in no real-time) because of Vercel's edge functions' transfer limits.
To keep the functionality I've separated the gateway in its own repo <a href="https://github.com/EduardStroescu/quillscribe-socket-server" target="_blank" rel="noopener noreferrer">here</a>, deploy it to Railway, Koyeb or another platform which supports real-time connections.
