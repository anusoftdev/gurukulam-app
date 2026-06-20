package com.gurukulam.school.academic;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_classes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // "Nursery", "LKG", "UKG", "1st", "2nd" ... "5th"
    @Column(nullable = false, unique = true, length = 20)
    private String name;

    // Used for display ordering: Nursery=0, LKG=1, UKG=2, 1st=3 ...
    @Column(nullable = false)
    private Integer sortOrder;
}
