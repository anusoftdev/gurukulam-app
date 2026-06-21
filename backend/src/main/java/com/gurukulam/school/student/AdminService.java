package com.gurukulam.school.student;

import com.gurukulam.school.academic.*;
import com.gurukulam.school.teacher.*;
import com.gurukulam.school.user.*;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional
public class AdminService {

    private final UserRepository userRepo;
    private final StudentRepository studentRepo;
    private final TeacherRepository teacherRepo;
    private final SchoolClassRepository classRepo;
    private final SectionRepository sectionRepo;
    private final AcademicYearRepository yearRepo;
    private final TeacherClassAssignmentRepository assignmentRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepo,
                        StudentRepository studentRepo,
                        TeacherRepository teacherRepo,
                        SchoolClassRepository classRepo,
                        SectionRepository sectionRepo,
                        AcademicYearRepository yearRepo,
                        TeacherClassAssignmentRepository assignmentRepo,
                        PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.studentRepo = studentRepo;
        this.teacherRepo = teacherRepo;
        this.classRepo = classRepo;
        this.sectionRepo = sectionRepo;
        this.yearRepo = yearRepo;
        this.assignmentRepo = assignmentRepo;
        this.passwordEncoder = passwordEncoder;
    }

    // ──────────────────────────────────────────────────────────────────────
    //  ACADEMIC YEAR
    // ──────────────────────────────────────────────────────────────────────

    public AcademicYear createAcademicYear(String label, LocalDate start, LocalDate end, boolean current) {
        if (current) {
            // demote any existing current year
            yearRepo.findByIsCurrent(true).ifPresent(y -> { y.setCurrent(false); yearRepo.save(y); });
        }
        return yearRepo.save(AcademicYear.builder()
                .label(label).startDate(start).endDate(end).isCurrent(current).build());
    }

    public AcademicYear currentYear() {
        return yearRepo.findByIsCurrent(true)
                .orElseThrow(() -> new NoSuchElementException("No current academic year set"));
    }

    // ──────────────────────────────────────────────────────────────────────
    //  SCHOOL CLASS
    // ──────────────────────────────────────────────────────────────────────

    public List<SchoolClass> allClasses() {
        return classRepo.findAllByOrderBySortOrderAsc();
    }

    public SchoolClass createClass(String name, int sortOrder) {
        return classRepo.save(SchoolClass.builder().name(name).sortOrder(sortOrder).build());
    }

    public List<Section> sectionsForClass(Long classId) {
        return sectionRepo.findBySchoolClassId(classId);
    }

    public void deleteClass(Long id) {
        AcademicYear year = currentYear();
        long studentCount = studentRepo.findBySchoolClassIdAndAcademicYearId(id, year.getId()).size();
        if (studentCount > 0)
            throw new IllegalStateException("Cannot delete class: " + studentCount + " student(s) are enrolled in it.");
        classRepo.deleteById(id);
    }

    // ──────────────────────────────────────────────────────────────────────
    //  STUDENTS
    // ──────────────────────────────────────────────────────────────────────

    public record CreateStudentRequest(
            String firstName, String lastName, LocalDate dob, String gender,
            Long classId, Long sectionId, String parentName, String parentPhone,
            String address, LocalDate admissionDate
    ) {}

    public record CredentialResult(String username, String plainPassword) {}

    public Student createStudent(CreateStudentRequest req) {
        AcademicYear year = currentYear();
        SchoolClass sc = classRepo.findById(req.classId())
                .orElseThrow(() -> new NoSuchElementException("Class not found"));

        String admissionNo = generateAdmissionNo(sc);
        String username = "STU" + admissionNo;
        String rawPassword = generatePassword();

        if (userRepo.existsByUsername(username))
            throw new IllegalArgumentException("Username already exists: " + username);

        User user = userRepo.save(User.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(Role.STUDENT)
                .active(true)
                .build());

        // Store the plain password temporarily in username field NOT — we return it once here
        Section section = req.sectionId() != null
                ? sectionRepo.findById(req.sectionId()).orElse(null) : null;

        Student student = studentRepo.save(Student.builder()
                .user(user)
                .admissionNo(admissionNo)
                .firstName(req.firstName())
                .lastName(req.lastName())
                .dob(req.dob())
                .gender(req.gender())
                .schoolClass(sc)
                .section(section)
                .academicYear(year)
                .parentName(req.parentName())
                .parentPhone(req.parentPhone())
                .address(req.address())
                .admissionDate(req.admissionDate() != null ? req.admissionDate() : LocalDate.now())
                .build());

        // Attach generated creds as a transient field trick: we use a wrapper DTO in the controller
        student.setPhotoUrl("__CREDS__:" + username + ":" + rawPassword); // sentinel; controller replaces
        return student;
    }

    public CredentialResult resetStudentPassword(Long studentId) {
        Student s = studentRepo.findById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Student not found"));
        String raw = generatePassword();
        s.getUser().setPasswordHash(passwordEncoder.encode(raw));
        userRepo.save(s.getUser());
        return new CredentialResult(s.getUser().getUsername(), raw);
    }

    public List<Student> studentsInClass(Long classId) {
        AcademicYear year = currentYear();
        return studentRepo.findBySchoolClassIdAndAcademicYearId(classId, year.getId());
    }

    public List<Student> allStudents() {
        AcademicYear year = currentYear();
        return studentRepo.findByAcademicYearId(year.getId());
    }

    public Student getStudent(Long id) {
        return studentRepo.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Student not found"));
    }

    public Student updateStudent(Long id, CreateStudentRequest req) {
        Student s = getStudent(id);
        SchoolClass sc = classRepo.findById(req.classId())
                .orElseThrow(() -> new NoSuchElementException("Class not found"));
        Section section = req.sectionId() != null
                ? sectionRepo.findById(req.sectionId()).orElse(null) : null;

        s.setFirstName(req.firstName());
        s.setLastName(req.lastName());
        s.setDob(req.dob());
        s.setGender(req.gender());
        s.setSchoolClass(sc);
        s.setSection(section);
        s.setParentName(req.parentName());
        s.setParentPhone(req.parentPhone());
        s.setAddress(req.address());
        return studentRepo.save(s);
    }

    public void deactivateStudent(Long id) {
        Student s = getStudent(id);
        s.getUser().setActive(false);
        userRepo.save(s.getUser());
    }

    // ──────────────────────────────────────────────────────────────────────
    //  TEACHERS
    // ──────────────────────────────────────────────────────────────────────

    public record CreateTeacherRequest(
            String firstName, String lastName, String phone,
            String qualification, LocalDate joiningDate, String employeeId
    ) {}

    public record CreateTeacherResult(Teacher teacher, String username, String plainPassword) {}

    public CreateTeacherResult createTeacher(CreateTeacherRequest req) {
        String empId = (req.employeeId() != null && !req.employeeId().isBlank())
                ? req.employeeId() : generateEmployeeId();
        if (teacherRepo.existsByEmployeeId(empId))
            throw new IllegalArgumentException("Employee ID already exists: " + empId);

        String username = "TCH" + empId;
        String rawPassword = generatePassword();

        if (userRepo.existsByUsername(username))
            throw new IllegalArgumentException("Username already exists: " + username);

        User user = userRepo.save(User.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(Role.TEACHER)
                .active(true)
                .build());

        Teacher teacher = teacherRepo.save(Teacher.builder()
                .user(user)
                .firstName(req.firstName())
                .lastName(req.lastName())
                .phone(req.phone())
                .qualification(req.qualification())
                .joiningDate(req.joiningDate() != null ? req.joiningDate() : LocalDate.now())
                .employeeId(empId)
                .build());

        return new CreateTeacherResult(teacher, username, rawPassword);
    }

    public List<Teacher> allTeachers() {
        return teacherRepo.findAllWithUser();
    }

    public Teacher getTeacher(Long id) {
        return teacherRepo.findByIdWithUser(id)
                .orElseThrow(() -> new NoSuchElementException("Teacher not found"));
    }

    public CredentialResult resetTeacherPassword(Long teacherId) {
        Teacher t = getTeacher(teacherId);
        String raw = generatePassword();
        t.getUser().setPasswordHash(passwordEncoder.encode(raw));
        userRepo.save(t.getUser());
        return new CredentialResult(t.getUser().getUsername(), raw);
    }

    public TeacherClassAssignment assignTeacherToClass(Long teacherId, Long classId,
                                                        Long sectionId, String subject) {
        Teacher teacher = getTeacher(teacherId);
        SchoolClass sc = classRepo.findById(classId)
                .orElseThrow(() -> new NoSuchElementException("Class not found"));
        Section section = sectionId != null
                ? sectionRepo.findById(sectionId).orElse(null) : null;
        AcademicYear year = currentYear();

        return assignmentRepo.save(TeacherClassAssignment.builder()
                .teacher(teacher).schoolClass(sc).section(section)
                .academicYear(year).subject(subject).build());
    }

    // ──────────────────────────────────────────────────────────────────────
    //  HELPERS
    // ──────────────────────────────────────────────────────────────────────

    private String generateAdmissionNo() {
        String year = String.valueOf(LocalDate.now().getYear()).substring(2);
        int count = (int) studentRepo.count() + 1;
        return String.format("GKL%s%04d", year, count);
    }

    private String generateAdmissionNo(SchoolClass sc) {
        return generateAdmissionNo();
    }

    private String generatePassword() {
        // 8-char alphanumeric password
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder(8);
        Random rnd = new Random();
        for (int i = 0; i < 8; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }

    private String generateEmployeeId() {
        int count = (int) teacherRepo.count() + 1;
        return String.format("EMP%04d", count);
    }
}
