package com.gurukulam.school.student;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findBySchoolClassIdAndAcademicYearId(Long classId, Long yearId);
    List<Student> findByAcademicYearId(Long yearId);
    Optional<Student> findByUserId(Long userId);
    boolean existsByAdmissionNo(String admissionNo);
}
