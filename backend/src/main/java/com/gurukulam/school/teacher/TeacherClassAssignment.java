package com.gurukulam.school.teacher;

import com.gurukulam.school.academic.AcademicYear;
import com.gurukulam.school.academic.SchoolClass;
import com.gurukulam.school.academic.Section;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "teacher_class_assignments",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"teacher_id", "school_class_id", "section_id", "academic_year_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TeacherClassAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_class_id")
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @Column(length = 50)
    private String subject;
}
