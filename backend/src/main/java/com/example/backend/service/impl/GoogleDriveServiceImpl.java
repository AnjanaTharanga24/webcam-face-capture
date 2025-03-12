package com.example.backend.service.impl;

import com.example.backend.dto.FileUploadResponse;
import com.example.backend.service.GoogleDriveService;
import com.google.api.client.http.InputStreamContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.Collections;
import java.util.UUID;

@Service
public class GoogleDriveServiceImpl implements GoogleDriveService {

    @Value("${google.folder-id}")
    private String folderId;

    private final Drive driveService;

    @Autowired
    public GoogleDriveServiceImpl(Drive driveService) {
        this.driveService = driveService;
    }

    @Override
    public FileUploadResponse uploadFile(MultipartFile file) throws Exception {
        // Generate a unique filename to prevent overwrites
        String fileExtension = getFileExtension(file.getOriginalFilename());
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

        // Create file metadata
        File fileMetadata = new File();
        fileMetadata.setName(uniqueFileName);
        fileMetadata.setParents(Collections.singletonList(folderId));

        // File content
        InputStreamContent mediaContent = new InputStreamContent(
                file.getContentType(),
                new ByteArrayInputStream(file.getBytes())
        );

        // Upload file to Google Drive
        File uploadedFile = driveService.files().create(fileMetadata, mediaContent)
                .setFields("id, name, webViewLink")
                .execute();

        // Create response object
        return new FileUploadResponse(
                true,
                uploadedFile.getId(),
                uniqueFileName,
                uploadedFile.getWebViewLink()
        );
    }

    private String getFileExtension(String filename) {
        if (filename == null) {
            return ".jpg"; // Default extension
        }
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return ".jpg"; // Default extension if none found
        }
        return filename.substring(lastDotIndex);
    }
}