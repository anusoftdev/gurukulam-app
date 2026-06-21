package com.gurukulam.school.result;

import com.gurukulam.school.common.ApiResponse;
import com.gurukulam.school.student.StudentRepository;
import com.gurukulam.school.teacher.Teacher;
import com.gurukulam.school.teacher.TeacherRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api")
public class ResultController {

    private final ResultService resultService;
    private final TeacherRepository teacherRepo;
    private final StudentRepository studentRepo;

    public ResultController(ResultService resultService,
                            TeacherRepository teacherRepo,
                            StudentRepository studentRepo) {
        this.resultService = resultService;
        this.teacherRepo = teacherRepo;
        this.studentRepo = studentRepo;
    }

    // ── Admin: subjects ──────────────────────────────────────────────────

    @GetMapping("/admin/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Subject>>> listSubjects(@RequestParam Long classId) {
        return ResponseEntity.ok(ApiResponse.success(resultService.subjectsForClass(classId)));
    }

    @PostMapping("/admin/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Subject>> createSubject(@RequestBody Map<String, Object> body) {
        Long classId = Long.valueOf(body.get("classId").toString());
        String name = body.get("name").toString();
        int maxMarks = Integer.parseInt(body.getOrDefault("maxMarks", 100).toString());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subject created",
                        resultService.createSubject(classId, name, maxMarks)));
    }

    @DeleteMapping("/admin/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        resultService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted", null));
    }

    // ── Admin: results entry & view ───────────────────────────────────────

    @PostMapping("/admin/results/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Integer>> saveResultsAsAdmin(
            @RequestBody Map<String, Object> body) {
        int count = saveResultsFromBody(body, null);
        return ResponseEntity.ok(ApiResponse.success(count + " results saved", count));
    }

    @GetMapping("/admin/results")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ExamResult>>> getResults(
            @RequestParam Long classId,
            @RequestParam String examType) {
        return ResponseEntity.ok(ApiResponse.success(
                resultService.resultsForClass(classId, ExamType.valueOf(examType))));
    }

    // ── Teacher: subjects view & results entry ────────────────────────────

    @GetMapping("/teacher/subjects")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<List<Subject>>> listSubjectsTeacher(@RequestParam Long classId) {
        return ResponseEntity.ok(ApiResponse.success(resultService.subjectsForClass(classId)));
    }

    @PostMapping("/teacher/results/batch")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<Integer>> saveResultsAsTeacher(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails principal) {
        Teacher teacher = teacherRepo.findByUserUsername(principal.getUsername()).orElse(null);
        int count = saveResultsFromBody(body, teacher);
        return ResponseEntity.ok(ApiResponse.success(count + " results saved", count));
    }

    @GetMapping("/teacher/results")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<List<ExamResult>>> getResultsTeacher(
            @RequestParam Long classId,
            @RequestParam String examType) {
        return ResponseEntity.ok(ApiResponse.success(
                resultService.resultsForClass(classId, ExamType.valueOf(examType))));
    }

    // ── Student: view own results ─────────────────────────────────────────

    @GetMapping("/student/results")
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public ResponseEntity<ApiResponse<List<ExamResult>>> myResults(
            @AuthenticationPrincipal UserDetails principal) {
        var student = studentRepo.findByUserUsername(principal.getUsername())
                .orElseThrow(() -> new NoSuchElementException("Student not found"));
        return ResponseEntity.ok(ApiResponse.success(
                resultService.resultsForStudent(student.getId())));
    }

    // ── helper ────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private int saveResultsFromBody(Map<String, Object> body, Teacher teacher) {
        Long classId = Long.valueOf(body.get("classId").toString());
        ExamType examType = ExamType.valueOf(body.get("examType").toString());
        List<Map<String, Object>> raw = (List<Map<String, Object>>) body.get("results");
        List<ResultService.ResultEntry> entries = raw.stream()
                .map(r -> new ResultService.ResultEntry(
                        Long.valueOf(r.get("studentId").toString()),
                        Long.valueOf(r.get("subjectId").toString()),
                        Integer.parseInt(r.get("marksObtained").toString())))
                .toList();
        return resultService.saveResults(classId, examType, entries, teacher);
    }
}
