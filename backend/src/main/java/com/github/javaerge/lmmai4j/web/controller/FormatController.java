package com.github.javaerge.lmmai4j.web.controller;

import com.github.javaerge.lmmai4j.web.dto.ApiResponse;
import com.github.javaerge.lmmai4j.web.service.LabelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/formats")
public class FormatController {

    @Autowired
    private LabelService labelService;

    /**
     * 获取支持的格式列表
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFormats() {
        Map<String, Object> formats = labelService.getSupportedFormats();
        return ResponseEntity.ok(ApiResponse.ok(formats));
    }
}
