package com.gurukulam.school.teacher;

import com.gurukulam.school.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "teachers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    private String photoUrl;

    @Column(length = 15)
    private String phone;

    @Column(length = 100)
    private String qualification;

    private LocalDate joiningDate;

    @Column(length = 20)
    private String employeeId;
}
