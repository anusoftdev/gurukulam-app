package com.gurukulam.school.attendance;

import com.gurukulam.school.academic.AcademicYearRepository;
import com.gurukulam.school.student.StudentRepository;
import com.gurukulam.school.teacher.Teacher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
public class AttendanceService {

    private final AttendanceRepository attendanceRepo;
    private final StudentRepository studentRepo;
    private final AcademicYearRepository yearRepo;

    public AttendanceService(AttendanceRepository attendanceRepo,
                             StudentRepository studentRepo,
                             AcademicYearRepository yearRepo) {
        this.attendanceRepo = attendanceRepo;
        this.studentRepo = studentRepo;
        this.yearRepo = yearRepo;
    }

    public record AttendanceRecord(Long studentId, AttendanceStatus status) {}

    public List<Attendance> markAttendance(Long classId, LocalDate date,
                                           List<AttendanceRecord> records, Teacher teacher) {
        var year = yearRepo.findByIsCurrent(true)
                .orElseThrow(() -> new NoSuchElementException("No current academic year"));

        List<Attendance> saved = new ArrayList<>();
        for (var rec : records) {
            var student = studentRepo.findById(rec.studentId())
                    .orElseThrow(() -> new NoSuchElementException("Student not found: " + rec.studentId()));

            var existing = attendanceRepo.findByStudentIdAndDate(rec.studentId(), date);
            Attendance attendance;
            if (existing.isPresent()) {
                attendance = existing.get();
                attendance.setStatus(rec.status());
                attendance.setMarkedBy(teacher);
            } else {
                attendance = Attendance.builder()
                        .student(student)
                        .date(date)
                        .status(rec.status())
                        .markedBy(teacher)
                        .academicYear(year)
                        .build();
            }
            saved.add(attendanceRepo.save(attendance));
        }
        return saved;
    }

    public List<Attendance> getAttendanceForClass(Long classId, LocalDate date) {
        var year = yearRepo.findByIsCurrent(true)
                .orElseThrow(() -> new NoSuchElementException("No current academic year"));
        return attendanceRepo.findByClassAndDate(classId, date, year.getId());
    }

    public List<Attendance> getMonthlyReport(Long classId, int year, int month) {
        var acadYear = yearRepo.findByIsCurrent(true)
                .orElseThrow(() -> new NoSuchElementException("No current academic year"));
        var ym = YearMonth.of(year, month);
        return attendanceRepo.findByClassAndDateRange(
                classId, ym.atDay(1), ym.atEndOfMonth(), acadYear.getId());
    }

    public List<Attendance> getStudentMonthlyAttendance(Long studentId, int year, int month) {
        var ym = YearMonth.of(year, month);
        return attendanceRepo.findByStudentAndDateRange(studentId, ym.atDay(1), ym.atEndOfMonth());
    }
}
