package com.gurukulam.school.teacher;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherClassAssignmentRepository extends JpaRepository<TeacherClassAssignment, Long> {
    List<TeacherClassAssignment> findByTeacherIdAndAcademicYearId(Long teacherId, Long yearId);
    List<TeacherClassAssignment> findBySchoolClassIdAndAcademicYearId(Long classId, Long yearId);
}
