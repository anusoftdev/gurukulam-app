package com.gurukulam.school.result;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    @Query("""
           SELECT s FROM Subject s
           JOIN FETCH s.schoolClass
           JOIN FETCH s.academicYear
           WHERE s.schoolClass.id = :classId AND s.academicYear.id = :yearId
           ORDER BY s.name
           """)
    List<Subject> findByClassAndYear(@Param("classId") Long classId, @Param("yearId") Long yearId);
}
