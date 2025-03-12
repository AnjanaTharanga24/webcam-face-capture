package com.example.backend.service;

import com.example.backend.dto.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface GoogleDriveService {

    FileUploadResponse uploadFile(MultipartFile file) throws Exception;
}
