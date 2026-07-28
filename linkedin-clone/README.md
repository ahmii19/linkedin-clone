<div align="center">
  <h1>LinkedClone</h1>
  <p>A full-stack LinkedIn clone built with Next.js, featuring real-time messaging, notifications, and a modern responsive UI.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2.12-000000?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.IO-4.8.3-010101?style=flat-square&logo=socket.io" alt="Socket.IO" />
    <img src="https://img.shields.io/badge/NextAuth-v5-EC4899?style=flat-square&logo=nextauth" alt="NextAuth" />
    <img src="https://img.shields.io/badge/ImageKit-CDN-007AFF?style=flat-square&logo=imagekit" alt="ImageKit" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  </p>
</div>

---

## Features

| Category | Features |
|---|---|
| **Authentication** | Email/password signup and login with NextAuth.js v5, JWT-based sessions, protected routes |
| **User Profiles** | Editable profiles with avatar, cover photo, headline, bio, location, skills, experience, and education sections |
| **Posts** | Create, edit, and delete posts with image upload (JPG/PNG/WEBP, max 5MB), three-dot context menu |
| **Likes** | Like/unlike posts with real-time count updates via Socket.IO, duplicate prevention, notification on like |
| **Comments** | Add and delete comments on posts, real-time comment count updates, notification on comment, cascading cleanup |
| **Real-time Chat** | One-on-one messaging with Socket.IO, typing indicators, message history, conversation list from accepted connections |
| **Connections** | Send, accept, reject connection requests, view pending/connected users, notification on request/accepted |
| **Notifications** | Real-time push notifications for likes, comments, connection requests, and connection accepts, mark-as-read and delete |
| **Search** | Live debounced user search in navbar with avatar, name, and headline |
| **Responsive UI** | Mobile bottom navigation, collapsible sidebars, glass-effect navbar, dark mode support |
| **Image Upload** | ImageKit integration for profile photos, cover photos, and post images |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) (App Router) | Framework |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [Lucide React](https://lucide.dev/) | Icons |
| [date-fns](https://date-fns.org/) | Date formatting |
| [react-hot-toast](https://react-hot-toast.com/) | Toast notifications |
| [zustand](https://zustand-demo.pmnd.rs/) | State management |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Class merging |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/light mode |

### Backend

| Technology | Purpose |
|---|---|
| Next.js API Routes | Serverless API |
| [Mongoose](https://mongoosejs.com/) 9.x | MongoDB ODM |
| [NextAuth.js](https://next-auth.js.org/) v5 (beta) | Authentication |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [Socket.IO](https://socket.io/) 4.8 | WebSocket server |

### Infrastructure

| Service | Purpose |
|---|---|
| [MongoDB](https://www.mongodb.com/) (Atlas) | Database |
| [ImageKit](https://imagekit.io/) | Image upload, optimization, and CDN |
| [Socket.IO](https://socket.io/) | Real-time bidirectional communication |

---

## Screenshots

> Add screenshots to an `assets/` directory in the project root and update the paths below.

```
assets/
├── feed.png         # Main feed with posts, sidebar, and navbar
├── profile.png      # User profile page with cover, avatar, and tabs
├── messages.png     # Real-time messaging interface
├── notifications.png # Notification list with actions
├── login.png        # Login/signup page
└── search.png       # Navbar search dropdown with results
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                   # Auth layout, login, signup
│   ├── (main)/                   # Main app layout with navbars
│   │   ├── connections/          # Connection requests & network
│   │   ├── feed/                 # Main post feed
│   │   ├── messages/             # Real-time chat
│   │   ├── notifications/        # Notification center
│   │   ├── profile/
│   │   │   ├── [username]/       # Public profile page
│   │   │   └── edit/             # Profile editor
│   │   └── search/               # User search page
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth + signup
│   │   ├── comments/             # Comment CRUD
│   │   ├── connections/          # Connection management
│   │   ├── likes/                # Like/unlike
│   │   ├── messages/             # Message history & sending
│   │   ├── notifications/        # Notification CRUD
│   │   ├── posts/                # Post CRUD
│   │   ├── search/               # User search endpoint
│   │   ├── socket/               # Socket.IO server
│   │   ├── upload/               # ImageKit uploads
│   │   └── users/                # User profile API
│   └── globals.css               # Global styles
├── components/
│   ├── shared/                   # Navbar, Sidebars, PostCard, CreatePost, BottomNav, Providers
│   └── ui/                       # Button, Input, Textarea, Avatar, Card, Skeleton
├── lib/
│   ├── auth.ts                   # NextAuth configuration
│   ├── db.ts                     # MongoDB connection (singleton)
│   ├── socket.ts                 # Socket.IO client helper
│   ├── upload.ts                 # ImageKit server config
│   └── utils.ts                  # Utility functions
├── models/                       # Mongoose schemas
│   ├── User.ts
│   ├── Post.ts
│   ├── Comment.ts
│   ├── Connection.ts
│   ├── Message.ts
│   └── Notification.ts
├── types/                        # TypeScript interfaces
│   ├── index.ts
│   └── next-auth.d.ts
└── middleware.ts                 # Route protection
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** or **yarn** or **pnpm**
- **MongoDB** instance (local or [Atlas](https://www.mongodb.com/atlas))
- **ImageKit** account ([free tier](https://imagekit.io/plans/free/))

### Installation

```bash
git clone https://github.com/ahmii19/linkedin-clone.git
cd linkedin-clone
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>
AUTH_SECRET=<generate with: openssl rand -base64 32>
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/<your-account-id>
NEXT_PUBLIC_URL=http://localhost:3000
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `AUTH_SECRET` | NextAuth encryption secret |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public API key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private API key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |
| `NEXT_PUBLIC_URL` | Application base URL |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

---

## Usage

### Authentication

- **Register**: Navigate to `/signup`, provide your name, username (unique), email, and password. You will be automatically signed in after registration.
- **Login**: Visit `/login` and enter your email and password.

### Creating a Post

1. On the feed page, use the **Create Post** card at the top.
2. Write your content in the textarea.
3. Optionally attach an image (JPG, PNG, or WEBP, max 5 MB).
4. Click **Post** to publish. The feed updates immediately.

### Connecting with Users

- Search for users via the **navbar search** or the **People you may know** sidebar section.
- Visit a user's profile and click **Connect** to send a connection request.
- The recipient will receive a real-time notification.
- On the **Network** page, you can **Accept** or **Reject** incoming requests.

### Sending Messages

- Navigate to **Messages** from the navbar.
- Select a connected user from the conversation list.
- Type your message and press **Send**. Messages appear in real time for both users.
- The other user's typing indicator appears while they compose a reply.

### Notifications

- The bell icon in the navbar shows an unread badge count.
- Click to view all notifications with context (who liked/commented/connected).
- Use the **⋮** menu on each notification to mark it as read or delete it.
- Notifications link directly to the relevant post, profile, or connection page.

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create a new user account |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth authentication handlers |
| GET | `/api/users/me` | Get current user profile |
| GET | `/api/users/:username` | Get public user profile |
| PUT | `/api/users/update` | Update user profile |
| GET/POST | `/api/posts` | List posts / create a post |
| GET/PUT/DELETE | `/api/posts/:id` | Get / update / delete a post |
| GET/POST | `/api/comments` | List comments (by postId) / create a comment |
| DELETE | `/api/comments/:id` | Delete a comment |
| POST | `/api/likes` | Toggle like on a post |
| GET/POST | `/api/connections` | List connections / send request |
| PATCH | `/api/connections/:action` | Accept or reject a connection |
| GET | `/api/connections/status` | Check connection status with a user |
| GET/POST | `/api/messages` | Get conversation messages / send a message |
| GET/PATCH/DELETE | `/api/notifications` | List / mark read / delete notifications |
| GET | `/api/search` | Search users by query |
| POST | `/api/upload/post` | Upload a post image |
| POST | `/api/upload/profile` | Upload and set profile photo |
| POST | `/api/upload/cover` | Upload and set cover photo |

---

## Data Models

```
User         name, username, email, password, bio, headline, location,
             skills[], experience[], education[], profilePhoto, coverPhoto

Post         author (ref User), content, image, likes[],
             likeCount, commentCount

Comment      post (ref Post), author (ref User), content

Connection   requester (ref User), recipient (ref User),
             status (pending | accepted | rejected)

Message      sender (ref User), receiver (ref User), content, read

Notification recipient (ref User), sender (ref User),
             type (connection_request | connection_accepted |
                   new_comment | new_like),
             post?, comment?, read
```

---

## Future Improvements

- Video posts and media carousels
- Stories (24h ephemeral content)
- Group chat and group posts
- Job listings and application system
- Premium/verified accounts
- Post sharing and resharing
- Hashtag support and trending topics
- Email verification flow
- Admin dashboard

---

## License

[MIT](LICENSE)

---

## Author

**Ahmed** — [@ahmii19](https://github.com/ahmii19)
