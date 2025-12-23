# USER GUIDE - ONLINE LEARNING PLATFORM

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Dashboard](#dashboard)
4. [Class Management](#class-management)
5. [Online Classroom](#online-classroom)
6. [Assignment Management](#assignment-management)
7. [File Management](#file-management)
8. [Roles and Permissions](#roles-and-permissions)

---

## Introduction

**Online Learning Platform** is a comprehensive online learning system supporting remote teaching and learning with features:

- 🎥 **Video Conference**: Online learning with LiveKit
- 📚 **Class Management**: Create, manage and join classes
- 📝 **Assignments**: Assign, submit and grade assignments
- 📁 **Files**: Share and manage learning materials
- 💬 **Chat**: Real-time communication in class
- 🎨 **Whiteboard**: Interactive drawing board (Excalidraw)
- 📊 **Reports**: Track progress and learning outcomes

---

## Authentication

### 1. Sign In Page (`/auth/signin`)

#### How to Sign In:

**Method 1: Manual Login**
1. Go to sign in page
2. Enter **Email** and **Password**
3. Click **"Sign In"** button

**Method 2: Quick Login**
- Click **"Student"** button to login with sample student account
- Click **"Teacher"** button to login with sample teacher account

#### Demo Accounts:

```
Teacher:
- Email: teacher1@example.com
- Password: 123456

Student:
- Email: student1@example.com
- Password: 123456
```

#### Features:
- ✅ Show/hide password
- ✅ Error notification on failed login
- ✅ Auto redirect after successful login
- ✅ Links to sign up and forgot password pages

### 2. Sign Up Page (`/auth/signup`)

1. Enter personal information: Name, Email, Password
2. Select role: Student or Teacher
3. Click **"Sign Up"**
4. System automatically redirects to sign in page

### 3. Forgot Password (`/auth/forgot-password`)

1. Enter registered email
2. Click **"Send reset link"**
3. Check email and follow instructions

---

## Dashboard

### Access: `/` (Home page after login)

### Dashboard Interface

#### 1. **Welcome Banner**
- Display user name
- Personalized message by role
- Overview statistics:
  - Number of classes (joined/teaching)
  - Number of assignments
  - Number of files

#### 2. **Quick Actions**

| Action | Description | Target |
|--------|-------------|--------|
| **Classes** | Access class list | All |
| **Assignments** | View and manage assignments | All |
| **Files** | Learning materials repository | All |
| **Create Class** | Create new class | Teachers only |

#### 3. **Your Classes**
- Display 3 most recent classes
- Information per class:
  - Class name
  - Instructor
  - Schedule
  - Number of students
- **"Join Class"** button: Enter online classroom

#### 4. **Featured Assignments**
- Display 3 recent assignments
- Information:
  - Assignment title
  - Class name
  - Due date
  - Maximum score
- **"Details"** button: View assignment details

#### 5. **Right Sidebar**

**Recent Activities:**
- New messages
- New files
- New assignments

**Recently Shared Files:**
- 5 most recent files
- **"View"** button: Open file

**Quick Links:**
- Help Center
- Account Settings
- Send Feedback

---

## Class Management

### 1. Class List (`/classes`)

#### Main Interface:

**Header:**
- Title: "My Classes"
- Description by role:
  - Teacher: "Classes you are teaching"
  - Student: "Classes you are enrolled in"

**Search and Filter Bar:**
- 🔍 Class search box
- 🔽 Filter button

**Class List (Grid):**

Each class card displays:
- **Gradient banner** with class name and instructor
- **Status badge**:
  - "Active" (blue)
  - "Enrolling" (gray)
- **Detailed information**:
  - Class description
  - 📅 Schedule
  - 👥 Students / Maximum capacity
  - 🕐 Created date
- **Action buttons**:
  - **"Join"** (blue): Enter online classroom
  - **"Details"**: View class details

#### Empty State:
- Displayed when no classes exist
- **"Create Class"** button (Teachers/Admins only)

### 2. Class Details (`/classes/[id]`)

#### Information Displayed:
- Class name
- Detailed description
- Instructor in charge
- Schedule
- Student list
- Class assignments
- Class files
- Session history

#### Features (Teachers):
- ✏️ Edit class information
- 👥 Manage students
- 📝 Create new assignments
- 📁 Upload files
- 📊 View class reports

### 3. Create Class (`/classes/create`)

**Teachers and Admins only**

#### Steps to Create:

1. **Basic Information:**
   - Class name (required)
   - Class description
   - Schedule (e.g., "Mon, Wed, Fri - 19:00-21:00")

2. **Configuration:**
   - Maximum students (default: 20)
   - Room code (optional)
   - Zalo Group ID (optional)

3. **Click "Create Class"**

#### After Creation:
- Redirect to class details page
- Can add students
- Can create assignments and upload files

---

## Online Classroom

### Access: `/classroom/[id]`

### Classroom Interface

#### 1. **Header**
- Room name: "Online Classroom - Room [ID]"
- **"LIVE"** badge (red, blinking)
- Number of participants

#### 2. **Video Area (Left)**

**Video Grid:**
- Display videos of all participants
- Your video (labeled "You")
- Others' videos
- Status indicators:
  - 🎤 Mic on/off
  - 📹 Camera on/off
  - 🖥️ Screen sharing

**Control Bar:**

| Button | Function | Icon |
|--------|----------|------|
| **Mic** | Toggle microphone | 🎤 |
| **Camera** | Toggle camera | 📹 |
| **Share Screen** | Share screen | 🖥️ |
| **Record** | Record screen | ⏺️ |
| **Fullscreen** | Full screen mode | ⛶ |
| **Sidebar** | Open/close sidebar | 📋 |
| **Leave** | Leave room | 📞 (red) |

#### 3. **Sidebar (Right)**

**4 Main Tabs:**

##### Tab 1: **Chat** 💬
- Display real-time messages
- Each message includes:
  - Sender avatar
  - Sender name
  - "Teacher" badge (if teacher)
  - Send time
  - Message content
- Message input box at bottom
- **"Send"** button

**How to Send Message:**
1. Type content in chat box
2. Press **Enter** or **"Send"** button
3. Message displays immediately

##### Tab 2: **Participants** 👥
- List of participants
- Information per person:
  - Avatar
  - Name
  - Role (Teacher/Student)
  - Connection status (green dot)
  - "(You)" label for yourself

##### Tab 3: **Files** 📁
- List of class files
- Each file has download link
- Shows "No files yet" if empty

##### Tab 4: **Whiteboard** 🎨
- Click to open fullscreen whiteboard
- Use Excalidraw for drawing
- Can share whiteboard via Share Screen

### Whiteboard Feature

**When Opening Whiteboard:**
1. Whiteboard opens in fullscreen
2. Excalidraw drawing tools:
   - ✏️ Pen
   - 📐 Shapes (rectangle, circle, arrow)
   - 📝 Text
   - 🎨 Colors
   - ↩️ Undo/Redo
3. **"Exit Whiteboard"** button to close

**Share Whiteboard:**
1. Open Whiteboard
2. Click **"Share Screen"** in Control Bar
3. Select Whiteboard window
4. Students will see your whiteboard

### Screen Recording

**How to Record Screen:**
1. Click **Record** button (⏺️)
2. Select screen/window to record
3. Button turns red when recording
4. Click again to stop recording
5. Video file auto-downloads (.webm)

**Notes:**
- Only records the screen you share
- File saved as: `class-[ID]-[timestamp].webm`

### Leave Classroom

1. Click **"Leave"** button (red)
2. Auto disconnect
3. Redirect to class list page

---

## Assignment Management

### 1. Assignment List (`/assignments`)

#### Overview Statistics (4 Cards)

| Card | Meaning | Icon |
|------|---------|------|
| **Total Assignments** | Total number | 📄 |
| **Pending** | Not submitted | ⏰ |
| **Completed** | Submitted | ✅ |
| **Overdue** | Past deadline | ⚠️ |

#### Category Tabs

**Students have 4 tabs:**
1. **All**: All assignments
2. **Pending**: Not submitted, not overdue
3. **Completed**: Already submitted
4. **Overdue**: Not submitted and past deadline

**Teachers have 1 tab:**
- **All**: All assigned assignments

#### Assignment Card

Each card displays:
- **Assignment title** (link to details)
- **Class name**
- **Status badge**:
  - 🔵 "Assigned" (Teacher)
  - 🟢 "Graded" (Student - has score)
  - 🟡 "Submitted" (Student - not graded)
  - ⚪ "Not Submitted" (Student)
  - 🔴 "Overdue" (Student)
- **Score badge**: Maximum score (e.g., "100 points")
- **Assignment description**
- **Time information**:
  - 📅 Due date
  - ✅ Submission time (if submitted)

**Action Buttons:**

**Students:**
- **"Submit"** (blue): If not submitted
- **"Submit Late"** (red): If overdue
- **"View Submission"**: If already submitted

**Teachers:**
- **"Edit"**: Edit assignment

### 2. Assignment Details (`/assignments/[id]`)

#### Information Displayed:
- Assignment title
- Detailed description
- Class
- Due date
- Maximum score
- Attached files (if any)

#### Student Features:
- View assignment requirements
- Submit assignment (if not submitted)
- View submitted work
- View score and feedback (if graded)

#### Teacher Features:
- View submission list
- Grade each submission
- Write feedback
- Statistics on submitted/not submitted

### 3. Submit Assignment (`/assignments/[id]/submit`)

**Students only**

#### Steps to Submit:

1. **Enter Content:**
   - Write answer in text box
   - Or upload file

2. **Upload File (optional):**
   - Click **"Choose file"** button
   - Select file from computer
   - Supports: PDF, Word, Excel, images, etc.

3. **Review:**
   - Check content
   - Check attached files

4. **Submit:**
   - Click **"Submit"** button
   - Confirm submission
   - Cannot edit after submission

#### Notifications:
- ✅ "Submission successful"
- ⚠️ "Late submission" (if overdue)

### 4. View Submission (`/assignments/[id]/view`)

**Students view:**
- Submitted content
- Uploaded files
- Submission time
- Score (if graded)
- Teacher's feedback

### 5. Edit Assignment (`/assignments/[id]/edit`)

**Teachers only**

#### Editable Fields:
- Title
- Description
- Due date
- Maximum score
- Attached files
- Visibility status

#### Save Changes:
- Click **"Save"**
- Success notification
- Students see changes immediately

---

## File Management

### Access: `/files`

### File Interface

#### 1. **Header**
- Title: "Learning Materials"
- Description: "Manage and access files from classes"

#### 2. **Search and Filter Bar**
- 🔍 File search box
- 🔽 Filter button

#### 3. **Statistics (4 Cards)**

| Card | Meaning | Icon |
|------|---------|------|
| **Total Files** | Number of files | 📄 |
| **Downloads** | Total downloads | ⬇️ |
| **Videos** | Number of videos | 🎥 |
| **Storage** | Total storage | 📁 |

#### 4. **Category Tabs**

| Tab | Content |
|-----|---------|
| **All** | All files |
| **Lectures** | Slides, lecture materials |
| **Assignments** | Assignment files |
| **Videos** | Lecture videos |
| **Audio** | Audio files |

#### 5. **File Grid**

Each file card displays:
- **Icon by file type**:
  - 🎥 Video (purple)
  - 🎵 Audio (green)
  - 🖼️ Image (pink)
  - 📄 PDF (red)
  - 📝 Word (orange)
  - 📦 Archive (blue)
  - 📄 Other (gray)
- **File name**
- **Class** • **Uploader**
- **Size** • **Upload date**
- **Category badge**: Lecture, Assignment, Video, Audio, Reference
- **Download count**

**Action Buttons:**
- **"Download"** (blue): Download file
- **👁️ "View"**: Open file in new tab
- **🔗 "Share"**: Copy share link

### Upload Files

**Teachers and Admins only**

#### Steps to Upload:

1. **Click "Upload" button** (if available)
2. **Select class** (dropdown)
3. **Select category**:
   - Lecture
   - Assignment
   - Video
   - Audio
   - Reference
4. **Choose file** from computer
5. **Click "Upload"**

#### After Upload:
- File appears in list
- Students can download immediately

---

## Roles and Permissions

### 1. Student

#### Permissions:
- ✅ View enrolled class list
- ✅ Join online classroom
- ✅ Chat in class
- ✅ View assignments
- ✅ Submit assignments
- ✅ View scores and feedback
- ✅ Download files
- ❌ Cannot create classes
- ❌ Cannot create assignments
- ❌ Cannot upload files
- ❌ Cannot grade assignments

#### Accessible Pages:
- `/` - Dashboard
- `/classes` - Class list
- `/classes/[id]` - Class details
- `/classroom/[id]` - Online classroom
- `/assignments` - Assignment list
- `/assignments/[id]` - Assignment details
- `/assignments/[id]/submit` - Submit assignment
- `/assignments/[id]/view` - View submission
- `/files` - Files

### 2. Teacher

#### Permissions:
- ✅ All student permissions
- ✅ Create new classes
- ✅ Manage classes
- ✅ Create assignments
- ✅ Grade assignments
- ✅ Upload files
- ✅ View class reports
- ✅ Manage students in class

#### Additional Pages:
- `/classes/create` - Create class
- `/assignments/[id]/edit` - Edit assignment
- `/assignments/[id]/grade` - Grade assignment

### 3. Admin

#### Permissions:
- ✅ All teacher permissions
- ✅ Manage all classes
- ✅ Manage users
- ✅ View all reports
- ✅ System configuration

---

## Usage Notes

### 1. System Requirements

**Browser:**
- Chrome (recommended)
- Firefox
- Edge
- Safari (may have video limitations)

**Internet Connection:**
- Minimum: 2 Mbps
- Recommended: 5 Mbps or higher (for HD video)

**Devices:**
- Computer: Windows, macOS, Linux
- Tablet: iPad, Android
- Phone: iOS, Android (limited features)

### 2. Camera and Mic Permissions

**First time joining classroom:**
1. Browser will ask for camera and mic permissions
2. Click **"Allow"**
3. If denied, can re-enable in browser settings

**How to Re-enable Permissions:**
- Chrome: Click 🔒 icon left of URL → Site settings
- Firefox: Click 🔒 icon → Permissions → Camera/Microphone

### 3. Troubleshooting

#### Cannot Connect to Classroom:
1. Check Internet connection
2. Reload page (F5)
3. Clear browser cache
4. Try different browser

#### Cannot See Others' Video:
1. Check Internet connection
2. Ask them to enable camera
3. Reload page

#### Cannot Send Messages:
1. Check Internet connection
2. Reload page
3. Re-login

#### Cannot Download Files:
1. Check Internet connection
2. Try again after few seconds
3. Contact teacher if still failing

### 4. Usage Tips

**Optimize Video:**
- Turn off camera when not needed to save bandwidth
- Use headphones to avoid echo
- Ensure good lighting when camera is on

**Manage Assignments:**
- Set reminders for deadlines
- Submit early to avoid being late
- Review carefully before submitting

**Organize Files:**
- Use clear file names
- Categorize properly
- Download and store locally

---

## Support and Contact

### Help Center
- Access: `/help` (if available)
- Find Frequently Asked Questions (FAQ)
- Video tutorials

### Send Feedback
- Access: `/feedback` (if available)
- Report bugs
- Suggest new features

### Contact Administrator
- Email: admin@example.com
- Zalo: [Phone number]

---

## Updates and Version

**Current Version:** 1.0.0

**Features in Development:**
- 📊 Analytics Dashboard (Detailed reports)
- 🔔 Zalo Notifications
- 📅 Automatic Scheduling
- 🎯 Auto-grading Assignments

---

**© 2024 Online Learning Platform. All rights reserved.**
