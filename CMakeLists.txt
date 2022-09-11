# Set cmake version
cmake_minimum_required(VERSION "3.24")

# Name Project
project("node-stream-processor")

# Set output directory to bin
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/bin)

# Set C/C++ Version
set(CMAKE_C_STANDARD 17)
set(CMAKE_CXX_STANDARD 20)

# Set Executable Name
set(EXE_NAME "exec")
set(TEST_EXE_NAME "test")
set(BENCHMARK_EXE_NAME "benchmark")

# Grab all .cc Files In "src"
AUX_SOURCE_DIRECTORY("stream-processor/src" SP_CC_FILES)
AUX_SOURCE_DIRECTORY("stream-processor/mjpeg-motion-detector/src" MOTION_CC_FILES)

# Create Library
list(REMOVE_ITEM MOTION_CC_FILES "stream-processor/src/main.cc")
list(REMOVE_ITEM MOTION_CC_FILES "stream-processor/mjpeg-motion-detector/src/main.cc")
add_library(${PROJECT_NAME} SHARED "src/stream_processor_wrap.cc" ${SP_CC_FILES} ${MOTION_CC_FILES} ${CMAKE_JS_SRC})

# Give library a .node extension without any "lib" prefix
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")

# Local Includes
target_include_directories(${PROJECT_NAME} PRIVATE "src/stream_processor_wrap.hpp")

# Stream Processor Includes
set(STREAM_PROCESSOR_INCLUDES "stream-processor/include")
target_include_directories(${PROJECT_NAME} PRIVATE ${STREAM_PROCESSOR_INCLUDES})

# Mjpeg Motion Detector Includes
set(MJPEG_MOTION_INCLUDES "stream-processor/mjpeg-motion-detector/include")
target_include_directories(${PROJECT_NAME} PRIVATE ${MJPEG_MOTION_INCLUDES})

# cmake-js Includes
target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_JS_INC})

# Find OpenCL
find_package(OpenCL REQUIRED)
# Link library
target_link_libraries(${PROJECT_NAME} PRIVATE OpenCL::OpenCL)

# Find libjpeg-turbo
find_package(libjpeg-turbo REQUIRED)
# Link library
if (WIN32)
  target_link_libraries(${PROJECT_NAME} PRIVATE libjpeg-turbo::turbojpeg)
elseif(UNIX)
  target_link_libraries(${PROJECT_NAME} PRIVATE libjpeg-turbo::turbojpeg-static)
endif()
target_include_directories(${PROJECT_NAME} PRIVATE ${JPEG_INCLUDE_DIR})

# Find freetype
find_package(freetype CONFIG REQUIRED)
target_link_libraries(${PROJECT_NAME} PRIVATE freetype)

# Essential library files to link to a node addon,
target_link_libraries(${PROJECT_NAME} PRIVATE ${CMAKE_JS_LIB})

# Include N-API wrappers
execute_process(COMMAND node -p "require('node-addon-api').include"
        WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        )
string(REPLACE "\n" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
target_include_directories(${PROJECT_NAME} PRIVATE ${NODE_ADDON_API_DIR})

add_definitions(-DNAPI_VERSION=6)

# Create OpenCL opencl_devices executable
set(EXEC_NAME "opencl_devices")
add_executable(${EXEC_NAME} "src/opencl_devices.cc" "stream-processor/mjpeg-motion-detector/src/open_cl_interface.cc")
target_include_directories(${EXEC_NAME} PRIVATE "stream-processor/mjpeg-motion-detector/include")
# Find OpenCL and add it
find_package(OpenCL REQUIRED)
target_link_libraries(${EXEC_NAME} PRIVATE OpenCL::OpenCL)