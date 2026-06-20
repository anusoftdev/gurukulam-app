package com.gurukulam.school.attendance;

import com.gurukulam.school.common.ApiResponse;
import com.gurukulam.school.teacher.Teacher;
import com.gurukulam.school.teacher.TeacherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final TeacherRepository teacherRepo;

    public AttendanceController(AttendanceService attendanceService,
                                TeacherRepository teacherRepo) {
        this.attendanceService = attendanceService;
        this.teacherRepo = teacherRepo;
    }

    // ── Teacher: mark attendance for a class on a date ────────────────────

    @PostMapping("/teacher/attendance/batch")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> markAttendance(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails principal) {

        Long classId = Long.valueOf(body.get("classId").toString());
        LocalDate date = LocalDate.parse(body.get("date").toString());

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rawRecords = (List<Map<String, Object>>) body.get("records");
        List<AttendanceService.AttendanceRecord> records = rawRecords.stream()
                .map(r -> new AttendanceService.AttendanceRecord(
                        Long.valueOf(r.get("studentId").toString()),
                        AttendanceStatus.valueOf(r.get("status").toString())))
                .toList();

        Teacher teacher = resolveTeacherOrNull(principal);
        List<Attendance> saved = attendanceService.markAttendance(classId, date, records, teacher);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked", saved));
    }

    // ── Teacher: get existing attendance for a class on a date ────────────

    @GetMapping("/teacher/attendance")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getAttendanceForClass(
            @RequestParam Long classId,
            @RequestParam String date) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.getAttendanceForClass(classId, LocalDate.parse(date))));
    }

    // ── Admin: monthly class report ───────────────────────────────────────

    @GetMapping("/admin/attendance/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> monthlyReport(
            @RequestParam Long classId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.getMonthlyReport(classId, year, month)));
    }

    // ── Admin: single student monthly attendance ──────────────────────────

    @GetMapping("/admin/attendance/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> studentMonthly(
            @PathVariable Long studentId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.getStudentMonthlyAttendance(studentId, year, month)));
    }

    // ── helper ────────────────────────────────────────────────────────────

    private Teacher resolveTeacherOrNull(UserDetails principal) {
        return teacherRepo.findAll().stream()
                .filter(t -> t.getUser().getUsername().equals(principal.getUsername()))
                .findFirst()
                .orElse(null); // admin can also mark; teacher field is nullable
    }
}
