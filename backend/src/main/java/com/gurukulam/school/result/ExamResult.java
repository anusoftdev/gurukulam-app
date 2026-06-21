package com.gurukulam.school.result;

import com.gurukulam.school.academic.AcademicYear;
import com.gurukulam.school.student.Student;
import com.gurukulam.school.teacher.Teacher;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_results",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "subject_id", "exam_type"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExamResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExamType examType;

    @Column(nullable = false)
    private Integer marksObtained;

    @Column(nullable = false)
    private Integer maxMarks;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entered_by_teacher_id")
    private Teacher enteredBy;
}
