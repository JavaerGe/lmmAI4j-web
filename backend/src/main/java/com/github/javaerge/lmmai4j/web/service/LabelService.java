package com.github.javaerge.lmmai4j.web.service;

import com.github.javaerge.lmmai4j.LmmAi4j;
import com.github.javaerge.lmmai4j.detect.LabelDetector;
import com.github.javaerge.lmmai4j.metadata.ImageMetadataHandler;
import com.github.javaerge.lmmai4j.metadata.VideoMetadataHandler;
import com.github.javaerge.lmmai4j.metadata.AudioMetadataHandler;
import com.github.javaerge.lmmai4j.model.*;
import com.github.javaerge.lmmai4j.watermark.*;
import com.github.javaerge.lmmai4j.web.dto.AigcLabelRequest;
import com.github.javaerge.lmmai4j.web.dto.WatermarkOptionsRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class LabelService {

    private static final Logger log = LoggerFactory.getLogger(LabelService.class);

    @Value("${lmmAI4j.upload-dir:${java.io.tmpdir}/lmmai4j-web/uploads}")
    private String uploadDir;

    /**
     * 写入隐式标识(元数据)
     */
    public Map<String, Object> writeMetadata(File inputFile, AigcLabelRequest labelRequest) throws IOException {
        MediaFormat format = detectFormat(inputFile.getName());
        LmmAi4j sdk = LmmAi4j.forFormat(format);

        AigcLabel label = toAigcLabel(labelRequest);
        String outputPath = generateOutputPath(inputFile.getName(), "_meta");

        LabelResult result = sdk.writeMetadata(inputFile, label, outputPath);
        return toResultMap(result);
    }

    /**
     * 添加显式标识(水印)
     */
    public Map<String, Object> addWatermark(File inputFile, WatermarkOptionsRequest optsRequest) throws IOException {
        MediaFormat format = detectFormat(inputFile.getName());
        LmmAi4j sdk = LmmAi4j.forFormat(format);

        WatermarkOptions options = toWatermarkOptions(optsRequest);
        String outputPath = generateOutputPath(inputFile.getName(), "_wm");

        LabelResult result = sdk.addWatermark(inputFile, options, outputPath);
        return toResultMap(result);
    }

    /**
     * 一键标识(隐式+显式)
     */
    public Map<String, Object> labelAll(File inputFile, AigcLabelRequest labelRequest,
                                         WatermarkOptionsRequest optsRequest) throws IOException {
        MediaFormat format = detectFormat(inputFile.getName());
        LmmAi4j sdk = LmmAi4j.forFormat(format);

        AigcLabel label = toAigcLabel(labelRequest);
        WatermarkOptions options = toWatermarkOptions(optsRequest);
        String outputPath = generateOutputPath(inputFile.getName(), "_labeled");

        LabelResult result = sdk.labelAll(inputFile, label, options, outputPath);
        return toResultMap(result);
    }

    /**
     * 检测标识
     */
    public Map<String, Object> detect(File inputFile) throws IOException {
        MediaFormat format = detectFormat(inputFile.getName());
        LmmAi4j sdk = LmmAi4j.forFormat(format);

        DetectResult detectResult = sdk.detect(inputFile);

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("mediaFormat", format.name());
        map.put("mediaType", format.getMediaType().name());
        map.put("hasImplicitLabel", detectResult.hasImplicitLabel());
        map.put("hasExplicitLabel", detectResult.hasExplicitLabel());
        map.put("isCompliant", detectResult.isCompliant());

        if (detectResult.getImplicitLabel() != null) {
            AigcLabel lbl = detectResult.getImplicitLabel();
            Map<String, Object> labelMap = new LinkedHashMap<>();
            labelMap.put("label", lbl.getLabel());
            labelMap.put("contentProducer", lbl.getContentProducer());
            labelMap.put("produceId", lbl.getProduceId());
            labelMap.put("reservedCode1", lbl.getReservedCode1());
            labelMap.put("contentPropagator", lbl.getContentPropagator());
            labelMap.put("propagateId", lbl.getPropagateId());
            labelMap.put("reservedCode2", lbl.getReservedCode2());
            labelMap.put("producerDate", lbl.getProducerDate());
            labelMap.put("extension", lbl.getExtension());
            labelMap.put("complete", lbl.isComplete());
            labelMap.put("completeForPropagation", lbl.isCompleteForPropagation());
            map.put("aigcLabel", labelMap);
        }

        map.put("report", detectResult.getComplianceNote());
        map.put("missingFields", detectResult.getMissingFields());

        return map;
    }

    /**
     * 获取支持的格式列表
     */
    public Map<String, Object> getSupportedFormats() {
        Map<String, Object> result = new LinkedHashMap<>();

        List<Map<String, String>> images = new ArrayList<>();
        List<Map<String, String>> audios = new ArrayList<>();
        List<Map<String, String>> videos = new ArrayList<>();

        for (MediaFormat fmt : MediaFormat.values()) {
            Map<String, String> item = new LinkedHashMap<>();
            item.put("name", fmt.name());
            item.put("extension", fmt.getExtension());
            item.put("description", fmt.getDescription());

            if (fmt.isImage()) images.add(item);
            else if (fmt.isAudio()) audios.add(item);
            else videos.add(item);
        }

        result.put("image", images);
        result.put("audio", audios);
        result.put("video", videos);
        return result;
    }

    /**
     * 保存上传文件到临时目录
     */
    public File saveUploadFile(org.springframework.web.multipart.MultipartFile file) throws IOException {
        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }
        String originalName = file.getOriginalFilename();
        Path targetPath = dir.resolve(System.currentTimeMillis() + "_" + originalName);
        file.transferTo(targetPath.toFile());
        return targetPath.toFile();
    }

    // ==================== 工具方法 ====================

    private MediaFormat detectFormat(String fileName) {
        String ext = fileName.substring(fileName.lastIndexOf('.') + 1);
        return MediaFormat.fromExtension(ext);
    }

    private AigcLabel toAigcLabel(AigcLabelRequest req) {
        AigcLabel label = new AigcLabel();
        label.setLabel(req.getLabel());
        label.setContentProducer(req.getContentProducer());
        label.setProduceId(req.getProduceId());
        label.setReservedCode1(req.getReservedCode1());
        label.setContentPropagator(req.getContentPropagator());
        label.setPropagateId(req.getPropagateId());
        label.setReservedCode2(req.getReservedCode2());
        label.setProducerDate(req.getProducerDate());
        label.setExtension(req.getExtension());
        return label;
    }

    private WatermarkOptions toWatermarkOptions(WatermarkOptionsRequest req) {
        WatermarkOptions options = new WatermarkOptions();
        options.setText(req.getText());
        options.setPosition(WatermarkOptions.WatermarkPosition.valueOf(req.getPosition()));
        options.setFontSizeRatio(req.getFontSizeRatio());
        options.setOpacity(req.getOpacity());
        options.setTextColor(req.getTextColor());
        options.setBackgroundColor(req.getBackgroundColor());
        options.setVideoStartDuration(req.getVideoStartDuration());
        options.setAudioPromptType(WatermarkOptions.AudioPromptType.valueOf(req.getAudioPromptType()));
        options.setAudioPromptPosition(WatermarkOptions.AudioPromptPosition.valueOf(req.getAudioPromptPosition()));
        return options;
    }

    private String generateOutputPath(String inputName, String suffix) {
        int dotIndex = inputName.lastIndexOf('.');
        String baseName = dotIndex >= 0 ? inputName.substring(0, dotIndex) : inputName;
        String ext = dotIndex >= 0 ? inputName.substring(dotIndex) : "";
        Path dir = Paths.get(uploadDir);
        return dir.resolve(baseName + suffix + ext).toString();
    }

    private Map<String, Object> toResultMap(LabelResult result) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("success", result.isSuccess());
        map.put("message", result.getMessage());
        map.put("outputPath", result.getOutputPath());
        return map;
    }
}
