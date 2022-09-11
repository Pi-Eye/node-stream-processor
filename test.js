const { StreamProcessorWrap } = require('./node-streamprocessor.node');
const fs = require('fs');

const ArgType = { kRequired: 0, kText: 1, kMotion: 2, kDevice: 3 };
const Format = { kRGB: 0, kGray: 1 };
const TextPosition = { kTop: 0, kBottom: 0 };
const DeviceType = { kCPU: 0, kGPU: 1, kSpecific: 2 };

const required_settings = {
  type: ArgType.kRequired,
  width: 320, height: 240, format: Format.kRGB, quality: 75
};

const text_settings = {
  type: ArgType.kText,
  cam_name: "Test",
  text_position: TextPosition.kTop,
  show_date: true,
  font_size: 9,
  font_path: "../../stream-processor/assets/Pixeloid_by_GGBotNet.ttf",
}
const motion_settings = {
  type: ArgType.kMotion,
  gaussian_size: 0,
  scale_denominator: 1,
  bg_stabil_length: 10,
  motion_stabil_length: 1,
  min_pixel_diff: 10,
  min_changed_pixels: 0.1,
  motion_fps_scale: 1
}
const device_settings = {
  type: ArgType.kDevice,
  device_type: DeviceType.kSpecific,
  device_choice: 0
}


const buffer = fs.readFileSync("../../stream-processor/test-images/320x240-test-image.jpg");
console.log(buffer);
const processor = new StreamProcessorWrap(required_settings, text_settings, motion_settings, device_settings);
console.log(processor.ProcessFrame(buffer));