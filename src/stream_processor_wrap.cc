#include "stream_processor_wrap.hpp"

#include <napi.h>

#include <iostream>
#include <map>
#include <vector>

#include "stream_processor.hpp"

// Types of object arguments
enum class ArgType { kRequired = 0, kText = 1, kMotion = 2, kDevice = 3 };
std::map<uint32_t, ArgType> arg_type_converter = {{0, ArgType::kRequired}, {1, ArgType::kText}, {2, ArgType::kMotion}, {3, ArgType::kDevice}};
std::map<uint32_t, CompFrameFormat> comp_format_converter = {{0, CompFrameFormat::kRGB}, {1, CompFrameFormat::kGray}};
std::map<uint32_t, TextPosition> text_position_converter = {{0, TextPosition::kTop}, {1, TextPosition::kBottom}};
std::map<uint32_t, DeviceType> device_type_converter = {{0, DeviceType::kCPU}, {1, DeviceType::kGPU}, {2, DeviceType::kSpecific}};

Napi::Object StreamProcessorWrap::Init(Napi::Env env, Napi::Object exports) {
  // Define class methods
  Napi::Function func = DefineClass(env, "StreamProcessorWrap", {InstanceMethod("ProcessFrame", &StreamProcessorWrap::ProcessFrameWrap)});

  // Create constructor reference
  Napi::FunctionReference* constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  exports.Set("StreamProcessorWrap", func);

  env.SetInstanceData(constructor);
  return exports;
}

StreamProcessorWrap::StreamProcessorWrap(const Napi::CallbackInfo& info) : Napi::ObjectWrap<StreamProcessorWrap>(info) {
  Napi::Env env = info.Env();

  // Throw error if there are no or too many arguments
  size_t length = info.Length();
  if (length <= 0) Napi::TypeError::New(env, "Requires At Least 1 Argument").ThrowAsJavaScriptException();
  if (length > 5) Napi::TypeError::New(env, "More Than Maximum Of 5 Arguments Supplied").ThrowAsJavaScriptException();

  if (info[0].IsBoolean() && !info[0].ToBoolean()) {
    SetOutput(&std::cout);
  }

  // Parse arguments
  bool found_required = false;
  bool found_text = false;
  bool found_motion = false;
  bool found_device = false;
  MotionConfig motion_config;
  DeviceConfig device_config;
  for (int i = 1; i < length; i++) {
    // Throw error if arguments are not objects
    if (!info[i].IsObject()) Napi::TypeError::New(env, "Expected Only Object Arguments").ThrowAsJavaScriptException();

    // Throw error if object does not have type propety that is a number
    Napi::Object processor_args = info[i].ToObject();
    if (!processor_args.Has("type")) Napi::TypeError::New(env, "Expected Object Arguments To Have Property: 'type'").ThrowAsJavaScriptException();
    if (!processor_args.Get("type").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'type' To Be Number").ThrowAsJavaScriptException();

    // Determine ArgType of object
    if (!arg_type_converter.contains(processor_args.Get("type").ToNumber().Uint32Value())) Napi::TypeError::New(env, "Property: 'type' Was Not Valid").ThrowAsJavaScriptException();
    ArgType type = arg_type_converter.at(processor_args.Get("type").ToNumber().Uint32Value());

    if (type == ArgType::kRequired) {
      if (found_required) Napi::TypeError::New(env, "Required Object Argument Given More Than 1 Time").ThrowAsJavaScriptException();
      found_required = true;

      // Check required properties and throw error if not set
      // width
      if (!processor_args.Has("width")) Napi::TypeError::New(env, "Expected Required Object Arguments To Have Property: 'width'").ThrowAsJavaScriptException();
      if (!processor_args.Get("width").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'width' To Be Number").ThrowAsJavaScriptException();
      // height
      if (!processor_args.Has("height")) Napi::TypeError::New(env, "Expected Required Object Arguments To Have Property: 'height'").ThrowAsJavaScriptException();
      if (!processor_args.Get("height").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'height' To Be Number").ThrowAsJavaScriptException();
      // format
      if (!processor_args.Has("format")) Napi::TypeError::New(env, "Expected Required Object Arguments To Have Property: 'format'").ThrowAsJavaScriptException();
      if (!processor_args.Get("format").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'format' To Be Number").ThrowAsJavaScriptException();
      if (!comp_format_converter.contains(processor_args.Get("format").ToNumber().Uint32Value())) Napi::TypeError::New(env, "Property: 'format' Was Not Valid").ThrowAsJavaScriptException();
      // quality
      if (!processor_args.Has("quality")) Napi::TypeError::New(env, "Expected Required Object Arguments To Have Property: 'quality'").ThrowAsJavaScriptException();
      if (!processor_args.Get("quality").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'quality' To Be Number").ThrowAsJavaScriptException();

      uint32_t width = processor_args.Get("width").ToNumber().Uint32Value();
      uint32_t height = processor_args.Get("height").ToNumber().Uint32Value();
      uint32_t format = processor_args.Get("format").ToNumber().Uint32Value();
      uint32_t quality = processor_args.Get("quality").ToNumber().Uint32Value();

      try {
        SetRequired(static_cast<unsigned int>(width), static_cast<unsigned int>(height), comp_format_converter.at(format), static_cast<int>(quality));
      } catch (std::exception& e) {
        std::cout << e.what() << std::endl;
        Napi::TypeError::New(env, "Exception Setting Required").ThrowAsJavaScriptException();
      } catch (...) {
        Napi::TypeError::New(env, "Unknown Exception Setting Required").ThrowAsJavaScriptException();
      }
    } else if (type == ArgType::kText) {
      if (found_text) Napi::TypeError::New(env, "Text Object Argument Given More Than 1 Time").ThrowAsJavaScriptException();
      found_text = true;

      // Check required properties and throw error if not set
      // cam_name
      if (!processor_args.Has("cam_name")) Napi::TypeError::New(env, "Expected Text Object Arguments To Have Property: 'cam_name'").ThrowAsJavaScriptException();
      if (!processor_args.Get("cam_name").IsString()) Napi::TypeError::New(env, "Expected Property: 'cam_name' To Be String").ThrowAsJavaScriptException();
      // text_position
      if (!processor_args.Has("text_position")) Napi::TypeError::New(env, "Expected Text Object Arguments To Have Property: 'text_position'").ThrowAsJavaScriptException();
      if (!processor_args.Get("text_position").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'text_position' To Be Number").ThrowAsJavaScriptException();
      if (!text_position_converter.contains(processor_args.Get("text_position").ToNumber().Uint32Value()))
        Napi::TypeError::New(env, "Property: 'text_position' Was Not Valid").ThrowAsJavaScriptException();
      // show_date
      if (!processor_args.Has("show_date")) Napi::TypeError::New(env, "Expected Text Object Arguments To Have Property: 'show_date'").ThrowAsJavaScriptException();
      if (!processor_args.Get("show_date").IsBoolean()) Napi::TypeError::New(env, "Expected Property: 'show_date' To Be Boolean").ThrowAsJavaScriptException();
      // font_size
      if (!processor_args.Has("font_size")) Napi::TypeError::New(env, "Expected Text Object Arguments To Have Property: 'font_size'").ThrowAsJavaScriptException();
      if (!processor_args.Get("font_size").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'font_size' To Be Number").ThrowAsJavaScriptException();
      // font_path
      if (!processor_args.Has("font_path")) Napi::TypeError::New(env, "Expected Text Object Arguments To Have Property: 'font_path'").ThrowAsJavaScriptException();
      if (!processor_args.Get("font_path").IsString()) Napi::TypeError::New(env, "Expected Property: 'font_path' To Be String").ThrowAsJavaScriptException();

      std::string cam_name = processor_args.Get("cam_name").ToString().Utf8Value();
      std::uint32_t text_position = processor_args.Get("text_position").ToNumber().Uint32Value();
      bool show_date = processor_args.Get("show_date").ToBoolean().Value();
      std::uint32_t font_size = processor_args.Get("font_size").ToNumber().Uint32Value();
      std::string font_path = processor_args.Get("font_path").ToString().Utf8Value();

      try {
        SetFont({cam_name, text_position_converter.at(text_position), show_date, static_cast<unsigned int>(font_size), font_path});
      } catch (std::exception& e) {
        std::cout << e.what() << std::endl;
        Napi::TypeError::New(env, "Exception Setting Font").ThrowAsJavaScriptException();
      } catch (...) {
        Napi::TypeError::New(env, "Unknown Exception Setting Font").ThrowAsJavaScriptException();
      }
    } else if (type == ArgType::kMotion) {
      if (found_motion) Napi::TypeError::New(env, "Motion Object Argument Given More Than 1 Time").ThrowAsJavaScriptException();
      found_motion = true;

      // Check required properties and throw error if not set
      // gaussian_size
      if (!processor_args.Has("gaussian_size")) Napi::TypeError::New(env, "Expected Motion Object Arguments To Have Property: 'gaussian_size'").ThrowAsJavaScriptException();
      if (!processor_args.Get("gaussian_size").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'gaussian_size' To Be Number").ThrowAsJavaScriptException();
      // scale_denominator
      if (!processor_args.Has("scale_denominator")) Napi::TypeError::New(env, "Expected Motion Object Arguments To Have Property: 'scale_denominator'").ThrowAsJavaScriptException();
      if (!processor_args.Get("scale_denominator").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'scale_denominator' To Be Number").ThrowAsJavaScriptException();
      // bg_stabil_length
      if (!processor_args.Has("bg_stabil_length")) Napi::TypeError::New(env, "Expected Motion Object Arguments To Have Property: 'bg_stabil_length'").ThrowAsJavaScriptException();
      if (!processor_args.Get("bg_stabil_length").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'bg_stabil_length' To Be Number").ThrowAsJavaScriptException();
      // motion_stabil_length
      if (!processor_args.Has("motion_stabil_length")) Napi::TypeError::New(env, "Expected Motion Object Arguments To Have Property: 'motion_stabil_length'").ThrowAsJavaScriptException();
      if (!processor_args.Get("motion_stabil_length").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'motion_stabil_length' To Be Number").ThrowAsJavaScriptException();
      // min_pixel_diff
      if (!processor_args.Has("min_pixel_diff")) Napi::TypeError::New(env, "Expected Motion Object Arguments To Have Property: 'min_pixel_diff'").ThrowAsJavaScriptException();
      if (!processor_args.Get("min_pixel_diff").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'min_pixel_diff' To Be Number").ThrowAsJavaScriptException();
      // min_changed_pixels
      if (!processor_args.Has("min_changed_pixels")) Napi::TypeError::New(env, "Expected Motion Object Arguments To Have Property: 'min_changed_pixels'").ThrowAsJavaScriptException();
      if (!processor_args.Get("min_changed_pixels").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'min_changed_pixels' To Be Number").ThrowAsJavaScriptException();
      // motion_fps_scale
      if (!processor_args.Has("motion_fps_scale")) Napi::TypeError::New(env, "Expected Motion Object Arguments To Have Property: 'motion_fps_scale'").ThrowAsJavaScriptException();
      if (!processor_args.Get("motion_fps_scale").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'motion_fps_scale' To Be Number").ThrowAsJavaScriptException();
      // motion_fps_scale
      if (!processor_args.Has("kBlurScaleVerticalFile")) Napi::TypeError::New(env, "Expected Motion Object Arguments To Have Property: 'kBlurScaleVerticalFile'").ThrowAsJavaScriptException();
      if (!processor_args.Get("kBlurScaleVerticalFile").IsString()) Napi::TypeError::New(env, "Expected Property: 'kBlurScaleVerticalFile' To Be String").ThrowAsJavaScriptException();
      // motion_fps_scale
      if (!processor_args.Has("kBlurScaleHorizontalFile")) Napi::TypeError::New(env, "Expected Motion Object Arguments To Have Property: 'kBlurScaleHorizontalFile'").ThrowAsJavaScriptException();
      if (!processor_args.Get("kBlurScaleHorizontalFile").IsString()) Napi::TypeError::New(env, "Expected Property: 'kBlurScaleHorizontalFile' To Be String").ThrowAsJavaScriptException();
      // motion_fps_scale
      if (!processor_args.Has("kStabilizeFile")) Napi::TypeError::New(env, "Expected Motion Object Arguments To Have Property: 'kStabilizeFile'").ThrowAsJavaScriptException();
      if (!processor_args.Get("kStabilizeFile").IsString()) Napi::TypeError::New(env, "Expected Property: 'kStabilizeFile' To Be String").ThrowAsJavaScriptException();

      uint32_t gaussian_size = processor_args.Get("gaussian_size").ToNumber().Uint32Value();
      uint32_t scale_denominator = processor_args.Get("scale_denominator").ToNumber().Uint32Value();
      uint32_t bg_stabil_length = processor_args.Get("bg_stabil_length").ToNumber().Uint32Value();
      uint32_t motion_stabil_length = processor_args.Get("motion_stabil_length").ToNumber().Uint32Value();
      uint32_t min_pixel_diff = processor_args.Get("min_pixel_diff").ToNumber().Uint32Value();
      float min_changed_pixels = processor_args.Get("min_changed_pixels").ToNumber().FloatValue();
      uint32_t motion_fps_scale = processor_args.Get("motion_fps_scale").ToNumber().Uint32Value();

      std::string blur_scale_vertical_file = processor_args.Get("kBlurScaleVerticalFile").ToString().Utf8Value();
      std::string blur_scale_horizontal_file = processor_args.Get("kBlurScaleHorizontalFile").ToString().Utf8Value();
      std::string stabilize_file = processor_args.Get("kStabilizeFile").ToString().Utf8Value();
      std::string calculate_difference_file = processor_args.Get("kCalculateDifferenceFile").ToString().Utf8Value();

      motion_config = {
          //
          static_cast<unsigned int>(gaussian_size),
          static_cast<unsigned int>(scale_denominator),
          static_cast<unsigned int>(bg_stabil_length),
          static_cast<unsigned int>(motion_stabil_length),
          static_cast<unsigned int>(min_pixel_diff),
          min_changed_pixels,
          DecompFrameMethod::kFast,
          blur_scale_vertical_file,
          blur_scale_horizontal_file,
          stabilize_file,
          calculate_difference_file
          //
      };

      SetMotionFPSScale(static_cast<unsigned int>(motion_fps_scale));
    } else if (type == ArgType::kDevice) {
      if (found_device) Napi::TypeError::New(env, "Device Object Argument Given More Than 1 Time").ThrowAsJavaScriptException();
      found_device = true;

      // Check required properties and throw error if not set
      // device_type
      if (!processor_args.Has("device_type")) Napi::TypeError::New(env, "Expected Device Object Arguments To Have Property: 'device_type'").ThrowAsJavaScriptException();
      if (!processor_args.Get("device_type").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'device_type' To Be Number").ThrowAsJavaScriptException();
      if (!device_type_converter.contains(processor_args.Get("device_type").ToNumber().Uint32Value())) Napi::TypeError::New(env, "Property: 'device_type' Was Not Valid").ThrowAsJavaScriptException();
      // device_choice
      if (!processor_args.Has("device_choice")) Napi::TypeError::New(env, "Expected Device Object Arguments To Have Property: 'device_choice'").ThrowAsJavaScriptException();
      if (!processor_args.Get("device_choice").IsNumber()) Napi::TypeError::New(env, "Expected Property: 'device_choice' To Be Number").ThrowAsJavaScriptException();

      uint32_t device_type = processor_args.Get("device_type").ToNumber().Uint32Value();
      uint32_t device_choice = processor_args.Get("device_choice").ToNumber().Uint32Value();

      device_config = {device_type_converter.at(device_type), static_cast<int>(device_choice)};
    }
  }

  if (found_motion && found_device) {
    try {
      SetMotionSettings(motion_config, device_config);
    } catch (std::exception& e) {
      std::cout << e.what() << std::endl;

      Napi::TypeError::New(env, "Exception Setting Motion").ThrowAsJavaScriptException();
    } catch (...) {
      Napi::TypeError::New(env, "Unknown Exception Setting Motion").ThrowAsJavaScriptException();
    }
  }

  // If required settings was not found, throw error
  if (!found_required) Napi::TypeError::New(env, "Required Argument Must Be Given").ThrowAsJavaScriptException();
}
Napi::Value StreamProcessorWrap::ProcessFrameWrap(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  // Throw error if there are no or too many arguments
  size_t length = info.Length();
  if (length != 2 && length != 1) Napi::TypeError::New(env, "Requires Exactly 1 or 2 Arguments").ThrowAsJavaScriptException();

  if (!info[0].IsBuffer()) Napi::TypeError::New(env, "Expected Buffer").ThrowAsJavaScriptException();
  if (!info[1].IsNumber() && length == 2) Napi::TypeError::New(env, "Expected Number").ThrowAsJavaScriptException();

  Napi::Buffer<unsigned char*> buffer = info[0].As<Napi::Buffer<unsigned char*>>();
  Processed processed_frame;
  try {
    if (length == 1) {
      processed_frame = ProcessFrame(reinterpret_cast<unsigned char*>(buffer.Data()), buffer.Length() * sizeof(unsigned char*) * 8);
    } else {
      long long timestamp = info[1].ToNumber().Int64Value();
      processed_frame = ProcessFrame(reinterpret_cast<unsigned char*>(buffer.Data()), buffer.Length() * sizeof(unsigned char*) * 8, timestamp);
    }
  } catch (std::exception& e) {
    std::cout << e.what() << std::endl;
    Napi::TypeError::New(env, "Exception Processing Frame").ThrowAsJavaScriptException();
  } catch (...) {
    Napi::TypeError::New(env, "Unknown Exception Processing Frame").ThrowAsJavaScriptException();
  }

  Napi::Buffer<unsigned char> processed_buffer = Napi::Buffer<unsigned char>::New(info.Env(), processed_frame.compressed.frame, static_cast<size_t>(processed_frame.compressed.size),
                                                                                  [](Napi::Env env, void* finalizeData) { delete[] static_cast<unsigned char*>(finalizeData); });

  Napi::Object processed = Napi::Object::New(info.Env());
  processed.Set("compressed", processed_buffer);
  processed.Set("motion", processed_frame.motion);
  return processed;
}

Napi::Object InitAll(Napi::Env env, Napi::Object exports) { return StreamProcessorWrap::Init(env, exports); }

NODE_API_MODULE(addon, InitAll)