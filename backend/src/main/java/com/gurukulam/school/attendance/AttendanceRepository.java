package com.gurukulam.school.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    @Query("""
           SELECT a FROM Attendance a
           JOIN FETCH a.student s
           JOIN FETCH s.user
           JOIN FETCH s.schoolClass
           WHERE s.schoolClass.id = :classId
             AND a.date = :date
             AND a.academicYear.id = :yearId
           """)
    List<Attendance> findByClassAndDate(
            @Param("classId") Long classId,
            @Param("date") LocalDate date,
            @Param("yearId") Long yearId);

    @Query("""
           SELECT a FROM Attendance a
           JOIN FETCH a.student s
           JOIN FETCH s.user
           JOIN FETCH s.schoolClass
           WHERE s.schoolClass.id = :classId
             AND a.date >= :from AND a.date <= :to
             AND a.academicYear.id = :yearId
           ORDER BY a.date, s.firstName, s.lastName
           """)
    List<Attendance> findByClassAndDateRange(
            @Param("classId") Long classId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("yearId") Long yearId);

    Optional<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);

    @Query("""
           SELECT a FROM Attendance a
           JOIN FETCH a.student s
           JOIN FETCH s.user
           WHERE s.id = :studentId
             AND a.date >= :from AND a.date <= :to
           ORDER BY a.date
           """)
    List<Attendance> findByStudentAndDateRange(
            @Param("studentId") Long studentId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
