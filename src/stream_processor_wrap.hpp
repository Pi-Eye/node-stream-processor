#ifndef STREAM_PROCESSOR_WRAP_HPP
#define STREAM_PROCESSOR_WRAP_HPP

#include <napi.h>

#include "stream_processor.hpp"

class StreamProcessorWrap : public StreamProcessor, public Napi::ObjectWrap<StreamProcessorWrap> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  StreamProcessorWrap(const Napi::CallbackInfo& info);

 private:
  Napi::Value ProcessFrameWrap(const Napi::CallbackInfo& info);

  double value_;
};

#endif