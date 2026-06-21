package com.gurukulam.school.result;

import com.gurukulam.school.academic.AcademicYear;
import com.gurukulam.school.academic.SchoolClass;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects",
       uniqueConstraints = @UniqueConstraint(columnNames = {"name", "school_class_id", "academic_year_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_class_id")
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @Column(nullable = false)
    private Integer maxMarks;
}
