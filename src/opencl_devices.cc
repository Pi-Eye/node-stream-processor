#include <iostream>
#include <map>
#include <vector>

#include "open_cl_interface.hpp"

int main(int argc, char** argv) {
  std::map<int, cl_device_type> types_map = {{0, CL_DEVICE_TYPE_CPU}, {1, CL_DEVICE_TYPE_GPU}, {2, CL_DEVICE_TYPE_ALL}};
  std::size_t pos;
  cl_device_type device_type = types_map.at(std::stoi(argv[1], &pos));

  std::vector<cl::Device> devices = OpenCLInterface::ListDevices(device_type);
  for (int i = 0; i < devices.size(); i++) {
    std::cout << devices.at(i).getInfo<CL_DEVICE_NAME>() << std::endl;
  }
}