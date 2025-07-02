// Mock data for the application
export interface User {
  id: number
  email: string
  name: string
  role: "teacher" | "student" | "admin"
  avatar: string | null
  created_at: string
  updated_at: string
}

export interface Class {
  id: number
  title: string
  description: string | null
  teacher_id: number
  teacher_name: string
  schedule: string | null
  max_students: number
  status: "active" | "recruiting" | "completed" | "cancelled"
  student_count: number
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: number
  title: string
  description: string | null
  class_id: number
  class_title: string
  teacher_id: number
  teacher_name: string
  due_date: string
  points: number
  status: "draft" | "published" | "closed"
  created_at: string
  updated_at: string
  submitted?: boolean
  grade?: number | null
  submission_date?: string | null
}

export interface FileRecord {
  id: number
  name: string
  original_name: string
  file_path: string
  file_size: number
  file_type: string
  class_id: number | null
  class_title: string | null
  uploaded_by: number
  uploader_name: string
  category: "lecture" | "assignment" | "video" | "audio" | "reference" | "resource"
  downloads: number
  created_at: string
}

export interface ChatMessage {
  id: number
  class_id: number
  user_id: number
  user_name: string
  user_role: string
  message: string
  message_type: "text" | "file" | "system"
  created_at: string
}

// Mock users data
export const mockUsers: User[] = [
  {
    id: 1,
    email: "teacher1@example.com",
    name: "Cô Lan",
    role: "teacher",
    avatar: "/placeholder.svg?height=64&width=64",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    email: "teacher2@example.com",
    name: "Thầy Nam",
    role: "teacher",
    avatar: "/placeholder.svg?height=64&width=64",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    email: "teacher3@example.com",
    name: "Cô Hoa",
    role: "teacher",
    avatar: "/placeholder.svg?height=64&width=64",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    email: "teacher4@example.com",
    name: "Thầy Minh",
    role: "teacher",
    avatar: "/placeholder.svg?height=64&width=64",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    email: "student1@example.com",
    name: "Minh",
    role: "student",
    avatar: "/placeholder.svg?height=64&width=64",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    email: "student2@example.com",
    name: "Hoa",
    role: "student",
    avatar: "/placeholder.svg?height=64&width=64",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 7,
    email: "student3@example.com",
    name: "Nam",
    role: "student",
    avatar: "/placeholder.svg?height=64&width=64",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 8,
    email: "student4@example.com",
    name: "Linh",
    role: "student",
    avatar: "/placeholder.svg?height=64&width=64",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 9,
    email: "student5@example.com",
    name: "Duc",
    role: "student",
    avatar: "/placeholder.svg?height=64&width=64",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 10,
    email: "admin@example.com",
    name: "Admin",
    role: "admin",
    avatar: "/placeholder.svg?height=64&width=64",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock classes data
export const mockClasses: Class[] = [
  {
    id: 1,
    title: "Toán học cơ bản",
    description: "Học các khái niệm cơ bản về đại số và hình học",
    teacher_id: 1,
    teacher_name: "Cô Lan",
    schedule: "Thứ 2, 4, 6 - 14:00-15:30",
    max_students: 15,
    status: "active",
    student_count: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Tiếng Anh giao tiếp",
    description: "Phát triển kỹ năng giao tiếp tiếng Anh hàng ngày",
    teacher_id: 2,
    teacher_name: "Thầy Nam",
    schedule: "Thứ 3, 5, 7 - 16:00-17:00",
    max_students: 10,
    status: "active",
    student_count: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Vật lý 12",
    description: "Ôn tập và luyện thi đại học môn Vật lý",
    teacher_id: 3,
    teacher_name: "Cô Hoa",
    schedule: "Thứ 2, 4, 6 - 19:00-20:30",
    max_students: 20,
    status: "active",
    student_count: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Hóa học hữu cơ",
    description: "Tìm hiểu về các hợp chất hữu cơ và phản ứng",
    teacher_id: 4,
    teacher_name: "Thầy Minh",
    schedule: "Thứ 3, 5 - 20:00-21:30",
    max_students: 12,
    status: "recruiting",
    student_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock assignments data
export const mockAssignments: Assignment[] = [
  {
    id: 1,
    title: "Bài tập về phương trình bậc 2",
    description: "Giải các bài tập từ 1 đến 10 trong sách giáo khoa",
    class_id: 1,
    class_title: "Toán học cơ bản",
    teacher_id: 1,
    teacher_name: "Cô Lan",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    points: 10,
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    submitted: false,
  },
  {
    id: 2,
    title: "Thuyết trình về văn hóa Anh",
    description: "Chuẩn bị bài thuyết trình 5-7 phút về một khía cạnh văn hóa Anh",
    class_id: 2,
    class_title: "Tiếng Anh giao tiếp",
    teacher_id: 2,
    teacher_name: "Thầy Nam",
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    points: 15,
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    submitted: false,
  },
  {
    id: 3,
    title: "Bài kiểm tra Động học",
    description: "Kiểm tra 45 phút về chương Động học",
    class_id: 3,
    class_title: "Vật lý 12",
    teacher_id: 3,
    teacher_name: "Cô Hoa",
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    points: 20,
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    submitted: true,
    grade: 18,
    submission_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock files data
export const mockFiles: FileRecord[] = [
  {
    id: 1,
    name: "bai-giang-phuong-trinh-bac-2.pdf",
    original_name: "Bài giảng - Phương trình bậc 2.pdf",
    file_path: "/uploads/bai-giang-phuong-trinh-bac-2.pdf",
    file_size: 2621440,
    file_type: "pdf",
    class_id: 1,
    class_title: "Toán học cơ bản",
    uploaded_by: 1,
    uploader_name: "Cô Lan",
    category: "lecture",
    downloads: 15,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "bai-tap-thuc-hanh.docx",
    original_name: "Bài tập thực hành.docx",
    file_path: "/uploads/bai-tap-thuc-hanh.docx",
    file_size: 1258291,
    file_type: "doc",
    class_id: 1,
    class_title: "Toán học cơ bản",
    uploaded_by: 1,
    uploader_name: "Cô Lan",
    category: "assignment",
    downloads: 12,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "video-huong-dan.mp4",
    original_name: "Video hướng dẫn giải bài.mp4",
    file_path: "/uploads/video-huong-dan.mp4",
    file_size: 16777216,
    file_type: "video",
    class_id: 1,
    class_title: "Toán học cơ bản",
    uploaded_by: 1,
    uploader_name: "Cô Lan",
    category: "video",
    downloads: 8,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "english-grammar-rules.pdf",
    original_name: "English Grammar Rules.pdf",
    file_path: "/uploads/english-grammar-rules.pdf",
    file_size: 3252224,
    file_type: "pdf",
    class_id: 2,
    class_title: "Tiếng Anh giao tiếp",
    uploaded_by: 2,
    uploader_name: "Thầy Nam",
    category: "reference",
    downloads: 20,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "listening-practice.mp3",
    original_name: "Listening Practice Audio.mp3",
    file_path: "/uploads/listening-practice.mp3",
    file_size: 8912896,
    file_type: "audio",
    class_id: 2,
    class_title: "Tiếng Anh giao tiếp",
    uploaded_by: 2,
    uploader_name: "Thầy Nam",
    category: "audio",
    downloads: 18,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: "cong-thuc-vat-ly.pdf",
    original_name: "Công thức Vật lý 12.pdf",
    file_path: "/uploads/cong-thuc-vat-ly.pdf",
    file_size: 4404019,
    file_type: "pdf",
    class_id: 3,
    class_title: "Vật lý 12",
    uploaded_by: 3,
    uploader_name: "Cô Hoa",
    category: "reference",
    downloads: 25,
    created_at: new Date().toISOString(),
  },
]

// Mock chat messages data
export const mockChatMessages: ChatMessage[] = [
  {
    id: 1,
    class_id: 1,
    user_id: 1,
    user_name: "Cô Lan",
    user_role: "teacher",
    message: "Chào các em! Hôm nay chúng ta sẽ học về phương trình bậc 2",
    message_type: "text",
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    class_id: 1,
    user_id: 5,
    user_name: "Minh",
    user_role: "student",
    message: "Chào cô ạ!",
    message_type: "text",
    created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    class_id: 1,
    user_id: 6,
    user_name: "Hoa",
    user_role: "student",
    message: "Em đã chuẩn bị bài rồi ạ",
    message_type: "text",
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    class_id: 2,
    user_id: 2,
    user_name: "Thầy Nam",
    user_role: "teacher",
    message: "Good morning everyone! Today we will practice conversation",
    message_type: "text",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    class_id: 2,
    user_id: 7,
    user_name: "Nam",
    user_role: "student",
    message: "Good morning teacher!",
    message_type: "text",
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
]

// Helper function to simulate API delay
export const simulateApiDelay = (ms = 500) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
