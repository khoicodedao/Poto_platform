export interface AuthUser {
    id: number;
    email: string;
    name: string;
    role: "student" | "teacher" | "teaching_assistant" | "admin";
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
    session_id?: string;
}
