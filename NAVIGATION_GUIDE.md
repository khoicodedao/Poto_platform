# 🧭 EduPlatform Navigation Menu System

## Overview

Navigation system gồm 3 levels:

1. **TopNav** - Main header với logo, main menu, notifications, user menu
2. **ClassFeatures Dropdown** - Dropdown menu cho class features (desktop)
3. **ClassMobileNav** - Mobile menu với sheet drawer (mobile)
4. **ClassNavTabs** - Horizontal tabs trong class detail page

---

## 1️⃣ TopNav Component

**File:** `components/top-nav.tsx`

### Features

```tsx
- Logo + Brand name
- Main navigation pills:
  - Dashboard (/)
  - Lớp Học (/classes)
  - Bài Tập (/assignments)
  - Tài Liệu (/files)

- Class Features Dropdown (desktop only, in class pages):
  - 📅 Buổi Học → /classes/[id]/sessions
  - 📝 Bài Tập → /classes/[id]/assignments
  - 📊 Phân Tích → /classes/[id]/analytics
  - 👥 Học Sinh → /classes/[id]/students
  - 🔔 Thông Báo → /classes/[id]/notifications
  - 📚 Tài Liệu → /classes/[id]/files

- Notifications Bell (icon + unread count)
- User Menu (avatar + dropdown)
```

### Responsive Behavior

```
Mobile (< md):
  - Logo only
  - No main nav (hidden)
  - No class dropdown (hidden)
  - Mobile menu button (via ClassMobileNav)
  - Bell icon
  - User menu

Desktop (≥ md):
  - Logo + Brand
  - Main nav pills
  - Class dropdown (if in class page)
  - Bell icon
  - User menu
```

---

## 2️⃣ ClassMobileNav Component

**File:** `components/class-mobile-nav.tsx`

### Features

```tsx
- Hamburger menu icon (visible on mobile only)
- Sheet drawer with class features:
  - 📅 Buổi Học
  - 📝 Bài Tập
  - 📊 Phân Tích
  - 👥 Học Sinh
  - 🔔 Thông Báo
  - 📚 Tài Liệu

- Each item shows:
  - Icon
  - Label
  - Description (optional)
  - Active state highlight

- Closes sheet on navigation
```

### Responsive Behavior

```
Mobile (< md):
  - Visible hamburger menu
  - Full-width sheet drawer

Desktop (≥ md):
  - Hidden (display: none)
```

---

## 3️⃣ ClassNavTabs Component

**File:** `components/class-nav-tabs.tsx`

### Features

```tsx
- Horizontal tabs below TopNav
- Items:
  - 🏠 Trang Chủ (main class page)
  - 📅 Buổi Học
  - 📝 Bài Tập
  - 📊 Phân Tích
  - 👥 Học Sinh
  - 🔔 Thông Báo
  - 📚 Tài Liệu

- Active indicator (blue bottom border)
- Scrollable horizontally on mobile
- Icons + labels on desktop
- Icons only on mobile (with title truncate)
```

### Responsive Behavior

```
Mobile (< sm):
  - Icons only
  - Small padding
  - Scrollable horizontal

Desktop (≥ sm):
  - Icons + Labels
  - Normal padding
  - Full navigation
```

---

## Navigation Flow

```
App Layout
  │
  ├─ TopNav (fixed header)
  │  ├─ Logo + Brand
  │  ├─ Main Navigation (hidden on mobile)
  │  ├─ Class Dropdown (desktop only, in class pages)
  │  ├─ ClassMobileNav (mobile only, in class pages)
  │  ├─ NotificationCenter (bell icon)
  │  └─ UserMenu (avatar + dropdown)
  │
  ├─ ClassNavTabs (if in class page)
  │  └─ Horizontal navigation tabs
  │
  └─ Main Content
     └─ Page specific content
```

---

## Usage Examples

### Show Class Features

Automatically shows in TopNav when:

```tsx
pathname.includes("/classes/") && classId exists
```

### Active Tab Highlighting

```tsx
isActive = pathname?.includes(featureName);
```

Example:

- On `/classes/5/sessions` → "Buổi Học" tab is active
- On `/classes/5/assignments` → "Bài Tập" tab is active

---

## Feature Cards in Dropdown

Each feature shows:

```
┌─────────────────────────────┐
│ 📅 Buổi Học                │
│ Quản lý lịch & điểm danh   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 📝 Bài Tập                 │
│ Tạo & chấm bài             │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 📊 Phân Tích               │
│ Xem tiến độ học tập        │
└─────────────────────────────┘

(... và các mục khác)
```

---

## Menu Items & Icons

| Item                | Icon      | Route                         | Description          |
| ------------------- | --------- | ----------------------------- | -------------------- |
| Dashboard           | Home      | `/`                           | Trang chủ chung      |
| Lớp Học             | BookOpen  | `/classes`                    | Danh sách lớp        |
| Bài Tập             | FileText  | `/assignments`                | Bài tập chung        |
| Tài Liệu            | BookOpen  | `/files`                      | Tài liệu chung       |
| **Class Features:** |           |                               |                      |
| Buổi Học            | Calendar  | `/classes/[id]/sessions`      | Lên lịch & điểm danh |
| Bài Tập             | FileText  | `/classes/[id]/assignments`   | Bài tập lớp          |
| Phân Tích           | BarChart3 | `/classes/[id]/analytics`     | Analytics            |
| Học Sinh            | Users     | `/classes/[id]/students`      | Quản lý HS           |
| Thông Báo           | Bell      | `/classes/[id]/notifications` | Gửi thông báo        |
| Tài Liệu            | BookOpen  | `/classes/[id]/files`         | Tài liệu lớp         |

---

## CSS Classes

All navigation components use:

- **Tailwind CSS** - Utility classes
- **clsx** - Conditional classes
- **Responsive** - sm, md, lg breakpoints

Example styling:

```tsx
// Active link
"bg-white text-gray-900 shadow";

// Hover link
"text-gray-500 hover:text-gray-900";

// Mobile hidden
"hidden md:flex";

// Mobile visible
"md:hidden";
```

---

## Mobile Responsive Breakpoints

```
Mobile (< 768px / < md):
  ✓ TopNav with logo only
  ✓ ClassMobileNav hamburger menu
  ✓ ClassNavTabs icons only
  ✓ Vertical sheet drawer

Tablet (768px - 1024px / md - lg):
  ✓ TopNav full
  ✓ No mobile menu
  ✓ ClassNavTabs mixed icons/labels
  ✓ Class dropdown visible

Desktop (> 1024px / lg):
  ✓ TopNav full
  ✓ All features visible
  ✓ ClassNavTabs full labels
  ✓ Optimal spacing
```

---

## State Management

### Active Tab Detection

```tsx
const isActive = pathname?.includes(featureName);

// Examples:
// /classes/5/sessions → "sessions" is active
// /classes/5/assignments → "assignments" is active
// /classes/5/analytics → "analytics" is active
```

### Mobile Menu Toggle

```tsx
const [isOpen, setIsOpen] = useState(false);

// Opens on hamburger click
// Closes on item selection
```

---

## Accessibility Features

- ✅ Semantic HTML (nav, button, link elements)
- ✅ ARIA labels on buttons
- ✅ Keyboard navigation support
- ✅ High contrast indicators (blue border for active)
- ✅ Icon + text labels for clarity
- ✅ Mobile-friendly touch targets

---

## Integration with Components

### TopNav in Layout

```tsx
// app/layout.tsx
<body>
  <TopNav user={session?.user ?? null} />
  <div className="pt-20">{children}</div>
</body>
```

### ClassNavTabs in Pages

```tsx
// app/classes/[id]/page.tsx
return (
  <div>
    <ClassNavTabs />
    <main>{/* Page content */}</main>
  </div>
);
```

---

## Future Enhancements

- [ ] Search bar in TopNav
- [ ] Notifications dropdown with preview
- [ ] Quick action buttons
- [ ] Breadcrumb in TopNav
- [ ] Custom theme selector
- [ ] Dark mode toggle
- [ ] Help/Documentation menu

---

## Testing Navigation

### Desktop Navigation Flow

```
1. Visit http://localhost:3000
2. See: Logo + Dashboard/Lớp học/Bài tập/Tài liệu
3. Click "Lớp học" → See class list
4. Click a class → See ClassNavTabs
5. Hover class dropdown → See 6 features
6. Click any feature → Navigate correctly
```

### Mobile Navigation Flow

```
1. Visit on mobile device
2. Tap hamburger menu → See drawer
3. Select feature → Navigate correctly
4. Drawer closes automatically
5. ClassNavTabs visible with icons
```

### Active State Test

```
1. In /classes/5/sessions
2. Check "Buổi Học" is highlighted (blue)
3. Click "Bài Tập"
4. Check "Bài Tập" becomes highlighted
5. Check "Buổi Học" is no longer highlighted
```

---

## Files Modified/Created

Created:

- ✅ `components/class-mobile-nav.tsx`
- ✅ `components/class-nav-tabs.tsx`

Modified:

- ✅ `components/top-nav.tsx` (added dropdown + mobile nav integration)
- ✅ `app/classes/[id]/page.tsx` (added ClassNavTabs)

---

**Navigation System Complete!** 🧭
Ready for testing & deployment. 🚀
