package com.example.backend.controller;

import com.example.backend.dto.ErrorResponse;
import com.example.backend.dto.FileUploadResponse;
import com.example.backend.service.GoogleDriveService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class ImageUploadController {

    private static final Logger logger = LoggerFactory.getLogger(ImageUploadController.class);

    private final GoogleDriveService googleDriveService;

    @Autowired
    public ImageUploadController(GoogleDriveService googleDriveService) {
        this.googleDriveService = googleDriveService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("Received file upload request: {}", file.getOriginalFilename());

            FileUploadResponse response = googleDriveService.uploadFile(file);

            logger.info("File successfully uploaded to Google Drive with ID: {}", response.getFileId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error uploading file to Google Drive", e);
            ErrorResponse errorResponse = new ErrorResponse(false, e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}