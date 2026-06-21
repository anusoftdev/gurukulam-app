package com.gurukulam.school.student;

import com.gurukulam.school.attendance.Attendance;
import com.gurukulam.school.attendance.AttendanceRepository;
import com.gurukulam.school.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
public class StudentController {

    private final StudentRepository studentRepo;
    private final AttendanceRepository attendanceRepo;

    public StudentController(StudentRepository studentRepo,
                             AttendanceRepository attendanceRepo) {
        this.studentRepo = studentRepo;
        this.attendanceRepo = attendanceRepo;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Student>> myProfile(
            @AuthenticationPrincipal UserDetails principal) {
        Student student = studentRepo.findByUserUsername(principal.getUsername())
                .orElseThrow(() -> new NoSuchElementException("Student profile not found"));
        return ResponseEntity.ok(ApiResponse.success(student));
    }

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<List<Attendance>>> myAttendance(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam int year,
            @RequestParam int month) {
        Student student = studentRepo.findByUserUsername(principal.getUsername())
                .orElseThrow(() -> new NoSuchElementException("Student profile not found"));
        var ym = YearMonth.of(year, month);
        List<Attendance> records = attendanceRepo.findByStudentAndDateRange(
                student.getId(), ym.atDay(1), ym.atEndOfMonth());
        return ResponseEntity.ok(ApiResponse.success(records));
    }
}
