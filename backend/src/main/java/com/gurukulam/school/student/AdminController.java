package com.gurukulam.school.student;

import com.gurukulam.school.academic.*;
import com.gurukulam.school.common.ApiResponse;
import com.gurukulam.school.teacher.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final SchoolClassRepository classRepo;
    private final AcademicYearRepository yearRepo;

    public AdminController(AdminService adminService,
                           SchoolClassRepository classRepo,
                           AcademicYearRepository yearRepo) {
        this.adminService = adminService;
        this.classRepo = classRepo;
        this.yearRepo = yearRepo;
    }

    // ── Academic Years ───────────────────────────────────────────────────

    @GetMapping("/academic-years")
    public ResponseEntity<ApiResponse<List<AcademicYear>>> listYears() {
        return ResponseEntity.ok(ApiResponse.success(yearRepo.findAll()));
    }

    @PostMapping("/academic-years")
    public ResponseEntity<ApiResponse<AcademicYear>> createYear(@RequestBody Map<String, Object> body) {
        String label = (String) body.get("label");
        LocalDate start = LocalDate.parse((String) body.get("startDate"));
        LocalDate end = LocalDate.parse((String) body.get("endDate"));
        boolean current = Boolean.TRUE.equals(body.get("isCurrent"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Academic year created",
                        adminService.createAcademicYear(label, start, end, current)));
    }

    // ── Classes ──────────────────────────────────────────────────────────

    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<SchoolClass>>> listClasses() {
        return ResponseEntity.ok(ApiResponse.success(adminService.allClasses()));
    }

    @PostMapping("/classes")
    public ResponseEntity<ApiResponse<SchoolClass>> createClass(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        int sortOrder = (Integer) body.get("sortOrder");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Class created", adminService.createClass(name, sortOrder)));
    }

    // ── Students ─────────────────────────────────────────────────────────

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<Student>>> listStudents(
            @RequestParam(required = false) Long classId) {
        List<Student> students = classId != null
                ? adminService.studentsInClass(classId)
                : adminService.allStudents();
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<ApiResponse<Student>> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStudent(id)));
    }

    @PostMapping("/students")
    public ResponseEntity<ApiResponse<StudentCreateResponse>> createStudent(
            @RequestBody AdminService.CreateStudentRequest req) {

        Student student = adminService.createStudent(req);

        // Extract the sentinel creds we piggy-backed on photoUrl
        String sentinel = student.getPhotoUrl();
        String username = "", password = "";
        if (sentinel != null && sentinel.startsWith("__CREDS__:")) {
            String[] parts = sentinel.split(":");
            username = parts[1];
            password = parts[2];
            student.setPhotoUrl(null);   // clear sentinel
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student created",
                        new StudentCreateResponse(student, username, password)));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<ApiResponse<Student>> updateStudent(
            @PathVariable Long id,
            @RequestBody AdminService.CreateStudentRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Student updated",
                adminService.updateStudent(id, req)));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateStudent(@PathVariable Long id) {
        adminService.deactivateStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deactivated", null));
    }

    @PostMapping("/students/{id}/reset-password")
    public ResponseEntity<ApiResponse<AdminService.CredentialResult>> resetStudentPassword(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Password reset",
                adminService.resetStudentPassword(id)));
    }

    // ── Teachers ─────────────────────────────────────────────────────────

    @GetMapping("/teachers")
    public ResponseEntity<ApiResponse<List<Teacher>>> listTeachers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.allTeachers()));
    }

    @GetMapping("/teachers/{id}")
    public ResponseEntity<ApiResponse<Teacher>> getTeacher(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getTeacher(id)));
    }

    @PostMapping("/teachers")
    public ResponseEntity<ApiResponse<AdminService.CreateTeacherResult>> createTeacher(
            @RequestBody AdminService.CreateTeacherRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Teacher created", adminService.createTeacher(req)));
    }

    @PostMapping("/teachers/{id}/reset-password")
    public ResponseEntity<ApiResponse<AdminService.CredentialResult>> resetTeacherPassword(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Password reset",
                adminService.resetTeacherPassword(id)));
    }

    @PostMapping("/teachers/{id}/assign-class")
    public ResponseEntity<ApiResponse<TeacherClassAssignment>> assignClass(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long classId = Long.valueOf(body.get("classId").toString());
        Long sectionId = body.get("sectionId") != null
                ? Long.valueOf(body.get("sectionId").toString()) : null;
        String subject = (String) body.getOrDefault("subject", "General");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Assignment created",
                        adminService.assignTeacherToClass(id, classId, sectionId, subject)));
    }

    // ── Dashboard Stats ──────────────────────────────────────────────────

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboardStats() {
        List<SchoolClass> classes = adminService.allClasses();
        List<Student> students = adminService.allStudents();
        List<Teacher> teachers = adminService.allTeachers();
        AcademicYear year = adminService.currentYear();

        Map<String, Object> stats = Map.of(
                "totalStudents", students.size(),
                "totalTeachers", teachers.size(),
                "totalClasses", classes.size(),
                "currentYear", year.getLabel()
        );
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ── Inner DTO ─────────────────────────────────────────────────────────
    public record StudentCreateResponse(Student student, String username, String password) {}
}
