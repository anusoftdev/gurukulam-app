package com.gurukulam.school.teacher;

import com.gurukulam.school.academic.AcademicYear;
import com.gurukulam.school.academic.AcademicYearRepository;
import com.gurukulam.school.common.ApiResponse;
import com.gurukulam.school.student.Student;
import com.gurukulam.school.student.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
public class TeacherController {

    private final TeacherRepository teacherRepo;
    private final TeacherClassAssignmentRepository assignmentRepo;
    private final StudentRepository studentRepo;
    private final AcademicYearRepository yearRepo;

    public TeacherController(TeacherRepository teacherRepo,
                              TeacherClassAssignmentRepository assignmentRepo,
                              StudentRepository studentRepo,
                              AcademicYearRepository yearRepo) {
        this.teacherRepo = teacherRepo;
        this.assignmentRepo = assignmentRepo;
        this.studentRepo = studentRepo;
        this.yearRepo = yearRepo;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Teacher>> myProfile(
            @AuthenticationPrincipal UserDetails principal) {
        Teacher teacher = resolveTeacher(principal);
        return ResponseEntity.ok(ApiResponse.success(teacher));
    }

    @GetMapping("/my-assignments")
    public ResponseEntity<ApiResponse<List<TeacherClassAssignment>>> myAssignments(
            @AuthenticationPrincipal UserDetails principal) {
        Teacher teacher = resolveTeacher(principal);
        AcademicYear year = currentYear();
        List<TeacherClassAssignment> assignments =
                assignmentRepo.findByTeacherIdAndAcademicYearId(teacher.getId(), year.getId());
        return ResponseEntity.ok(ApiResponse.success(assignments));
    }

    @GetMapping("/my-students")
    public ResponseEntity<ApiResponse<List<Student>>> myStudents(
            @AuthenticationPrincipal UserDetails principal) {
        Teacher teacher = resolveTeacher(principal);
        AcademicYear year = currentYear();
        List<TeacherClassAssignment> assignments =
                assignmentRepo.findByTeacherIdAndAcademicYearId(teacher.getId(), year.getId());

        List<Student> students = new ArrayList<>();
        for (TeacherClassAssignment a : assignments) {
            students.addAll(
                    studentRepo.findBySchoolClassIdAndAcademicYearId(a.getSchoolClass().getId(), year.getId())
            );
        }
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<Student>>> studentsForClass(
            @RequestParam Long classId) {
        AcademicYear year = currentYear();
        return ResponseEntity.ok(ApiResponse.success(
                studentRepo.findBySchoolClassIdAndAcademicYearId(classId, year.getId())));
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private Teacher resolveTeacher(UserDetails principal) {
        return teacherRepo.findByUserUsername(principal.getUsername())
                .orElseThrow(() -> new NoSuchElementException("Teacher profile not found"));
    }

    private AcademicYear currentYear() {
        return yearRepo.findByIsCurrent(true)
                .orElseThrow(() -> new NoSuchElementException("No current academic year"));
    }
}
