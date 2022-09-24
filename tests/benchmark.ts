import fs from "fs";
import path from "path";

import StreamProcessor from "../src/stream_processor";
import { SPEnums } from "node-stream-processor-types";

const DEVICE_ID = 0;  // OpenCL device to run benchmark on
const SILENT = true;  // Silence output or not

const required_settings = {
  width: 320,
  height: 240,
  format: SPEnums.Format.kRGB,
  quality: 75
};
const text_settings = {
  cam_name: "Test",
  text_position: SPEnums.TextPosition.kBottom,
  show_date: true,
  font_size: 9,
  font_path: path.join(__dirname, "..", "..", "stream-processor", "assets", "Pixeloid_by_GGBotNet.ttf")
};
const motion_settings = {
  gaussian_size: 0,
  scale_denominator: 1,
  bg_stabil_length: 10,
  motion_stabil_length: 1,
  min_pixel_diff: 10,
  min_changed_pixels: 0.1,
  motion_fps_scale: 1
};
const device_settings = {
  device_type: SPEnums.DeviceType.kSpecific,
  device_choice: DEVICE_ID
};

function ProcessMany(name: string, processor: StreamProcessor, jpeg: Buffer) {
  console.time(name);
  for (let i = 0; i < 100; i++) {
    processor.ProcessFrame(jpeg);
  }
  console.timeEnd(name);
}

const jpeg240 = fs.readFileSync(path.join(__dirname, "..", "..", "test-images", "320x240-test-image.jpg"));
const jpeg480 = fs.readFileSync(path.join(__dirname, "..", "..", "test-images", "640x480-test-image.jpg"));
const jpeg720 = fs.readFileSync(path.join(__dirname, "..", "..", "test-images", "1280x720-test-image.jpg"));
const jpeg1080 = fs.readFileSync(path.join(__dirname, "..", "..", "test-images", "1920x1080-test-image.jpg"));



console.log("Benchmarking time to process 100 frames: ");
let processor = StreamProcessor.FullProcessor(required_settings, text_settings, motion_settings, device_settings, SILENT);
ProcessMany("320x240", processor, jpeg240);

required_settings.width = 640;
required_settings.height = 480;
processor = StreamProcessor.FullProcessor(required_settings, text_settings, motion_settings, device_settings, SILENT);
ProcessMany("640x480", processor, jpeg480);

required_settings.width = 1280;
required_settings.height = 720;
processor = StreamProcessor.FullProcessor(required_settings, text_settings, motion_settings, device_settings, SILENT);
ProcessMany("1280x720", processor, jpeg720);

required_settings.width = 1920;
required_settings.height = 1080;
processor = StreamProcessor.FullProcessor(required_settings, text_settings, motion_settings, device_settings, SILENT);
ProcessMany("1920x1080", processor, jpeg1080);
