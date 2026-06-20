package com.gurukulam.school.config;

import com.gurukulam.school.academic.*;
import com.gurukulam.school.user.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepo;
    private final SchoolClassRepository classRepo;
    private final SectionRepository sectionRepo;
    private final AcademicYearRepository yearRepo;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepo,
                      SchoolClassRepository classRepo,
                      SectionRepository sectionRepo,
                      AcademicYearRepository yearRepo,
                      PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.classRepo = classRepo;
        this.sectionRepo = sectionRepo;
        this.yearRepo = yearRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedAcademicYear();
        seedClasses();
    }

    private void seedAdmin() {
        if (!userRepo.existsByUsername("admin")) {
            userRepo.save(User.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .email("admin@gurukulam.edu.in")
                    .active(true)
                    .build());
            log.info("✅ Default admin created → username: admin  password: Admin@123");
        }
    }

    private void seedAcademicYear() {
        if (yearRepo.count() == 0) {
            yearRepo.save(AcademicYear.builder()
                    .label("2025-26")
                    .startDate(LocalDate.of(2025, 4, 1))
                    .endDate(LocalDate.of(2026, 3, 31))
                    .isCurrent(true)
                    .build());
            log.info("✅ Academic year 2025-26 seeded as current");
        }
    }

    private void seedClasses() {
        if (classRepo.count() == 0) {
            List<String[]> classData = List.of(
                    new String[]{"Nursery", "0"},
                    new String[]{"LKG",     "1"},
                    new String[]{"UKG",     "2"},
                    new String[]{"1st",     "3"},
                    new String[]{"2nd",     "4"},
                    new String[]{"3rd",     "5"},
                    new String[]{"4th",     "6"},
                    new String[]{"5th",     "7"}
            );

            for (String[] cd : classData) {
                SchoolClass sc = classRepo.save(SchoolClass.builder()
                        .name(cd[0])
                        .sortOrder(Integer.parseInt(cd[1]))
                        .build());
                // Default one section "A" per class
                sectionRepo.save(Section.builder().schoolClass(sc).name("A").build());
            }
            log.info("✅ School classes (Nursery → 5th) with Section A seeded");
        }
    }
}
