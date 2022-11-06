# Node Stream Processor

## About

Node Interface of Pi-Eye's Processor For MJPEG Stream

### Built With

* C++
* OpenCL
* libjpeg-turbo
* freetype

## Getting Started

### Prerequisites

1. An OpenCL 1.2 compatible device ([compatability list](https://www.khronos.org/conformance/adopters/conformant-products/opencl))

2. [vcpkg](https://vcpkg.io/en/index.html)

3. [Node](https://nodejs.org/) and npm
### Installation

1. Install dependencies
    ```sh
    vcpkg install opencl libjpeg-turbo freetype
    ```

2. Set CMAKE toolchain file

    Linux/MacOS:
      ```sh
      export CMAKE_TOOLCHAIN_FILE="[path to vcpkg]/scripts/buildsystems/vcpkg.cmake"
      ```
    Windows (Powershell):
      ```sh
      $ENV:CMAKE_TOOLCHAIN_FILE="[path to vcpkg]/scripts/buildsystems/vcpkg.cmake"
      ```
    
3. Install 2 NPM packages (this may take a long time): node-stream-processor and node-stream-processor-types
    ```sh
    npm install https://github.com/Pi-Eye/node-stream-processor https://github.com/Pi-Eye/node-stream-processor-types
    ```
## Usage

  ```js
import StreamProcessor from "node-stream-processor";
import { SPEnums } from "node-stream-processor-types";

const required_settings = {       // required setting for processor
    width: 640,
    height: 480,
    format: SPEnums.Format.kRGB,
    quality: 90
  };
  const text_settings = {       // setting for text overlay
    cam_name: "Test",
    text_position: SPEnums.TextPosition.kBottom,
    show_date: true,
    font_size: 9,
    font_path: path.join(__dirname, "some_font.ttf")
  };
  const motion_settings = {   // settings for motion detection
    gaussian_size: 0,
    scale_denominator: 1,
    bg_stabil_length: 10,
    motion_stabil_length: 1,
    min_pixel_diff: 10,
    min_changed_pixels: 0.1,
    motion_fps_scale: 1
  };
  const device_settings = {   // settings for device to run motion detection on
    device_type: SPEnums.DeviceType.kSpecific,
    device_choice: 0
  };

  const processor = StreamProcessor.SimpleProcessor(required_settings);                                           // Does nothing but recompress jpeg
  processor = StreamProcessor.TextOverlay(required_settings, text_settings);                                      // Overlays text
  processor = StreamProcessor.MotionDetection(required_settings, motion_settings, device_settings);               // Detects motion
  processor = StreamProcessor.FullProcessor(required_settings, text_settings, motion_settings, device_settings);  // Overlays text and detects motion

  const frame = fs.readFileSync("frame.jpg");       // just a jpg buffer

  const processed = processor.ProcessFrame(frame);

  console.log(frame.compressed);      // compressed frame (with text overlay if enabled)
  console.log(frame.motion);          // motion detected on frame or not
  ```

### Example Motion Detector


## License

Distributed uner the GPL-3.0 License. See `LICENSE.txt` for more information.

## Contact

Bennett Wu - bwu1324@gmail.com