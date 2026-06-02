package com.github.javaerge.lmmai4j.web.dto;

import java.util.Map;

/**
 * AIGC标识请求DTO - 对应GB 45438-2025附录E完整字段结构
 */
public class AigcLabelRequest {

    /** 标识值, 固定为"1" */
    private String label = "1";
    /** 内容生产者(必填) */
    private String contentProducer;
    /** 生产唯一标识(必填) */
    private String produceId;
    /** 保留编码1(可选, 数字签名等) */
    private String reservedCode1;
    /** 内容传播者(传播时必填) */
    private String contentPropagator;
    /** 传播ID(传播时必填) */
    private String propagateId;
    /** 保留编码2(可选) */
    private String reservedCode2;
    /** 生产日期(扩展) */
    private String producerDate;
    /** 扩展字段 */
    private Map<String, Object> extension;

    // Getters and Setters
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getContentProducer() { return contentProducer; }
    public void setContentProducer(String contentProducer) { this.contentProducer = contentProducer; }
    public String getProduceId() { return produceId; }
    public void setProduceId(String produceId) { this.produceId = produceId; }
    public String getReservedCode1() { return reservedCode1; }
    public void setReservedCode1(String reservedCode1) { this.reservedCode1 = reservedCode1; }
    public String getContentPropagator() { return contentPropagator; }
    public void setContentPropagator(String contentPropagator) { this.contentPropagator = contentPropagator; }
    public String getPropagateId() { return propagateId; }
    public void setPropagateId(String propagateId) { this.propagateId = propagateId; }
    public String getReservedCode2() { return reservedCode2; }
    public void setReservedCode2(String reservedCode2) { this.reservedCode2 = reservedCode2; }
    public String getProducerDate() { return producerDate; }
    public void setProducerDate(String producerDate) { this.producerDate = producerDate; }
    public Map<String, Object> getExtension() { return extension; }
    public void setExtension(Map<String, Object> extension) { this.extension = extension; }
}
