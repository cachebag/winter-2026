![[Pasted image 20260126114752.png]]

## Abstractions

An important part of Operating Systems (both theory and practical).


- **System calls are the boundary** between user space and kernel space. User programs cannot directly access hardware or kernel data structures; everything goes through controlled system calls.
    
- **Services vs. mechanisms**:
    
    - _Services_ describe _what_ the OS provides (files, processes, networking).
        
    - _Mechanisms_ describe _how_ it is implemented (system calls, scheduling algorithms, page tables).
        
- **Process abstraction details**:  
    A process typically includes:
    
    - Program code (text)
        
    - Data (heap, global variables)
        
    - Stack (function calls)
        
    - OS-managed metadata (PID, state, open files, permissions)
        
- **Address space isolation** is critical for:
    
    - Security (one process cannot read/write another’s memory)
        
    - Stability (a crashing process does not crash the OS)
        
- **Files are an abstraction too**:
    
    - Files unify access to persistent data and devices (e.g., disks, terminals, sockets).
        
    - Many OSes follow the idea that “everything is a file” (especially Unix-like systems).
        
- **Processes vs. threads (often omitted early but important)**:
    
    - A process may contain multiple threads.
        
    - Threads share the same address space but execute independently.
        
- **OS role as a resource manager**:  
    The OS multiplexes limited hardware resources (CPU, memory, disk, I/O devices) among competing processes.
    
- **Abstractions hide hardware complexity**:  
    Applications do not need to know details about CPUs, disks, or memory layout—this is the core value of OS abstractions.
    

If this is for exams, the high-yield themes are: **abstraction, isolation, protection, and controlled access via system calls**.