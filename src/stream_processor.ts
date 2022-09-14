import { spawn } from "child_process";
import path from "path";

import * as utils from "./utils";

import * as SPTypes from "./stream_processor_types";
import * as SPEums from "./stream_processor_enums";
import * as SPDefaults from "./stream_processor_defaults";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const addon = require(utils.FindFile("node-stream-processor.node", path.join(__dirname, "..")));

export default class StreamProcessor {
  private wrapped_: typeof addon.StreamProcessorWrap;

  /**
   * Constructs a new StreamProcessor 
   * * You probably shouldn't use this. Use SimpleProcessor(), TextOverlay(), MotionDetection(), or FullProcessor() instead
   * @param options - Options for StreamProcessor with properties:
   * * silent - Output debug messages or not
   * * required_settings - Required settings for all stream processors
   * * text_settings - Settings for displaying text
   * * motion_settings - Settings for motion detection
   * * device_settings - Settings for device to run motion detection on
   */
  constructor(options: {
    silent: boolean;
    required_settings: SPTypes.RequiredSettings;
    text_settings?: SPTypes.TextSettings;
    motion_settings?: SPTypes.MotionSettings;
    device_settings?: SPTypes.DeviceSettings;
  }) {
    // Apply defaults
    let req_set = Object.assign({}, SPDefaults.DEFAULT_REQUIRED);
    req_set = Object.assign(req_set, options.required_settings);
    let text_set = Object.assign({}, SPDefaults.DEFAULT_TEXT);
    text_set = Object.assign(text_set, options.text_settings);
    let motion_set = Object.assign({}, SPDefaults.DEFAULT_MOTION);
    motion_set = Object.assign(motion_set, options.motion_settings);
    let device_set = Object.assign({}, SPDefaults.DEFAULT_DEVICE);
    device_set = Object.assign(device_set, options.device_settings);

    // Validate settings
    this.ValidateSettings(req_set, text_set, motion_set, device_set);

    // Create wrapped interface
    if (options.motion_settings && options.text_settings) this.wrapped_ = new addon.StreamProcessorWrap(options.silent, req_set, text_set, motion_set, device_set);
    else if (options.text_settings) this.wrapped_ = new addon.StreamProcessorWrap(options.silent, req_set, text_set);
    else if (options.motion_settings) this.wrapped_ = new addon.StreamProcessorWrap(options.silent, req_set, motion_set, device_set);
    else this.wrapped_ = new addon.StreamProcessorWrap(options.silent, req_set);
  }

  /**
   * SimpleProcessor() - Constructs a new StreamProcessor that does nothing but decompress and compress jpeg
   * @param required_settings - Required settings for all stream processors
   * @param silent - Output debug messages or not
   */
  static SimpleProcessor(required_settings: SPTypes.RequiredSettings, silent?: boolean) {
    silent = (silent === true);
    return new StreamProcessor({ silent, required_settings });
  }

  /**
   * TextOverlay() - Constructs a new StreamProcessor that overlays camera name and time (optional) on the jpeg
   * @param required_settings - Required settings for all stream processors
   * @param text_settings - Settings for displaying text
   * @param silent - Output debug messages or not
   */
  static TextOverlay(required_settings: SPTypes.RequiredSettings, text_settings: SPTypes.TextSettings, silent?: boolean) {
    silent = (silent === true);
    return new StreamProcessor({ silent, required_settings, text_settings });
  }

  /**
   * MotionDetection() - Constructs a new StreamProcessor that detects motion on the jpeg
   * @param required_settings - Required settings for all stream processors
   * @param text_settings - Settings for displaying text
   * @param silent - Output debug messages or not
   */
  static MotionDetection(required_settings: SPTypes.RequiredSettings, motion_settings: SPTypes.MotionSettings, device_settings: SPTypes.DeviceSettings, silent?: boolean) {
    silent = (silent === true);
    return new StreamProcessor({ silent, required_settings, motion_settings, device_settings });
  }

  /**
   * FullProcessor() - Constructs a new StreamProcessor that overlays text and motion detects
   * @param required_settings - Required settings for all stream processors
   * @param text_settings - Settings for displaying text
   * @param motion_settings - Settings for motion detection
   * @param device_settings - Settings for device to run motion detection on
   * @param silent - Output debug messages or not
   */
  static FullProcessor(required_settings: SPTypes.RequiredSettings, text_settings: SPTypes.TextSettings, motion_settings: SPTypes.MotionSettings, device_settings: SPTypes.DeviceSettings, silent?: boolean) {
    silent = (silent === true);
    return new StreamProcessor({ silent, required_settings, text_settings, motion_settings, device_settings });
  }

  /**
   * ListDevices() - List Avaliable OpenCL devices
   * @param device_type - Type of devices to list
   * @returns Promise that resolves to array of names of devices (index is their id)
   */
  static async ListDevices(device_type: SPEums.DeviceType): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      let location = "";
      try { location = utils.FindFile("opencl_devices", path.join(__dirname, "..")); }
      catch {
        try {
          location = utils.FindFile("opencl_devices.exe", path.join(__dirname, ".."));
        } 
        catch (error) { reject(error); }
      }
      const child = spawn(location, [device_type.toString()]);

      let devices_string = "";
      child.stdout.on("data", (data) => {
        const output = data.toString("utf8");
        devices_string = devices_string.concat(devices_string, output);
      });

      child.stdout.on("close", () => {
        const devices = devices_string.split(/\r?\n/);
        resolve(devices);
      });
    });
  }

  /**
   * ProcessFrame() - Processes a jpeg frame
   * @param buffer Buffer of jpeg image
   * @param timestamp Timestamp to overlay (optional)
   * @returns Buffer of processed jpeg image
   */
  ProcessFrame(buffer: Buffer, timestamp?: number): SPTypes.Processed {
    if (!timestamp) return this.wrapped_.ProcessFrame(buffer);
    else return this.wrapped_.ProcessFrame(buffer, timestamp);
  }

  /**
   * ValidateSettings() - Validates given settings for out of bounds values
   */
  private ValidateSettings(required_settings: SPTypes.RequiredSettings, text_settings?: SPTypes.TextSettings, motion_settings?: SPTypes.MotionSettings, device_settings?: SPTypes.DeviceSettings) {
    // Check required settings
    // Width
    if (!Number.isInteger(required_settings.width)) throw new Error("Width must be a positive integer");
    if (required_settings.width <= 0) throw new Error("Width must be a positive integer");
    // Height
    if (!Number.isInteger(required_settings.height)) throw new Error("Height must be a positive integer");
    if (required_settings.height <= 0) throw new Error("Height must be a positive integer");
    // Quality
    if (!Number.isInteger(required_settings.quality)) throw new Error("Width must be a positive integer");
    if (required_settings.quality <= 0 || required_settings.quality > 100) throw new Error("Quality must be an integer between 0-100 (inclusive)");

    // Check text settings
    if (text_settings) {
      if (!Number.isInteger(text_settings.font_size)) throw new Error("Font size must be a positive number");
      if (text_settings.font_size <= 0) throw new Error("Font size must be a positive number");
    }

    // Check motion and device settings
    if (device_settings || motion_settings) {
      if (!(device_settings && motion_settings)) throw new Error("Both MotionSettings and DeviceSettings must be set together");

      // Gaussian size
      if (!Number.isInteger(motion_settings.gaussian_size)) throw new Error("Gaussian size must be a non-negative integer");
      if (motion_settings.gaussian_size < 0) throw new Error("Gaussian size must be a non-negative integer");
      // Scale denominator
      if (!Number.isInteger(motion_settings.scale_denominator)) throw new Error("Scale denominator must be a positive integer");
      if (motion_settings.scale_denominator <= 0) throw new Error("Scale denominator must be a positive integer");
      // background stabilization length
      if (!Number.isInteger(motion_settings.bg_stabil_length)) throw new Error("Background stabilization length must be a non-negative integer");
      if (motion_settings.bg_stabil_length <= 0) throw new Error("Background stabilization length must be a non-negative integer");
      // motion stabilization length
      if (!Number.isInteger(motion_settings.motion_stabil_length)) throw new Error("Movement stabilization length size must be a non-negative integer");
      if (motion_settings.motion_stabil_length <= 0) throw new Error("Movement stabilization length size must be a non-negative integer");
      // minimum pixel difference
      if (!Number.isInteger(motion_settings.min_pixel_diff)) throw new Error("Minimum pixel difference must be a positive integer");
      if (motion_settings.min_pixel_diff < 0) throw new Error("Minimum pixel difference must be a positive integer");
      // minimum changed pixels
      if (motion_settings.min_changed_pixels < 0 || motion_settings.min_changed_pixels > 1.0) throw new Error("Minimum changed pixels must be between 0-1 (inclusive)");
      // motion fps scale
      if (!Number.isInteger(motion_settings.motion_fps_scale)) throw new Error("Motion FPS scale must be a non-negative integer");
      if (motion_settings.motion_fps_scale <= 0) throw new Error("Motion FPS scale must be a positive integer");
      // device choice
      if (!Number.isInteger(device_settings.device_choice)) throw new Error("Device choice id must be a non-negative integer");
      if (device_settings.device_choice < 0) throw new Error("Device choice id must be a non-negative integer");
    }
  }
}