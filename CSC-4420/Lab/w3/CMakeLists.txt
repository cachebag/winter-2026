cmake_minimum_required(VERSION 3.16)

project(linecounter C)

add_executable(linecounter line_counter.c)

target_compile_options(linecounter PRIVATE
  -Wall
  -Wextra
  -O2
)
