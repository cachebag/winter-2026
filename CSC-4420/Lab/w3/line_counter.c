// Lab 1
// Author: Akrm Al-Hakim <alhakimiakrmj@gmail.com>
// This program provides TWO flags:
//  - '--print' prints the contents of each line 
//  - '--lines' returns the number of lines in a file

#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

int main(int argc, char *argv[]) {
  // Catch usage errors and print instruction
  if (argc != 3) {
    write(STDERR_FILENO,
          "Usage: program(--print|--lines) <file>\n",
          sizeof("Usage: program(--print|--lines) <file>\n") - 1);
    return 1;
  }

  // Open file in read only mode and catch errors accordingly
  int fd = open(argv[2], O_RDONLY);
  if (fd == -1) {
    perror("open");
    return 1;
  }

  // Declare 4 KB of memory for reading
  char buffer[4096];
  char line[4096];
  ssize_t bytes_read;
  size_t line_len = 0;
  long line_no = 1;

  if (strcmp(argv[1], "--print") == 0) {
      
    // Loop through bytes and write them in chunks to the terminal 
    while ((bytes_read = read(fd, buffer, sizeof buffer)) > 0) {
      for (ssize_t i = 0; i < bytes_read; i++) {
        if (buffer[i] == '\n') {
          char prefix[32];
          int plen = snprintf(prefix, sizeof prefix, "Line %ld: ", line_no++);
          write(STDOUT_FILENO, prefix, plen);

          write(STDOUT_FILENO, line, line_len);
          write(STDOUT_FILENO, "\n", 1);
          line_len = 0;
        } else {
          if (line_len < sizeof(line)) {
            line[line_len++] = buffer[i];
          }
        }
      }
    }

    if (bytes_read == -1) {
      perror("read");
      close(fd);
      return 1;
    }

    if (line_len > 0) {
        char prefix[32];
        int plen = snprintf(prefix, sizeof prefix,
                            "Line %ld: ", line_no++);
        write(STDOUT_FILENO, prefix, plen);

        write(STDOUT_FILENO, line, line_len);
        write(STDOUT_FILENO, "\n", 1);
    }

  } else if (strcmp(argv[1], "--lines") == 0) {
      
    // Store line counter
    long line_count = 0;
    int last_char = '\n'; // Track newlines 

    // Loop throug bytes and simply increment the line counter variable 
    while ((bytes_read = read(fd, buffer, sizeof(buffer))) > 0) {
      for (ssize_t i = 0; i < bytes_read; i++) {
          if (buffer[i] == '\n') {
              line_count++;
          }
          last_char = buffer[i];
        }
    }

    if (bytes_read == -1) {
      perror("read");
    }


    if (last_char != '\n') {
      line_count++;
    }

    char out[64];
    int len = snprintf(out, sizeof out, "%ld\n", line_count);
    write(STDOUT_FILENO, out, len);

  } else {
    write(STDERR_FILENO, "Unkown option\n", 15);
    close(fd);
    return 1;
  }

  close(fd);
  return 0;
}
