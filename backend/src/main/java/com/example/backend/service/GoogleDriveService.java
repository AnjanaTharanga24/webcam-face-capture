package com.example.backend.service;

import com.example.backend.dto.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface OneDriveService {

    FileUploadResponse uploadFile(MultipartFile file) throws Exception;
}
