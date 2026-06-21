package com.gurukulam.school.result;

import com.gurukulam.school.academic.AcademicYearRepository;
import com.gurukulam.school.academic.SchoolClassRepository;
import com.gurukulam.school.student.StudentRepository;
import com.gurukulam.school.teacher.Teacher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
public class ResultService {

    private final SubjectRepository subjectRepo;
    private final ExamResultRepository resultRepo;
    private final StudentRepository studentRepo;
    private final SchoolClassRepository classRepo;
    private final AcademicYearRepository yearRepo;

    public ResultService(SubjectRepository subjectRepo,
                         ExamResultRepository resultRepo,
                         StudentRepository studentRepo,
                         SchoolClassRepository classRepo,
                         AcademicYearRepository yearRepo) {
        this.subjectRepo = subjectRepo;
        this.resultRepo = resultRepo;
        this.studentRepo = studentRepo;
        this.classRepo = classRepo;
        this.yearRepo = yearRepo;
    }

    // ── Subjects ──────────────────────────────────────────────────────────

    public Subject createSubject(Long classId, String name, int maxMarks) {
        var sc = classRepo.findById(classId)
                .orElseThrow(() -> new NoSuchElementException("Class not found"));
        var year = currentYear();
        return subjectRepo.save(Subject.builder()
                .name(name).schoolClass(sc).academicYear(year).maxMarks(maxMarks).build());
    }

    public List<Subject> subjectsForClass(Long classId) {
        return subjectRepo.findByClassAndYear(classId, currentYear().getId());
    }

    public void deleteSubject(Long id) {
        resultRepo.deleteBySubjectId(id);
        subjectRepo.deleteById(id);
    }

    // ── Results ───────────────────────────────────────────────────────────

    public record ResultEntry(Long studentId, Long subjectId, int marksObtained) {}

    public int saveResults(Long classId, ExamType examType,
                           List<ResultEntry> entries, Teacher teacher) {
        var year = currentYear();
        int count = 0;

        for (var entry : entries) {
            var student = studentRepo.findById(entry.studentId())
                    .orElseThrow(() -> new NoSuchElementException("Student not found"));
            var subject = subjectRepo.findById(entry.subjectId())
                    .orElseThrow(() -> new NoSuchElementException("Subject not found"));

            var existing = resultRepo.findByStudentIdAndSubjectIdAndExamType(
                    entry.studentId(), entry.subjectId(), examType);

            ExamResult result;
            if (existing.isPresent()) {
                result = existing.get();
                result.setMarksObtained(entry.marksObtained());
                result.setEnteredBy(teacher);
            } else {
                result = ExamResult.builder()
                        .student(student)
                        .subject(subject)
                        .examType(examType)
                        .marksObtained(entry.marksObtained())
                        .maxMarks(subject.getMaxMarks())
                        .academicYear(year)
                        .enteredBy(teacher)
                        .build();
            }
            resultRepo.save(result);
            count++;
        }
        return count;
    }

    public List<ExamResult> resultsForClass(Long classId, ExamType examType) {
        return resultRepo.findByClassAndExamType(classId, examType, currentYear().getId());
    }

    public List<ExamResult> resultsForStudent(Long studentId) {
        return resultRepo.findByStudentId(studentId);
    }

    private com.gurukulam.school.academic.AcademicYear currentYear() {
        return yearRepo.findByIsCurrent(true)
                .orElseThrow(() -> new NoSuchElementException("No current academic year"));
    }
}
