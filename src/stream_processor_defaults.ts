import * as SPTypes from "./stream_processor_types";
import * as SPEnums from "./stream_processor_enums";
import path from "path";

export const DEFAULT_REQUIRED: { type: SPEnums.ArgType.kRequired } & SPTypes.RequiredSettings = {
  type: SPEnums.ArgType.kRequired,
  width: 640,
  height: 480,
  format: SPEnums.Format.kRGB,
  quality: 75
};

export const DEFAULT_TEXT: { type: SPEnums.ArgType.kText } & SPTypes.TextSettings = {
  type: SPEnums.ArgType.kText,
  cam_name: "Camera",
  text_position: SPEnums.TextPosition.kBottom,
  show_date: true,
  font_size: 9,
  font_path: "../stream-processor/assets/Pixeloid_by_GGBotNet.ttf",
};

export const DEFAULT_MOTION: {
  type: SPEnums.ArgType.kMotion
  kBlurScaleVerticalFile: string;
  kBlurScaleHorizontalFile: string;
  kStabilizeFile: string;
} & SPTypes.MotionSettings = {
  type: SPEnums.ArgType.kMotion,
  gaussian_size: 1,
  scale_denominator: 5,
  bg_stabil_length: 10,
  motion_stabil_length: 1,
  min_pixel_diff: 10,
  min_changed_pixels: 0.1,
  motion_fps_scale: 1,
  kBlurScaleVerticalFile: path.join(__dirname, "..", "..", "stream-processor", "mjpeg-motion-detector", "kernels", "blur_and_scale_vertical.cl"),
  kBlurScaleHorizontalFile: path.join(__dirname, "..", "..", "stream-processor", "mjpeg-motion-detector", "kernels", "blur_and_scale_horizontal.cl"),
  kStabilizeFile: path.join(__dirname, "..", "..", "stream-processor", "mjpeg-motion-detector", "kernels", "stabilize_bg_mvt.cl")
};

export const DEFAULT_DEVICE: { type: SPEnums.ArgType.kDevice } & SPTypes.DeviceSettings = {
  type: SPEnums.ArgType.kDevice,
  device_type: SPEnums.DeviceType.kSpecific,
  device_choice: 0
};