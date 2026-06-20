package com.gurukulam.school.publicapi;

import com.gurukulam.school.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final NoticeRepository noticeRepo;

    public PublicController(NoticeRepository noticeRepo) {
        this.noticeRepo = noticeRepo;
    }

    @GetMapping("/notices")
    public ResponseEntity<ApiResponse<List<Notice>>> getNotices() {
        return ResponseEntity.ok(ApiResponse.success(
                noticeRepo.findByPublishedTrueOrderByCreatedAtDesc()));
    }

    @PostMapping("/notices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Notice>> createNotice(@RequestBody Notice notice) {
        notice.setPublished(true);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notice created", noticeRepo.save(notice)));
    }
}
