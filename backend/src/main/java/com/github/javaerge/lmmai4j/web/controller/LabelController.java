package com.github.javaerge.lmmai4j.web.controller;

import com.github.javaerge.lmmai4j.web.dto.ApiResponse;
import com.github.javaerge.lmmai4j.web.service.LabelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/label")
public class LabelController {

    @Autowired
    private LabelService labelService;

    /**
     * 写入隐式标识(元数据)
     */
    @PostMapping("/metadata")
    public ResponseEntity<ApiResponse<Map<String, Object>>> writeMetadata(
            @RequestParam("file") MultipartFile file,
            @RequestParam("label") String label,
            @RequestParam("contentProducer") String contentProducer,
            @RequestParam("produceId") String produceId,
            @RequestParam(value = "reservedCode1", required = false) String reservedCode1,
            @RequestParam(value = "contentPropagator", required = false) String contentPropagator,
            @RequestParam(value = "propagateId", required = false) String propagateId,
            @RequestParam(value = "reservedCode2", required = false) String reservedCode2,
            @RequestParam(value = "producerDate", required = false) String producerDate) throws IOException {

        File inputFile = labelService.saveUploadFile(file);

        try {
            com.github.javaerge.lmmai4j.web.dto.AigcLabelRequest labelRequest = new com.github.javaerge.lmmai4j.web.dto.AigcLabelRequest();
            labelRequest.setLabel(label);
            labelRequest.setContentProducer(contentProducer);
            labelRequest.setProduceId(produceId);
            labelRequest.setReservedCode1(reservedCode1);
            labelRequest.setContentPropagator(contentPropagator);
            labelRequest.setPropagateId(propagateId);
            labelRequest.setReservedCode2(reservedCode2);
            labelRequest.setProducerDate(producerDate);

            Map<String, Object> result = labelService.writeMetadata(inputFile, labelRequest);
            return ResponseEntity.ok(ApiResponse.ok("Metadata label applied", result));
        } finally {
            // Clean up input file
            inputFile.delete();
        }
    }

    /**
     * 添加显式标识(水印)
     */
    @PostMapping("/watermark")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addWatermark(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "text", defaultValue = "AI生成") String text,
            @RequestParam(value = "position", defaultValue = "BOTTOM_RIGHT") String position,
            @RequestParam(value = "fontSizeRatio", defaultValue = "0.05") float fontSizeRatio,
            @RequestParam(value = "opacity", defaultValue = "0.5") float opacity,
            @RequestParam(value = "videoStartDuration", defaultValue = "2.0") float videoStartDuration,
            @RequestParam(value = "audioPromptType", defaultValue = "MORSE_CODE") String audioPromptType,
            @RequestParam(value = "audioPromptPosition", defaultValue = "START") String audioPromptPosition) throws IOException {

        File inputFile = labelService.saveUploadFile(file);

        try {
            com.github.javaerge.lmmai4j.web.dto.WatermarkOptionsRequest optsRequest = new com.github.javaerge.lmmai4j.web.dto.WatermarkOptionsRequest();
            optsRequest.setText(text);
            optsRequest.setPosition(position);
            optsRequest.setFontSizeRatio(fontSizeRatio);
            optsRequest.setOpacity(opacity);
            optsRequest.setVideoStartDuration(videoStartDuration);
            optsRequest.setAudioPromptType(audioPromptType);
            optsRequest.setAudioPromptPosition(audioPromptPosition);

            Map<String, Object> result = labelService.addWatermark(inputFile, optsRequest);
            return ResponseEntity.ok(ApiResponse.ok("Watermark applied", result));
        } finally {
            inputFile.delete();
        }
    }

    /**
     * 一键标识(隐式+显式)
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<Map<String, Object>>> labelAll(
            @RequestParam("file") MultipartFile file,
            @RequestParam("label") String label,
            @RequestParam("contentProducer") String contentProducer,
            @RequestParam("produceId") String produceId,
            @RequestParam(value = "reservedCode1", required = false) String reservedCode1,
            @RequestParam(value = "contentPropagator", required = false) String contentPropagator,
            @RequestParam(value = "propagateId", required = false) String propagateId,
            @RequestParam(value = "reservedCode2", required = false) String reservedCode2,
            @RequestParam(value = "producerDate", required = false) String producerDate,
            @RequestParam(value = "text", defaultValue = "AI生成") String text,
            @RequestParam(value = "position", defaultValue = "BOTTOM_RIGHT") String position,
            @RequestParam(value = "fontSizeRatio", defaultValue = "0.05") float fontSizeRatio,
            @RequestParam(value = "opacity", defaultValue = "0.5") float opacity,
            @RequestParam(value = "videoStartDuration", defaultValue = "2.0") float videoStartDuration,
            @RequestParam(value = "audioPromptType", defaultValue = "MORSE_CODE") String audioPromptType,
            @RequestParam(value = "audioPromptPosition", defaultValue = "START") String audioPromptPosition) throws IOException {

        File inputFile = labelService.saveUploadFile(file);

        try {
            com.github.javaerge.lmmai4j.web.dto.AigcLabelRequest labelRequest = new com.github.javaerge.lmmai4j.web.dto.AigcLabelRequest();
            labelRequest.setLabel(label);
            labelRequest.setContentProducer(contentProducer);
            labelRequest.setProduceId(produceId);
            labelRequest.setReservedCode1(reservedCode1);
            labelRequest.setContentPropagator(contentPropagator);
            labelRequest.setPropagateId(propagateId);
            labelRequest.setReservedCode2(reservedCode2);
            labelRequest.setProducerDate(producerDate);

            com.github.javaerge.lmmai4j.web.dto.WatermarkOptionsRequest optsRequest = new com.github.javaerge.lmmai4j.web.dto.WatermarkOptionsRequest();
            optsRequest.setText(text);
            optsRequest.setPosition(position);
            optsRequest.setFontSizeRatio(fontSizeRatio);
            optsRequest.setOpacity(opacity);
            optsRequest.setVideoStartDuration(videoStartDuration);
            optsRequest.setAudioPromptType(audioPromptType);
            optsRequest.setAudioPromptPosition(audioPromptPosition);

            Map<String, Object> result = labelService.labelAll(inputFile, labelRequest, optsRequest);
            return ResponseEntity.ok(ApiResponse.ok("All labels applied", result));
        } finally {
            inputFile.delete();
        }
    }

    /**
     * 下载处理后的文件
     */
    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam("path") String filePath) {
        File file = new File(filePath);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        String contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getName() + "\"")
                .body(resource);
    }
}
