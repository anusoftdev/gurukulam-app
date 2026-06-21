package com.gurukulam.school.result;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {

    @Query("""
           SELECT r FROM ExamResult r
           JOIN FETCH r.student s JOIN FETCH s.user JOIN FETCH s.schoolClass
           JOIN FETCH r.subject sub JOIN FETCH sub.schoolClass
           JOIN FETCH r.academicYear
           WHERE s.schoolClass.id = :classId
             AND r.examType = :examType
             AND r.academicYear.id = :yearId
           ORDER BY s.firstName, s.lastName, sub.name
           """)
    List<ExamResult> findByClassAndExamType(
            @Param("classId") Long classId,
            @Param("examType") ExamType examType,
            @Param("yearId") Long yearId);

    @Query("""
           SELECT r FROM ExamResult r
           JOIN FETCH r.subject sub JOIN FETCH sub.schoolClass
           JOIN FETCH r.academicYear
           WHERE r.student.id = :studentId
           ORDER BY r.examType, sub.name
           """)
    List<ExamResult> findByStudentId(@Param("studentId") Long studentId);

    Optional<ExamResult> findByStudentIdAndSubjectIdAndExamType(
            Long studentId, Long subjectId, ExamType examType);

    void deleteBySubjectId(Long subjectId);
}
