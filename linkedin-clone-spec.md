# LinkedIn Clone — Full Stack Project Specification

> Role: Senior Full Stack Engineer & UI/UX Expert
> Goal: Build a **production-ready LinkedIn Clone**

---

## 🧰 Tech Stack *(do not change)*

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

### Backend
- Next.js API Routes
- Server Components wherever possible
- Client Components only when interactivity is required

### Authentication
- Auth.js (NextAuth)

### Database
- MongoDB
- Mongoose

### Image Upload & Storage
- ImageKit **only**

### Realtime
- Socket.IO

### AI Features
- ❌ Do **not** use any AI features

### Email Verification
- ❌ Do **not** implement email verification

### Deployment
- Vercel-compatible

---

## 🎯 Project Goals

The application should look and feel similar to LinkedIn, with focus on:

- Clean architecture
- Reusable components
- Scalable folder structure
- Production-quality code
- Responsive UI
- Modern design
- Excellent UX
- Dark / Light mode
- Fast performance

---

## 📄 Pages

1. Home Feed
2. Login
3. Signup
4. Profile
5. Edit Profile
6. Connections
7. Messages
8. Notifications
9. Search
10. 404

---

## 🔐 Authentication

Implemented using **Auth.js**.

**Features:**
- Signup
- Login
- Logout
- Protected routes
- Session management

Unauthenticated users are redirected to **Login**.

---

## 👤 User Profile

**Fields:**
- Name
- Username
- Email
- Bio
- Headline
- Location
- Skills
- Experience
- Education
- Profile Photo
- Cover Photo

Users can edit their own profile.

---

## 📰 Feed

Home feed includes:
- Create post
- Text posts
- Image posts
- Like
- Comment
- Delete own post
- Edit own post
- Infinite scroll (if possible)
- Latest posts first

---

## 📝 Posts

Each post contains:
- Author
- Profile photo
- Content
- Optional image
- Like count
- Comment count
- Created time

---

## ❤️ Likes

- Like
- Unlike
- Realtime UI update

---

## 💬 Comments

- Add comment
- Delete own comment
- View all comments

---

## 🤝 Connections

- Send connection request
- Accept request
- Reject request
- Remove connection
- View connections

---

## 🔍 Search

Search users by:
- Name
- Username

Shows matching users instantly.

---

## 🔔 Notifications

**Types:**
- Connection request
- Connection accepted
- New comment
- New like

**Behavior:**
- Unread badge
- Mark as read

---

## 💌 Messaging

Realtime chat using **Socket.IO**.

**Features:**
- Private chat
- Typing indicator
- Online status
- Message time
- Auto scroll

---

## 🖼️ Image Upload

Using **ImageKit only**.

**Uploads:**
- Profile picture
- Cover photo
- Post images

> Store only ImageKit URLs inside MongoDB.

---

## 🔌 API Routes

RESTful conventions, e.g.:

```
POST    /api/posts
GET     /api/posts
PUT     /api/posts/:id
DELETE  /api/posts/:id

POST    /api/comments

POST    /api/posts/:id/like

POST    /api/connections/request

POST    /api/messages

GET     /api/notifications

POST    /api/upload/profile
```

---

## 🗄️ MongoDB Collections

- Users
- Posts
- Comments
- Connections
- Messages
- Notifications

---

## 📁 Folder Structure

Clean architecture example:

```
app/
components/
hooks/
lib/
models/
services/
types/
utils/
middleware.ts
public/
```

---

## 🎨 UI Requirements

Premium feel, inspired by **LinkedIn** and modern SaaS applications.

**Requirements:**
- Rounded cards
- Beautiful spacing
- Professional typography
- Smooth animations
- Hover effects
- Loading skeletons
- Empty states
- Responsive (Desktop / Tablet / Mobile)
- Dark mode
- Light mode

---

## ⚡ Performance

- Server Components whenever possible
- Client Components only when necessary
- Lazy loading
- Image optimization
- Code splitting
- Memoization where needed

---

## ✅ Coding Standards

- Clean code
- SOLID principles
- Reusable components
- No duplicate code
- Proper TypeScript types
- Meaningful variable names
- Proper error handling
- Proper loading states
- Proper validation

---

## 🚫 Things NOT to Use

- Firebase
- Supabase
- Prisma
- Cloudinary
- Clerk
- AI APIs
- Email verification
- Redux (unless absolutely necessary)

---

## 🏁 Final Goal

Generate a **production-ready LinkedIn Clone** that is scalable, clean, responsive, and maintainable, following modern Next.js best practices.

Build the project **feature by feature**, with:
- Proper folder structure
- Reusable components
- API routes
- MongoDB models
- Professional UI/UX
