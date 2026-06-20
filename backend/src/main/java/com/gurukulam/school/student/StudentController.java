package com.gurukulam.school.student;

import com.gurukulam.school.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
public class StudentController {

    private final StudentRepository studentRepo;

    public StudentController(StudentRepository studentRepo) {
        this.studentRepo = studentRepo;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Student>> myProfile(
            @AuthenticationPrincipal UserDetails principal) {
        // Find student by username via user relationship
        Student student = studentRepo.findAll().stream()
                .filter(s -> s.getUser().getUsername().equals(principal.getUsername()))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Student profile not found"));
        return ResponseEntity.ok(ApiResponse.success(student));
    }
}
