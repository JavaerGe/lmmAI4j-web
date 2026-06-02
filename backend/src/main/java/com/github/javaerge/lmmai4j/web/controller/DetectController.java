package com.github.javaerge.lmmai4j.web.controller;

import com.github.javaerge.lmmai4j.web.dto.ApiResponse;
import com.github.javaerge.lmmai4j.web.service.LabelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/detect")
public class DetectController {

    @Autowired
    private LabelService labelService;

    /**
     * 检测文件中的AIGC标识
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> detect(
            @RequestParam("file") MultipartFile file) throws IOException {

        File inputFile = labelService.saveUploadFile(file);

        try {
            Map<String, Object> result = labelService.detect(inputFile);
            return ResponseEntity.ok(ApiResponse.ok("Detection completed", result));
        } finally {
            inputFile.delete();
        }
    }
}
