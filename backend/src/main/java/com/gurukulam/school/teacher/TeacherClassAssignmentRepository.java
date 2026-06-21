package com.gurukulam.school.teacher;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TeacherClassAssignmentRepository extends JpaRepository<TeacherClassAssignment, Long> {

    @Query("""
           SELECT a FROM TeacherClassAssignment a
           JOIN FETCH a.teacher t JOIN FETCH t.user
           JOIN FETCH a.schoolClass
           LEFT JOIN FETCH a.section
           JOIN FETCH a.academicYear
           WHERE a.teacher.id = :teacherId AND a.academicYear.id = :yearId
           """)
    List<TeacherClassAssignment> findByTeacherIdAndAcademicYearId(
            @Param("teacherId") Long teacherId,
            @Param("yearId") Long yearId);

    @Query("""
           SELECT a FROM TeacherClassAssignment a
           JOIN FETCH a.teacher t JOIN FETCH t.user
           JOIN FETCH a.schoolClass
           LEFT JOIN FETCH a.section
           JOIN FETCH a.academicYear
           WHERE a.schoolClass.id = :classId AND a.academicYear.id = :yearId
           """)
    List<TeacherClassAssignment> findBySchoolClassIdAndAcademicYearId(
            @Param("classId") Long classId,
            @Param("yearId") Long yearId);
}
