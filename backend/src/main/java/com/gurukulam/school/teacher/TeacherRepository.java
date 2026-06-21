package com.gurukulam.school.teacher;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    @Query("SELECT t FROM Teacher t JOIN FETCH t.user ORDER BY t.firstName, t.lastName")
    List<Teacher> findAllWithUser();

    @Query("SELECT t FROM Teacher t JOIN FETCH t.user WHERE t.id = :id")
    Optional<Teacher> findByIdWithUser(@Param("id") Long id);

    @Query("SELECT t FROM Teacher t JOIN FETCH t.user WHERE t.user.username = :username")
    Optional<Teacher> findByUserUsername(@Param("username") String username);

    Optional<Teacher> findByUserId(Long userId);
    boolean existsByEmployeeId(String employeeId);
}
