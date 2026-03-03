export interface Flashcard {
  front: string;
  back: string;
}

export interface Part {
  title: string;
  cards: Flashcard[];
}

export const parts: Part[] = [
  {
    title: "Part 1: Processes",
    cards: [
      {
        front: "What is a process?",
        back: "A program in execution. A single program can have multiple processes. It is a fundamental OS abstraction for resource allocation, accounting, and limiting.",
      },
      {
        front: "How many physical program counters exist per CPU core?",
        back: "One. The CPU switches between processes (multiprogramming), saving and restoring each process's logical program counter.",
      },
      {
        front: "What is multiprogramming?",
        back: "The CPU switches back and forth between processes. Each process has its own logical program counter. Only one process is active on a given CPU at any instant, but all make progress over time.",
      },
      {
        front: "What are the properties of concurrent processes?",
        back: "They are mutually independent, need explicit IPC to interact, the CPU is allocated in turns, and the OS normally offers no timing or ordering guarantees.",
      },
      {
        front: "How are process hierarchies structured?",
        back: "The OS creates one init process. A parent process can create child processes, forming a tree-like structure and process groups.",
      },
      {
        front: "What are the 4 events that cause process creation?",
        back: "1) System initialization\n2) Execution of a process-creation system call by a running process\n3) A user request to create a new process\n4) Initiation of a batch job",
      },
      {
        front: "What are the 4 conditions that terminate a process?",
        back: "1) Normal exit (voluntary)\n2) Error exit (voluntary)\n3) Fatal error (involuntary)\n4) Killed by another process (involuntary)",
      },
      {
        front: "What does fork() do?",
        back: "Creates a new process. The child is a \"private\" clone of the parent and shares some resources.",
      },
      {
        front: "What does exec() do?",
        back: "Executes a new process image. Used in combination with fork().",
      },
      {
        front: "What does exit() do?",
        back: "Causes voluntary process termination. The exit status is returned to the parent.",
      },
      {
        front: "What does kill() do?",
        back: "Sends a signal to a process (or group). Can cause involuntary termination.",
      },
      {
        front: "What are the 3 process states?",
        back: "Running: actually using the CPU\nReady: runnable but temporarily stopped\nBlocked: unable to run until some external event happens",
      },
      {
        front: "Describe the 4 process state transitions.",
        back: "1) Running → Blocked: process blocks on I/O\n2) Running → Ready: scheduler preempts (quantum expired)\n3) Ready → Running: scheduler picks this process\n4) Blocked → Ready: external event occurs (e.g., I/O completes)",
      },
      {
        front: "Can a process transition directly from Blocked to Running?",
        back: "No. It must go through Ready first. The scheduler controls the Ready → Running transition.",
      },
      {
        front: "Who controls transitions 2 and 3 in the process state model?",
        back: "The scheduler. A process cannot give the CPU to another process without going through the scheduler.",
      },
      {
        front: "What is the Process Control Block (PCB)?",
        back: "An entry in the Process Table that stores per-process info: registers, PC, stack pointer, state, priority, PID, parent PID, CPU time used, memory segment pointers, file descriptors, user/group IDs, etc.",
      },
      {
        front: "What are the 3 categories of information in a PCB?",
        back: "1) Process management: registers, PC, state, priority, PID, etc.\n2) Memory management: pointers to text, data, stack segments\n3) File management: root dir, working dir, file descriptors, UID, GID",
      },
      {
        front: "What is an interrupt vector?",
        back: "Associated with each I/O device and interrupt line; part of the Interrupt Descriptor Table (IDT); contains the start address of an interrupt handler.",
      },
      {
        front: "What are the 8 steps when an interrupt occurs?",
        back: "1) Hardware stacks PC\n2) Hardware loads new PC from interrupt vector\n3) Assembly saves registers\n4) Assembly sets up new stack\n5) C interrupt service runs\n6) Scheduler decides next process\n7) C procedure returns to assembly\n8) Assembly starts new current process",
      },
      {
        front: "How does CPU utilization relate to number of processes and I/O wait?",
        back: "Low I/O wait (20%): near 100% utilization with 2–3 processes. High I/O wait (80%): even 10 processes may not reach 100%. There are diminishing returns as more processes are added.",
      },
    ],
  },
  {
    title: "Part 2: Threads",
    cards: [
      {
        front: "What is a thread?",
        back: "A lightweight process that allows space- and time-efficient parallelism within a single process. Default: 1 process = 1 thread. Multithreaded: 1 process = N threads.",
      },
      {
        front: "Give an example of thread usage in a word processor.",
        back: "One thread for user interaction, one for reformatting, and one for auto-saving.",
      },
      {
        front: "Give an example of thread usage in a web server.",
        back: "A dispatcher thread accepts requests, and worker threads handle them.",
      },
      {
        front: "What is shared between threads in the same process?",
        back: "Address space, global variables, open files, child processes, pending alarms, signals and signal handlers, accounting information.",
      },
      {
        front: "What is private to each thread?",
        back: "Program counter, registers, stack, and state.",
      },
      {
        front: "How do threads communicate with each other?",
        back: "Through shared data in the same address space. They synchronize via simple primitives.",
      },
      {
        front: "What are user-level threads?",
        back: "Thread management done entirely in user space. Pros: fast switching (no mode switch), scalable, customizable. Cons: blocking syscalls block the entire process, requires app cooperation.",
      },
      {
        front: "What are kernel-level threads?",
        back: "Thread management done by the kernel. The kernel is aware of all threads and can schedule them independently.",
      },
      {
        front: "What is a hybrid thread implementation?",
        back: "Multiplexes user-level threads onto kernel-level threads, combining advantages of both approaches.",
      },
      {
        front: "What are common thread issues?",
        back: "Does the OS track threads? What happens on fork() — clone all or only calling thread? Blocking syscalls? Signal delivery? Per-thread storage (TLS)? Are threads needed inside the OS?",
      },
    ],
  },
  {
    title: "Part 3: IPC & Synchronization",
    cards: [
      {
        front: "Why is IPC needed?",
        back: "Processes need to communicate (share data) and synchronize to account for dependencies and avoid interfering with each other. Also applies to multithreaded execution.",
      },
      {
        front: "What is a race condition?",
        back: "When multiple processes access shared data concurrently and the result depends on the order/timing of execution.",
      },
      {
        front: "Describe the classic print spooler race condition.",
        back: "Process A reads in=7, gets suspended. Process B also reads in=7, writes at 7, sets in=8. Process A resumes and writes at 7, overwriting B's file. Reading/updating 'in' should be atomic.",
      },
      {
        front: "What is a critical region?",
        back: "A code section that accesses shared resources.",
      },
      {
        front: "What are the 4 requirements for a correct critical region solution?",
        back: "1) Mutual exclusion: no two processes in critical region simultaneously\n2) No speed assumptions about CPUs\n3) No blocking from outside: processes outside CR can't block others\n4) Bounded waiting: no process waits forever",
      },
      {
        front: "Why doesn't disabling interrupts solve mutual exclusion?",
        back: "It only works for single-CPU systems. Not suitable for multiprocessor systems.",
      },
      {
        front: "Why don't lock variables work for mutual exclusion?",
        back: "Races now occur on the lock variables themselves.",
      },
      {
        front: "Why doesn't strict alternation work?",
        back: "It doesn't permit processes to enter critical regions two times in a row. A process outside the CR can block another one, violating requirement #3.",
      },
      {
        front: "What is Peterson's Solution?",
        back: "A correct software solution for mutual exclusion with busy waiting. Uses a 'turn' variable and an interested[] array. Both processes set interest and defer via the turn variable. Satisfies all 4 requirements but involves busy waiting.",
      },
      {
        front: "What is the Producer-Consumer problem?",
        back: "A producer generates data into a finite buffer, a consumer takes data out. Must prevent: writing to full buffer, reading from empty buffer, and race conditions on buffer/count.",
      },
      {
        front: "What is a semaphore?",
        back: "A special integer type with two atomic operations: down (P/wait) and up (V/signal). All operations are guaranteed atomic by the OS.",
      },
      {
        front: "How does semaphore down (P/wait) work?",
        back: "If sema > 0, decrement it. If sema == 0, block the calling process.",
      },
      {
        front: "How does semaphore up (V/signal) work?",
        back: "If there is a process blocked on this semaphore, wake it up. Otherwise, increment sema.",
      },
      {
        front: "What is a binary semaphore?",
        back: "A semaphore with values 0 or 1, also called a mutex.",
      },
      {
        front: "What 3 semaphores are used in the Producer-Consumer solution?",
        back: "full (init 0): counts filled slots\nempty (init N): counts empty slots\nmutex (init 1): ensures mutual exclusion on buffer access",
      },
      {
        front: "What is the Producer's semaphore sequence?",
        back: "down(empty) → down(mutex) → produce → up(mutex) → up(full)",
      },
      {
        front: "What is the Consumer's semaphore sequence?",
        back: "down(full) → down(mutex) → consume → up(mutex) → up(empty)",
      },
      {
        front: "What is the Readers/Writers problem?",
        back: "N processes access shared data. At any time: multiple readers OR exactly 1 writer (never both). Concern: potential writer starvation.",
      },
      {
        front: "What is message passing?",
        back: "Solves both synchronization and communication. Most common in multiserver OS designs. Uses send(destination, &message) and receive(source, &message).",
      },
      {
        front: "What is a barrier?",
        back: "A synchronization mechanism where no process may proceed to the next phase until all processes are ready. 3 stages: approach, block, release when last arrives.",
      },
      {
        front: "What is priority inversion?",
        back: "When a medium-priority task runs before a high-priority task because a low-priority task holds a mutex the high-priority task needs. The medium task preempts the low task, delaying the high task.",
      },
      {
        front: "Describe the Mars Pathfinder priority inversion scenario.",
        back: "Low-priority task acquires mutex → gets preempted by medium-priority → high-priority tries to acquire mutex and blocks → medium runs before high, inverting priority.",
      },
      {
        front: "What are 4 solutions to priority inversion?",
        back: "1) Disable interrupts in critical region\n2) Priority ceiling: associate priority with mutex, assign to holder\n3) Priority inheritance: low inherits high's priority temporarily\n4) Random boosting: randomly boost mutex-holder's priority",
      },
      {
        front: "What is Read-Copy-Update (RCU)?",
        back: "An instance of relativistic programming. Tolerates conflicts between readers and writers rather than avoiding them. Readers see either old or new version, never a mix.",
      },
      {
        front: "What are the 3 steps a writer performs in RCU?",
        back: "1) Atomically update pointer to new copy\n2) Wait for existing readers to finish (grace period)\n3) Reclaim old copy",
      },
    ],
  },
  {
    title: "Part 4: Scheduling",
    cards: [
      {
        front: "What are CPU-bound vs I/O-bound processes?",
        back: "CPU-bound: long CPU bursts, infrequent I/O waits.\nI/O-bound: short CPU bursts, frequent I/O waits.",
      },
      {
        front: "When does the scheduler run?",
        back: "When a process exits, blocks on I/O, a new process is created, or an interrupt occurs.",
      },
      {
        front: "What is preemptive vs non-preemptive scheduling?",
        back: "Non-preemptive: process runs until it blocks or voluntarily yields.\nPreemptive: scheduler can forcibly take the CPU away (e.g., quantum expires).",
      },
      {
        front: "What scheduling categories exist for different system types?",
        back: "Batch systems: non-preemptive\nInteractive systems: preemptive\nReal-time systems: separate category",
      },
      {
        front: "What are the scheduling goals for ALL systems?",
        back: "Fairness: each process gets fair CPU share\nPolicy enforcement: stated policy carried out\nBalance: keep all parts of system busy",
      },
      {
        front: "What are the scheduling goals for batch systems?",
        back: "Throughput: maximize jobs per hour\nTurnaround time: minimize submission-to-termination time\nCPU utilization: keep CPU busy",
      },
      {
        front: "What are the scheduling goals for interactive systems?",
        back: "Response time: respond to requests quickly\nProportionality: meet users' expectations",
      },
      {
        front: "What are the scheduling goals for real-time systems?",
        back: "Meeting deadlines: avoid losing data\nPredictability: avoid quality degradation",
      },
      {
        front: "How does First-Come First-Served (FCFS) work?",
        back: "Process jobs in order of arrival. Non-preemptive. New/blocking jobs go to end of queue. Suffers from the convoy effect.",
      },
      {
        front: "What is the convoy effect?",
        back: "In FCFS scheduling, I/O-bound processes wait behind long CPU-bound jobs, causing poor utilization of I/O devices.",
      },
      {
        front: "How does Shortest Job First (SJF) work?",
        back: "Pick the job with the shortest run time. Provably optimal for turnaround time, but only if all jobs are available simultaneously. Runtimes must be known in advance. Can cause starvation of longer jobs.",
      },
      {
        front: "How does Round Robin work?",
        back: "Each process gets a time slice (quantum). If still running at end of quantum, process is preempted and goes to end of ready queue. Preemptive algorithm.",
      },
      {
        front: "What is the quantum size trade-off in Round Robin?",
        back: "Too small: too much context switching overhead.\nToo large: poor response time.\nMust balance CPU utilization vs. response time.",
      },
      {
        front: "How does Priority Scheduling work?",
        back: "Multiple ready queues, one per priority level. Next process picked from highest priority queue. Priorities can be static or dynamic. I/O-bound processes should generally have higher priority.",
      },
      {
        front: "How does Shortest Process Next work?",
        back: "Applies SJF to interactive systems. Predicts next running time using aging — a weighted average (exponential averaging) of previous running times.",
      },
      {
        front: "How does Guaranteed (Fair-Share) Scheduling work?",
        back: "N processes → each gets 1/Nth of CPU time. Calculate entitled time = time since creation / N. Measure actual consumed CPU time, form ratio. Pick process with smallest ratio.",
      },
      {
        front: "How does Lottery Scheduling work?",
        back: "Processes receive lottery tickets. OS picks a winning ticket randomly. More tickets = higher effective priority. Tickets can be traded between processes and are immediately available to new processes.",
      },
      {
        front: "What is policy vs mechanism in scheduling?",
        back: "The scheduling algorithm is the mechanism. Parameters are filled in by users/processes (the policy). Example: a parent gives some children higher priority.",
      },
      {
        front: "What is the difference between soft and hard real-time?",
        back: "Soft real-time: missing a deadline is undesirable but tolerable.\nHard real-time: missing a deadline is a system failure.",
      },
      {
        front: "What is the schedulability test for periodic real-time tasks?",
        back: "A system with m periodic tasks is schedulable if: Σ(Ci/Pi) ≤ 1, where Ci = CPU time required per period, Pi = period length.",
      },
      {
        front: "How does thread scheduling differ for user-level vs kernel-level threads?",
        back: "User-level: OS schedules processes, thread library schedules threads within the process quantum. OS has no knowledge of individual threads.\nKernel-level: OS directly schedules threads and can interleave threads from different processes.",
      },
    ],
  },
  {
    title: "Part 5: Key Concepts Quick Reference",
    cards: [
      {
        front: "True or False: A process has at least one thread running internally.",
        back: "True.",
      },
      {
        front: "True or False: Multiple processes can share the same address space.",
        back: "False. Threads share address space within a process; processes have separate address spaces.",
      },
      {
        front: "True or False: A thread has its own address space.",
        back: "False. Threads share the address space of their process.",
      },
      {
        front: "True or False: Each thread has its own stack.",
        back: "True.",
      },
      {
        front: "True or False: The scheduler controls the transition from Ready to Running.",
        back: "True.",
      },
      {
        front: "True or False: A process can transition directly from Blocked to Running.",
        back: "False. It must go through Ready first.",
      },
      {
        front: "True or False: Semaphore operations (up/down) are atomic.",
        back: "True.",
      },
      {
        front: "True or False: Disabling interrupts is a valid mutual exclusion solution for multiprocessor systems.",
        back: "False. It only works for single-CPU systems.",
      },
      {
        front: "True or False: Peterson's solution uses busy waiting.",
        back: "True.",
      },
      {
        front: "True or False: In priority scheduling, a low-priority task can delay a high-priority task if it holds a mutex.",
        back: "True. This is called priority inversion.",
      },
      {
        front: "True or False: Round Robin is a non-preemptive algorithm.",
        back: "False. Round Robin is preemptive.",
      },
      {
        front: "True or False: SJF is provably optimal for turnaround time when all jobs arrive simultaneously.",
        back: "True.",
      },
      {
        front: "True or False: RCU allows writers to update data while readers are still reading.",
        back: "True.",
      },
    ],
  },
  {
    title: "Part 6: Exam-Style Practice",
    cards: [
      {
        front: "True or False: A process has at least one thread running internally.",
        back: "True. Every process has at least one thread of execution.",
      },
      {
        front: "True or False: A process can move directly from Blocked to Running.",
        back: "False. A blocked process must first transition to Ready (when its event completes), then the scheduler moves it from Ready to Running.",
      },
      {
        front: "Name the 4 requirements for a correct critical region solution.",
        back: "1) Mutual exclusion\n2) No speed/CPU assumptions\n3) No blocking from outside the critical region\n4) Bounded waiting (no process waits forever)",
      },
      {
        front: "Why are lock variables not a correct mutual exclusion solution?",
        back: "Because race conditions now occur on the lock variables themselves. Two processes can both read the lock as 0 before either sets it to 1.",
      },
      {
        front: "In the semaphore-based Producer-Consumer, what are the 3 semaphores and their initial values?",
        back: "full (init 0): counts filled buffer slots\nempty (init N): counts empty buffer slots\nmutex (init 1): ensures mutual exclusion on buffer access",
      },
      {
        front: "What is priority inversion? Describe the Mars Pathfinder scenario and name two solutions.",
        back: "A medium-priority task runs before a high-priority task because low-priority holds a mutex high needs. Mars Pathfinder: low acquires mutex → medium preempts low → high blocks on mutex → medium runs before high. Solutions: priority inheritance, priority ceiling.",
      },
      {
        front: "Schedulability test: periods 100ms, 200ms, 500ms; CPU times 50ms, 30ms, 100ms. Schedulable?",
        back: "50/100 + 30/200 + 100/500 = 0.50 + 0.15 + 0.20 = 0.85 ≤ 1. Yes, the system is schedulable.",
      },
      {
        front: "Compare user-level and kernel-level threads (one advantage, one disadvantage each).",
        back: "User-level: Advantage — fast switching (no mode switch). Disadvantage — blocking syscalls block entire process.\nKernel-level: Advantage — true parallelism, no blocking issue. Disadvantage — slower switching (requires mode switch).",
      },
      {
        front: "What is the convoy effect in FCFS?",
        back: "I/O-bound processes get stuck waiting behind long CPU-bound jobs, leading to poor I/O device utilization and increased turnaround times.",
      },
      {
        front: "Which is private to each thread: address space, global variables, stack, or open files?",
        back: "Stack. Address space, global variables, and open files are shared per process.",
      },
      {
        front: "Explain Round Robin scheduling and the quantum size trade-off.",
        back: "Each process gets a time quantum. If still running when it expires, the process is preempted and goes to end of ready queue. Small quantum = high overhead. Large quantum = poor response time.",
      },
      {
        front: "What is RCU? Describe the writer's 3 steps.",
        back: "Read-Copy-Update tolerates reader/writer conflicts. Writer steps:\n1) Atomically update pointer to new copy\n2) Wait for existing readers to finish (grace period)\n3) Reclaim old copy",
      },
      {
        front: "What is a barrier in process synchronization?",
        back: "A mechanism where no process may proceed to the next phase until all processes are ready. When the last process arrives at the barrier, all are released.",
      },
      {
        front: "What is the difference between preemptive and non-preemptive scheduling?",
        back: "Non-preemptive: process runs until it blocks or yields (e.g., FCFS).\nPreemptive: scheduler can forcibly take CPU away (e.g., Round Robin).",
      },
    ],
  },
];
