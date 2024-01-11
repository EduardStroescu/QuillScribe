# QuillScribe

## Introduction

Real-time text editor made for users to work on articles, posts, pdf content, etc. in a collaborative environment which includes shared workspaces, files and folders.

## Overview

The aim of this project is to create a real-time text editing application using Next.js 14, while being connected to Supabase, Stripe, and Socket.io. It features collaborative workspaces with shared folders and files, offering a seamless live experience. Users can enjoy features like real-time cursors and text selection, ensuring a dynamic and interactive editing environment.

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
- Custom Authentication
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
- [UUID](https://github.com/uuidjs/uuid)
- [Emoji-Picker-React](https://github.com/ealush/emoji-picker-react)
- [Next-Themes](https://github.com/pacocoursey/next-themes)
- [Radix-UI](https://www.radix-ui.com/)
- [clsx](https://github.com/lukeed/clsx)
- EsLint

```

Remember to update `.env` with your Supabase keys, website URL and Stripe keys!

Example:
_Provided by Supabase_
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SERVICE_ROLE_KEY=
PW=

NEXT_PUBLIC_SITE_URL= http://localhost:3000/ || Live Url

_Provided by Stripe_

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET= /* For Development Use Only */ Given by Stripe when creating
a self-hosted webhook endpoint for supabase product population and test purchases.
STRIPE_WEBHOOK_SECRET_LIVE= /* For Production Use Only / Don't include at all when
 viewing locally */

```

## Local development

```bash

git  clone

npm  install

update next.config (NextJS > v14) with:

/** @type  {import('next').NextConfig} */

const  nextConfig  = {
 images: {
  remotePatterns: [{
   protocol:  "https",
   hostname:  "", - Add the same url as .env NEXT_PUBLIC_SUPABASE_URL || Ex: ###.supabase.co
},],},};

module.exports  =  nextConfig;

npm  run  dev

```

## Building for production

```bash

npm  run  build

```

## Disclaimer

`Deploying the project to Vercel will cause the socket to stop working (resulting no real-time), because of Vercel's edge functions' transfer limits. To keep the functionality please deploy to Railway or another platform which supports real-time connections. `
