# MJPEG Motion Detector

## About

A simple motion detector for MJPEG streams.

### Built With

* C++
* OpenCL
* libjpeg-turbo

## Getting Started

### Prerequisites

1. An OpenCL 1.2 compatible device ([compatability list](https://www.khronos.org/conformance/adopters/conformant-products/opencl))

2. [vcpkg](https://vcpkg.io/en/index.html)

3. [Cmake](https://cmake.org/)

### Installation

1. Install dependencies
    ```sh
    vcpkg install opencl libjpeg-turbo
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
    
3. Install NPM package
    ```sh
    npm run install
    ```
## Usage

### Example Motion Detector


## License

Distributed uner the GPL-3.0 License. See `LICENSE.txt` for more information.

## Contact

Bennett Wu - bwu1324@gmail.com