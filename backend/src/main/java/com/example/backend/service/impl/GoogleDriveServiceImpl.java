package com.example.backend.service.impl;


import com.azure.identity.ClientSecretCredential;
import com.example.backend.dto.FileUploadResponse;
import com.example.backend.service.OneDriveService;
import com.microsoft.graph.models.DriveItem;
import com.microsoft.graph.requests.GraphServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.UUID;

@Service
public class OneDriveServiceImpl implements OneDriveService {

    @Value("${onedrive.folder-id}")
    private String folderId;

    private final GraphServiceClient graphClient;

    @Autowired
    public OneDriveServiceImpl(GraphServiceClient graphClient) {
        this.graphClient = graphClient;
    }

    @Override
    public FileUploadResponse uploadFile(MultipartFile file) throws Exception {
        // Generate a unique filename to prevent overwrites
        String fileExtension = getFileExtension(file.getOriginalFilename());
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

        // Upload file to specified OneDrive folder
        DriveItem uploadedFile = graphClient
                .me()
                .drive()
                .items(folderId)
                .itemWithPath(uniqueFileName)
                .content()
                .buildRequest()
                .put(new ByteArrayInputStream(file.getBytes()));

        // Create response object
        return new FileUploadResponse(
                true,
                uploadedFile.id,
                uniqueFileName,
                uploadedFile.webUrl
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
}}