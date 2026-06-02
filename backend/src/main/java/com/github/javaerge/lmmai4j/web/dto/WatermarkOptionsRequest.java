package com.github.javaerge.lmmai4j.web.dto;

/**
 * 水印选项请求DTO
 */
public class WatermarkOptionsRequest {

    /** 水印文字 */
    private String text = "AI生成";
    /** 位置: TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT, CENTER */
    private String position = "BOTTOM_RIGHT";
    /** 字体大小比例(最短边的比例) */
    private float fontSizeRatio = 0.05f;
    /** 不透明度 */
    private float opacity = 0.5f;
    /** 文字颜色(ARGB整数) */
    private int textColor = -1; // white
    /** 背景颜色(ARGB整数) */
    private int backgroundColor = -16777216; // black
    /** 视频起始画面持续时间(秒) */
    private float videoStartDuration = 2.0f;
    /** 音频提示类型: MORSE_CODE, VOICE_PROMPT */
    private String audioPromptType = "MORSE_CODE";
    /** 音频提示位置: START, END, BOTH */
    private String audioPromptPosition = "START";

    // Getters and Setters
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public float getFontSizeRatio() { return fontSizeRatio; }
    public void setFontSizeRatio(float fontSizeRatio) { this.fontSizeRatio = fontSizeRatio; }
    public float getOpacity() { return opacity; }
    public void setOpacity(float opacity) { this.opacity = opacity; }
    public int getTextColor() { return textColor; }
    public void setTextColor(int textColor) { this.textColor = textColor; }
    public int getBackgroundColor() { return backgroundColor; }
    public void setBackgroundColor(int backgroundColor) { this.backgroundColor = backgroundColor; }
    public float getVideoStartDuration() { return videoStartDuration; }
    public void setVideoStartDuration(float videoStartDuration) { this.videoStartDuration = videoStartDuration; }
    public String getAudioPromptType() { return audioPromptType; }
    public void setAudioPromptType(String audioPromptType) { this.audioPromptType = audioPromptType; }
    public String getAudioPromptPosition() { return audioPromptPosition; }
    public void setAudioPromptPosition(String audioPromptPosition) { this.audioPromptPosition = audioPromptPosition; }
}
