import api from './client'
import type {
  ApiResponse, AuthUser, Student, Teacher, SchoolClass,
  AcademicYear, TeacherClassAssignment, Notice, DashboardStats,
  AttendanceRecord, AttendanceStatus,
  Subject, ExamType, ExamResult
} from '../types/index.ts'

// ── Auth ──────────────────────────────────────────────────────────────────

export const login = (username: string, password: string) =>
  api.post<ApiResponse<AuthUser>>('/auth/login', { username, password })
    .then(r => r.data.data)

// ── Admin: Academic ───────────────────────────────────────────────────────

export const getClasses = () =>
  api.get<ApiResponse<SchoolClass[]>>('/admin/classes').then(r => r.data.data)

export const createClass = (name: string, sortOrder: number) =>
  api.post<ApiResponse<SchoolClass>>('/admin/classes', { name, sortOrder }).then(r => r.data.data)

export const deleteClass = (id: number) =>
  api.delete(`/admin/classes/${id}`)

export const getSections = (classId: number) =>
  api.get<ApiResponse<Section[]>>(`/admin/sections?classId=${classId}`).then(r => r.data.data)

export const getAcademicYears = () =>
  api.get<ApiResponse<AcademicYear[]>>('/admin/academic-years').then(r => r.data.data)

export const createAcademicYear = (data: { label: string; startDate: string; endDate: string; isCurrent: boolean }) =>
  api.post<ApiResponse<AcademicYear>>('/admin/academic-years', data).then(r => r.data.data)

// ── Admin: Students ───────────────────────────────────────────────────────

export const getStudents = (classId?: number) =>
  api.get<ApiResponse<Student[]>>('/admin/students', { params: classId ? { classId } : {} })
    .then(r => r.data.data)

export const getStudent = (id: number) =>
  api.get<ApiResponse<Student>>(`/admin/students/${id}`).then(r => r.data.data)

export const createStudent = (data: Record<string, unknown>) =>
  api.post<ApiResponse<{ student: Student; username: string; password: string }>>('/admin/students', data)
    .then(r => r.data.data)

export const updateStudent = (id: number, data: Record<string, unknown>) =>
  api.put<ApiResponse<Student>>(`/admin/students/${id}`, data).then(r => r.data.data)

export const deactivateStudent = (id: number) =>
  api.delete(`/admin/students/${id}`)

export const resetStudentPassword = (id: number) =>
  api.post<ApiResponse<{ username: string; plainPassword: string }>>(`/admin/students/${id}/reset-password`)
    .then(r => r.data.data)

// ── Admin: Teachers ───────────────────────────────────────────────────────

export const getTeachers = () =>
  api.get<ApiResponse<Teacher[]>>('/admin/teachers').then(r => r.data.data)

export const getTeacher = (id: number) =>
  api.get<ApiResponse<Teacher>>(`/admin/teachers/${id}`).then(r => r.data.data)

export const createTeacher = (data: Record<string, unknown>) =>
  api.post<ApiResponse<{ teacher: Teacher; username: string; plainPassword: string }>>('/admin/teachers', data)
    .then(r => r.data.data)

export const resetTeacherPassword = (id: number) =>
  api.post<ApiResponse<{ username: string; plainPassword: string }>>(`/admin/teachers/${id}/reset-password`)
    .then(r => r.data.data)

export const assignTeacherToClass = (id: number, data: Record<string, unknown>) =>
  api.post<ApiResponse<TeacherClassAssignment>>(`/admin/teachers/${id}/assign-class`, data)
    .then(r => r.data.data)

// ── Admin: Dashboard ──────────────────────────────────────────────────────

export const getDashboardStats = () =>
  api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats').then(r => r.data.data)

export const getStudentsForClass = (classId: number) =>
  api.get<ApiResponse<Student[]>>('/teacher/students', { params: { classId } })
    .then(r => r.data.data)

// ── Teacher ───────────────────────────────────────────────────────────────

export const getMyTeacherProfile = () =>
  api.get<ApiResponse<Teacher>>('/teacher/me').then(r => r.data.data)

export const getMyStudents = () =>
  api.get<ApiResponse<Student[]>>('/teacher/my-students').then(r => r.data.data)

export const getMyAssignments = () =>
  api.get<ApiResponse<TeacherClassAssignment[]>>('/teacher/my-assignments').then(r => r.data.data)

// ── Student ───────────────────────────────────────────────────────────────

export const getMyStudentProfile = () =>
  api.get<ApiResponse<Student>>('/student/me').then(r => r.data.data)

// ── Attendance ────────────────────────────────────────────────────────────

export const markAttendance = (data: {
  classId: number
  date: string
  records: { studentId: number; status: AttendanceStatus }[]
}) =>
  api.post<ApiResponse<AttendanceRecord[]>>('/teacher/attendance/batch', data)
    .then(r => r.data.data)

export const getAttendanceForClass = (classId: number, date: string) =>
  api.get<ApiResponse<AttendanceRecord[]>>('/teacher/attendance', { params: { classId, date } })
    .then(r => r.data.data)

export const getAttendanceReport = (classId: number, year: number, month: number) =>
  api.get<ApiResponse<AttendanceRecord[]>>('/admin/attendance/report', { params: { classId, year, month } })
    .then(r => r.data.data)

export const getStudentAttendance = (studentId: number, year: number, month: number) =>
  api.get<ApiResponse<AttendanceRecord[]>>(`/admin/attendance/student/${studentId}`, { params: { year, month } })
    .then(r => r.data.data)

// ── Subjects ──────────────────────────────────────────────────────────────

export const getSubjects = (classId: number) =>
  api.get<ApiResponse<Subject[]>>('/admin/subjects', { params: { classId } }).then(r => r.data.data)

export const getSubjectsTeacher = (classId: number) =>
  api.get<ApiResponse<Subject[]>>('/teacher/subjects', { params: { classId } }).then(r => r.data.data)

export const createSubject = (data: { classId: number; name: string; maxMarks: number }) =>
  api.post<ApiResponse<Subject>>('/admin/subjects', data).then(r => r.data.data)

export const deleteSubject = (id: number) =>
  api.delete(`/admin/subjects/${id}`)

// ── Results ───────────────────────────────────────────────────────────────

export const getResults = (classId: number, examType: ExamType) =>
  api.get<ApiResponse<ExamResult[]>>('/admin/results', { params: { classId, examType } })
    .then(r => r.data.data)

export const saveResultsAdmin = (data: {
  classId: number; examType: ExamType
  results: { studentId: number; subjectId: number; marksObtained: number }[]
}) =>
  api.post<ApiResponse<number>>('/admin/results/batch', data).then(r => r.data.data)

export const getResultsTeacher = (classId: number, examType: ExamType) =>
  api.get<ApiResponse<ExamResult[]>>('/teacher/results', { params: { classId, examType } })
    .then(r => r.data.data)

export const saveResultsTeacher = (data: {
  classId: number; examType: ExamType
  results: { studentId: number; subjectId: number; marksObtained: number }[]
}) =>
  api.post<ApiResponse<number>>('/teacher/results/batch', data).then(r => r.data.data)

export const getMyResults = () =>
  api.get<ApiResponse<ExamResult[]>>('/student/results').then(r => r.data.data)

// ── Student attendance ────────────────────────────────────────────────────

export const getMyAttendance = (year: number, month: number) =>
  api.get<ApiResponse<AttendanceRecord[]>>('/student/attendance', { params: { year, month } })
    .then(r => r.data.data)

// ── Public ────────────────────────────────────────────────────────────────

export const getPublicNotices = () =>
  api.get<ApiResponse<Notice[]>>('/public/notices').then(r => r.data.data)

export const createNotice = (data: { title: string; content: string; category: string }) =>
  api.post<ApiResponse<Notice>>('/public/notices', data).then(r => r.data.data)
