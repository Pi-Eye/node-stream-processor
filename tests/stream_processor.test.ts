import { should } from "chai";
should();
import fs from "fs";
import path from "path";

import StreamProcessor from "../src/stream_processor";
import * as SPEnums from "../src/stream_processor_enums";

const DEVICE_ID = 0;    // OpenCL device to run test on
const SILENT = true;   // Debug messages or not

describe("Stream Processor Constructor", () => {
  const required_settings = {
    width: 320,
    height: 240,
    format: SPEnums.Format.kRGB,
    quality: 90
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

  it("should create StreamProcessor with valid arguments", () => {
    (() => StreamProcessor.SimpleProcessor(required_settings, SILENT)).should.not.Throw();
    (() => StreamProcessor.TextOverlay(required_settings, text_settings, SILENT)).should.not.Throw();
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.not.Throw();
    (() => StreamProcessor.FullProcessor(required_settings, text_settings, motion_settings, device_settings, SILENT)).should.not.Throw();
  });

  it("should throw error on invalid required arguments", () => {
    // Width
    required_settings.width = 0;
    (() => StreamProcessor.SimpleProcessor(required_settings, SILENT)).should.Throw();
    required_settings.width = -1;
    (() => StreamProcessor.SimpleProcessor(required_settings, SILENT)).should.Throw();
    required_settings.width = 0.1;
    (() => StreamProcessor.SimpleProcessor(required_settings, SILENT)).should.Throw();
    required_settings.width = 320;

    // Height
    required_settings.height = 0;
    (() => StreamProcessor.SimpleProcessor(required_settings, SILENT)).should.Throw();
    required_settings.height = -1;
    (() => StreamProcessor.SimpleProcessor(required_settings, SILENT)).should.Throw();
    required_settings.height = 0.1;
    (() => StreamProcessor.SimpleProcessor(required_settings, SILENT)).should.Throw();
    required_settings.height = 240;

    // Quality
    required_settings.quality = 0;
    (() => StreamProcessor.SimpleProcessor(required_settings, SILENT)).should.Throw();
    required_settings.quality = -1;
    (() => StreamProcessor.SimpleProcessor(required_settings, SILENT)).should.Throw();
    required_settings.quality = 0.1;
    (() => StreamProcessor.SimpleProcessor(required_settings, SILENT)).should.Throw();
    required_settings.quality = 101;
    (() => StreamProcessor.SimpleProcessor(required_settings, SILENT)).should.Throw();
    required_settings.quality = 90;
  });

  it("should throw error on invalid text settings argument", () => {
    // Font Size
    text_settings.font_size = 0;
    (() => StreamProcessor.TextOverlay(required_settings, text_settings, SILENT)).should.Throw();
    text_settings.font_size = -1;
    (() => StreamProcessor.TextOverlay(required_settings, text_settings, SILENT)).should.Throw();
    text_settings.font_size = 0.1;
    (() => StreamProcessor.TextOverlay(required_settings, text_settings, SILENT)).should.Throw();
    text_settings.font_size = 9;
  });

  it("should throw error on invalid device and motion settings argument", () => {
    // gaussian size
    motion_settings.gaussian_size = -1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.gaussian_size = 0.1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.gaussian_size = 0;
    // scale denominator
    motion_settings.scale_denominator = -1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.scale_denominator = 0.1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.scale_denominator = 1;
    // background stabilization length
    motion_settings.bg_stabil_length = 0;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.bg_stabil_length = -1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.bg_stabil_length = 0.1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.bg_stabil_length = 10;
    // motion stabilization length
    motion_settings.motion_stabil_length = 0;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.motion_stabil_length = -1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.motion_stabil_length = 0.1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.motion_stabil_length = 1;
    // minimum pixel difference
    motion_settings.min_pixel_diff = -1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.min_pixel_diff = 0.1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.min_pixel_diff = 10;
    // minimum changed pixels
    motion_settings.min_changed_pixels = -0.001;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.min_changed_pixels = -1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.min_changed_pixels = 1.001;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.min_changed_pixels = 0.1;
    // motion fps scale
    motion_settings.motion_fps_scale = 0;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.motion_fps_scale = -1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.motion_fps_scale = 0.1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    motion_settings.motion_fps_scale = 1;

    // device choice
    device_settings.device_choice = -1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    device_settings.device_choice = 0.1;
    (() => StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT)).should.Throw();
    device_settings.device_choice = 0;
  });
});

describe("Process Frame", () => {
  const required_settings = {
    width: 640,
    height: 480,
    format: SPEnums.Format.kRGB,
    quality: 100
  };
  const motion_settings = {
    gaussian_size: 0,
    scale_denominator: 1,
    bg_stabil_length: 2,
    motion_stabil_length: 1,
    min_pixel_diff: 1,
    min_changed_pixels: 0.1,
    motion_fps_scale: 1
  };
  const device_settings = {
    device_type: SPEnums.DeviceType.kSpecific,
    device_choice: 0
  };

  const base_image = fs.readFileSync(path.join(__dirname, "..", "..", "test-images", "640x480-test-image.jpg"));
  const changed_image = fs.readFileSync(path.join(__dirname, "..", "..", "test-images", "640x480-test-image-changed.jpg"));

  it("should not detect motion with motion detection off", () => {
    const processor = StreamProcessor.SimpleProcessor(required_settings, SILENT);

    for (let i = 0; i < 5; i++) {
      const processed = processor.ProcessFrame(base_image);
      processed.motion.should.be.false;
    }
  });

  it("should not detect motion on unchanged frames", () => {
    const processor = StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT);

    for (let i = 0; i < 5; i++) processor.ProcessFrame(base_image);

    for (let i = 0; i < 5; i++) {
      const processed = processor.ProcessFrame(base_image, 1000);
      processed.motion.should.be.false;
    }
  });

  it("should detect motion on every other frame", () => {
    motion_settings.motion_fps_scale = 2;
    const processor = StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings, SILENT);

    for (let i = 0; i < 5; i++) processor.ProcessFrame(base_image);

    for (let i = 0; i < 5; i++) {
      const processed = processor.ProcessFrame(base_image);
      processed.motion.should.be.false;
    }
    const processed0 = processor.ProcessFrame(changed_image);
    processed0.motion.should.be.false;
    const processed1 = processor.ProcessFrame(changed_image);
    processed1.motion.should.be.true;

  });
});

describe("List devices", () => {
  it("should give list of devices as array", (done) => {
    StreamProcessor.ListDevices(SPEnums.DeviceType.kSpecific)
      .then((devices) => {
        devices.length.should.be.greaterThanOrEqual(0);
        done();
      })
      .catch((error) => {
        done(error);
      });

  });
});