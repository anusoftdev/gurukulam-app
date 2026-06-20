package com.gurukulam.school.student;

import com.gurukulam.school.academic.AcademicYear;
import com.gurukulam.school.academic.SchoolClass;
import com.gurukulam.school.academic.Section;
import com.gurukulam.school.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "students")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(unique = true, nullable = false, length = 20)
    private String admissionNo;

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false)
    private LocalDate dob;

    @Column(length = 10)
    private String gender;

    private String photoUrl;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_class_id")
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @Column(length = 100)
    private String parentName;

    @Column(length = 15)
    private String parentPhone;

    @Column(length = 255)
    private String address;

    @Column(nullable = false)
    private LocalDate admissionDate;
}
