// ── Auth ──────────────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'

export interface AuthUser {
  userId: number
  username: string
  role: Role
  email?: string
  token: string
}

// ── Academic ─────────────────────────────────────────────────────────────

export interface AcademicYear {
  id: number
  label: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

export interface SchoolClass {
  id: number
  name: string
  sortOrder: number
}

export interface Section {
  id: number
  name: string
  schoolClass: SchoolClass
}

// ── Student ───────────────────────────────────────────────────────────────

export interface Student {
  id: number
  admissionNo: string
  firstName: string
  lastName: string
  dob: string
  gender: string
  photoUrl?: string
  schoolClass: SchoolClass
  section?: Section
  academicYear: AcademicYear
  parentName?: string
  parentPhone?: string
  address?: string
  admissionDate: string
  user: { id: number; username: string; active: boolean }
}

// ── Teacher ───────────────────────────────────────────────────────────────

export interface Teacher {
  id: number
  firstName: string
  lastName: string
  photoUrl?: string
  phone?: string
  qualification?: string
  joiningDate?: string
  employeeId?: string
  user: { id: number; username: string; active: boolean }
}

export interface TeacherClassAssignment {
  id: number
  teacher: Teacher
  schoolClass: SchoolClass
  section?: Section
  academicYear: AcademicYear
  subject: string
}

// ── Attendance ────────────────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE'

export interface AttendanceRecord {
  id: number
  student: Student
  date: string
  status: AttendanceStatus
  markedBy?: Teacher
  academicYear: AcademicYear
}

// ── Notice ────────────────────────────────────────────────────────────────

export interface Notice {
  id: number
  title: string
  content: string
  category: string
  createdAt: string
}

// ── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  currentYear: string
}

// ── API Response wrapper ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}
