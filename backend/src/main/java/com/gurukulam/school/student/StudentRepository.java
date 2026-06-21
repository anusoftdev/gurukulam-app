package com.gurukulam.school.student;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    @Query("""
           SELECT s FROM Student s
           JOIN FETCH s.user
           JOIN FETCH s.schoolClass
           LEFT JOIN FETCH s.section
           JOIN FETCH s.academicYear
           WHERE s.academicYear.id = :yearId
           ORDER BY s.schoolClass.sortOrder, s.firstName, s.lastName
           """)
    List<Student> findByAcademicYearId(@Param("yearId") Long yearId);

    @Query("""
           SELECT s FROM Student s
           JOIN FETCH s.user
           JOIN FETCH s.schoolClass
           LEFT JOIN FETCH s.section
           JOIN FETCH s.academicYear
           WHERE s.schoolClass.id = :classId AND s.academicYear.id = :yearId
           ORDER BY s.firstName, s.lastName
           """)
    List<Student> findBySchoolClassIdAndAcademicYearId(
            @Param("classId") Long classId,
            @Param("yearId") Long yearId);

    @Query("""
           SELECT s FROM Student s
           JOIN FETCH s.user
           JOIN FETCH s.schoolClass
           LEFT JOIN FETCH s.section
           JOIN FETCH s.academicYear
           WHERE s.user.username = :username
           """)
    Optional<Student> findByUserUsername(@Param("username") String username);

    @Query("""
           SELECT s FROM Student s
           JOIN FETCH s.user
           JOIN FETCH s.schoolClass
           LEFT JOIN FETCH s.section
           JOIN FETCH s.academicYear
           WHERE s.id = :id
           """)
    Optional<Student> findByIdWithDetails(@Param("id") Long id);

    Optional<Student> findByUserId(Long userId);
    boolean existsByAdmissionNo(String admissionNo);
}
