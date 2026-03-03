# CSC-4420 Midterm Exam Study Guide

**Exam Date:** March 4, 2026 | 11:30 AM - 12:45 PM
**Format:** In-person, written (pen/pencil). No electronics, no cheat sheet.
**Location:** Old Main | Room 0106
**Coverage:** Lectures 06, 11, and 12 — everything except slides marked "not required in exams"

---

## Part 1: Processes

### 1.1 The Process Model

- A **process** is a **program in execution**. A single program can have multiple processes.
- A process is a fundamental OS abstraction that simplifies **resource allocation**, **resource accounting**, and **resource limiting**.
- The OS maintains information about resources and internal state for every process in the system.

### 1.2 Multiprogramming

- There is a **single physical program counter per CPU core**.
- The CPU switches back and forth between processes (multiprogramming).
- Each process has its own **logical program counter** (flow of control).
- When the OS switches processes, it **saves** the program counter of the outgoing process and **restores** the program counter of the incoming process.
- Only **one process is active** on a given CPU at any instant, but all processes make progress over time.

### 1.3 Concurrent Processes

- Multiple processes are **mutually independent** in principle.
- They need **explicit means** (IPC) to interact with each other.
- The CPU is allocated in turns to different processes.
- The OS normally offers **no timing or ordering guarantees**.

### 1.4 Process Hierarchies

- The OS typically creates only **one init process**.
- A **parent process** can create a **child process**, forming a **tree-like structure** and process groups.
- Example: a shell executes commands, creating child processes.

### 1.5 Process Creation

Four principal events that cause process creation:

1. **System initialization**
2. **Execution of a process-creation system call** by a running process
3. **A user request** to create a new process
4. **Initiation of a batch job**

### 1.6 Process Termination

Four conditions that terminate a process:

1. **Normal exit** (voluntary)
2. **Error exit** (voluntary)
3. **Fatal error** (involuntary)
4. **Killed by another process** (involuntary)

### 1.7 Process Management System Calls

| Call | Purpose |
|------|---------|
| `fork` | Create a new process. Child is a "private" clone of the parent; shares some resources. |
| `exec` | Execute a new process image. Used in combination with `fork`. |
| `exit` | Cause voluntary process termination. Exit status returned to the parent. |
| `kill` | Send a signal to a process (or group). Can cause involuntary termination. |

### 1.8 Process States

Three states a process may be in:

| State | Meaning |
|-------|---------|
| **Running** | Actually using the CPU at that instant |
| **Ready** | Runnable; temporarily stopped to let another process run |
| **Blocked** | Unable to run until some external event happens |

**State transitions:**

- **Transition 1:** Running → Blocked (process blocks on I/O or waits for resource)
- **Transition 2:** Running → Ready (scheduler preempts the process; time quantum expired)
- **Transition 3:** Ready → Running (scheduler picks this process to run next)
- **Transition 4:** Blocked → Ready (external event occurs, e.g., I/O completes)

Key insight: The **scheduler** controls transitions 2 and 3. A process **cannot** give the CPU to another process without going through the scheduler.

### 1.9 Process Control Block (PCB) / Process Table

The OS stores per-process information in a **Process Table**. Each entry (PCB) contains:

**Process management:** Registers, Program counter, Program status word, Stack pointer, Process state, Priority, Scheduling parameters, Process ID, Parent process, Process group, Signals, Time started, CPU time used, Children's CPU time, Time of next alarm

**Memory management:** Pointer to text segment info, Pointer to data segment info, Pointer to stack segment info

**File management:** Root directory, Working directory, File descriptors, User ID, Group ID

### 1.10 Interrupts

- To deallocate the CPU in favor of the scheduler, the OS relies on **hardware-provided interrupt handling**.
- The scheduler **periodically gets control** whenever hardware generates an interrupt.
- **Interrupt vector:** associated with each I/O device and interrupt line; part of the Interrupt Descriptor Table (IDT); contains the start address of an interrupt handler.
- **Interrupt types:** software interrupts, hardware device interrupts (asynchronous), exceptions.

**What happens when an interrupt occurs (8 steps):**

1. Hardware stacks program counter, etc.
2. Hardware loads new program counter from interrupt vector (for interrupt handler)
3. Assembly language procedure saves registers
4. Assembly language procedure sets up new stack (for secure kernel operations)
5. C interrupt service runs (typically reads and buffers input)
6. Scheduler decides which process to run next
7. C procedure returns to the assembly code
8. Assembly language procedure starts up new current process

Key points:
- Every interrupt gives the scheduler control — it acts as a **mediator**.
- A process **cannot** context switch to another process without going through the scheduler.

### 1.11 Modeling Multiprogramming

- **CPU utilization** depends on the **number of processes in memory** and **I/O wait time**.
- **Low I/O wait (20%):** CPU reaches near 100% utilization with only 2-3 processes.
- **High I/O wait (80%):** Even 10 processes may not reach 100% CPU utilization.
- **Diminishing returns:** Adding more processes initially boosts CPU usage significantly, but eventually the benefit becomes marginal.
- **Saturation point:** For low I/O wait systems, around 3-4 processes gives maximum CPU usage.

---

## Part 2: Threads

### 2.1 What Are Threads?

- Default assumption: 1 process = 1 thread of execution.
- **Multithreaded execution:** 1 process = N threads of execution.
- Threads are **lightweight processes** that allow space- and time-efficient parallelism.
- Threads are organized in **thread groups** for simple communication and synchronization.

### 2.2 Thread Usage Examples

- **Word processor:** one thread for user interaction, one for reformatting, one for auto-saving.
- **Web server:** a dispatcher thread accepts requests, worker threads handle them.

### 2.3 Threads vs. Processes

| Shared (per process) | Private (per thread) |
|----------------------|---------------------|
| Address space | Program counter |
| Global variables | Registers |
| Open files | Stack |
| Child processes | State |
| Pending alarms | |
| Signals and signal handlers | |
| Accounting information | |

- Threads reside in the **same address space** of a single process.
- All information exchange between threads is via **shared data**.
- Threads synchronize via **simple primitives**.
- Each thread has its **own stack**, hardware registers, and state.
- **Thread table/switch** is lighter than a process table/switch.
- Each thread may call any OS-supported system call **on behalf of the process** it belongs to.

### 2.4 Implementing Threads

**User-level threads:**
- Thread management done entirely in user space.
- **Pros:** Fast thread switching (no mode switch), scalable, customizable.
- **Cons:** Requires app cooperation (transparency issues), blocking syscalls are problematic (blocks entire process).

**Kernel-level threads:**
- Thread management done by the kernel.
- Kernel is aware of all threads.

**Hybrid implementations:**
- Multiplex user-level threads onto kernel-level threads.
- Combines advantages of both approaches.

### 2.5 Thread Issues

- Does the OS keep track of threads? (Kernel vs. user threads)
- What to do on `fork`? Clone all threads vs. only calling thread?
- What about threads blocking on system calls?
- What to do with signals? Send to all threads vs. single thread? Per-process or per-thread signal handlers?
- Where to store per-thread variables? (Thread Local Storage — TLS)
- Are threads required inside an OS?

---

## Part 3: Inter-Process Communication (IPC) and Synchronization

### 3.1 Why IPC?

- Processes need to **communicate** (share data during execution).
- No explicit cross-process sharing: data must be **safely exchanged**.
- Processes need to **synchronize** to account for dependencies and avoid interfering with each other.
- Synchronization also applies to **multithreaded** execution.

### 3.2 Race Conditions

A **race condition** occurs when multiple processes access shared data concurrently and the result depends on the order/timing of execution.

**Classic example (print spooler):**
1. Process A reads `in=7`, decides to append its file at position 7.
2. A is suspended by OS (time slot expired).
3. Process B also reads `in=7`, puts its file at position 7.
4. B sets `in=8` and gets suspended.
5. A writes its file to position 7, **overwriting B's file**.
6. Problem: reading/updating `in` should be an **atomic action**.

### 3.3 Critical Regions

A **critical region** is a code section that accesses shared resources.

**Four requirements to avoid race conditions:**

1. **Mutual exclusion:** No two processes may be simultaneously inside their critical regions.
2. **No speed assumptions:** No assumptions may be made about speeds or number of CPUs.
3. **No blocking from outside:** No process running outside its critical region may block other processes.
4. **Bounded waiting:** No process should have to wait forever to enter its critical region.

### 3.4 Attempted Solutions (Non-solutions)

**Disable interrupts:**
- Prevent CPU from being reallocated.
- Works for **single-CPU systems only**.
- Not suitable for multiprocessor systems.

**Lock variables:**
- Guard critical regions with 0/1 variables.
- Problem: **races now occur on the lock variables themselves**.

**Strict alternation:**
- Does not permit processes to enter critical regions two times in a row.
- A process outside the critical region can **block another one**.
- Violates requirement #3.

### 3.5 Peterson's Solution

- A correct software solution for **mutual exclusion with busy waiting**.
- Uses a `turn` variable and an `interested[]` array.
- Both processes set their interest and defer to each other via the `turn` variable.
- Satisfies all four critical region requirements.
- Involves **busy waiting** (spinning).

### 3.6 Avoiding Busy Waiting

- All busy-waiting solutions waste CPU cycles (spin locks).
- Better solution: let a waiting process **voluntarily return the CPU** to the scheduler.

### 3.7 Producer-Consumer Problem

- A **producer** generates data items and places them in a buffer.
- A **consumer** takes data items from the buffer.
- The buffer has a **finite size**.
- Need synchronization to prevent:
  - Producer writing to a full buffer.
  - Consumer reading from an empty buffer.
  - Race conditions on the buffer and count variable.

### 3.8 Semaphores

A **semaphore** is a special integer type with two **atomic** operations:

| Operation | Behavior |
|-----------|----------|
| **down (P / wait)** | If `sema > 0`, decrement it. If `sema == 0`, **block** the calling process. |
| **up (V / signal)** | If there is a process blocked on this semaphore, **wake it up**. Otherwise, increment `sema`. |

Key properties:
- All operations are guaranteed to be **atomic** by the OS.
  - On single processors: disable interrupts.
  - On multiprocessors: spin locking.
- A **binary semaphore** (values 0 or 1) is also called a **mutex**.

**Semaphore-based Producer-Consumer:**
- Uses **three semaphores:**
  - `full` (initially 0) — counts filled buffer slots.
  - `empty` (initially N) — counts empty buffer slots.
  - `mutex` (initially 1) — ensures mutual exclusion on buffer access.
- **Producer:** `down(empty)` → `down(mutex)` → produce → `up(mutex)` → `up(full)`
- **Consumer:** `down(full)` → `down(mutex)` → consume → `up(mutex)` → `up(empty)`

### 3.9 Readers/Writers Problem

- **N processes** access shared data (read or write).
- At any given time: **multiple readers OR exactly 1 writer** (never both).
- Basic solution uses semaphores and a reader count.
- Key idea: build a queue of readers and writers; let several readers in simultaneously; allow 1 writer only when no readers are active.
- Concern: How long may the writer have to wait? (potential **writer starvation**)

### 3.10 Message Passing

- Solves both synchronization **and** communication problems.
- Most common choice in **multiserver OS designs**.
- Processes interact by sending and receiving messages:
  - `send(destination, &message);`
  - `receive(source, &message);`
  - `receive(ANY, &message);`

### 3.11 Barriers

- A **barrier** is a synchronization mechanism where **no process may proceed into the next phase** until **all processes** are ready.
- Three stages:
  1. Processes approach the barrier.
  2. All processes but one are blocked at the barrier.
  3. When the last process arrives, all are let through.

### 3.12 Priority Inversion

**The Mars Pathfinder problem:**
- Three tasks with different priorities:
  - **High priority:** Data-distribution system
  - **Medium priority:** Communication system
  - **Low priority:** Meteorological data gathering
- High and Low priority tasks share a data bus protected by a **mutex**.

**The scenario:**
1. Low-priority task acquires the mutex.
2. Low-priority task gets preempted by medium-priority task.
3. High-priority task tries to acquire the mutex — **blocks** (low-priority holds it).
4. Medium-priority task runs, even though high-priority task is waiting.
5. **Priority is inverted:** medium runs before high.

**Solutions to priority inversion:**

| Method | Description |
|--------|-------------|
| **Disable interrupts** | While in critical region (crude) |
| **Priority ceiling** | Associate a priority with the mutex; assign that priority to the holder |
| **Priority inheritance** | Low-priority task temporarily inherits the priority of the blocked high-priority task |
| **Random boosting** | Randomly assign mutex-holding threads a high priority until they exit the critical region |

### 3.13 Read-Copy-Update (RCU)

- An instance of **relativistic programming**.
- Do **not** try to avoid conflicts between readers and writers — **tolerate** them.
- Allow writer to update a data structure even if other processes are still using it.
- Each reader sees either the **old** or the **new** version, never a mix.
- Uses a **single-pointer** readers/writers scheme.

**Writer operates in 3 steps:**
1. **Atomically update** pointer to new copy.
2. **Wait** for existing readers to finish (grace period).
3. **Reclaim** old copy.

**Readers** execute in read-side critical sections with no locking overhead.

---

## Part 4: Scheduling

### 4.1 Process Behavior

- **CPU-bound processes:** Long CPU bursts, infrequent I/O waits.
- **I/O-bound processes:** Short CPU bursts, frequent I/O waits.
- CPU usage alternates with periods of waiting for I/O.

### 4.2 When to Schedule

The scheduler runs when:
- A process **exits**.
- A process **blocks** on I/O, semaphore, etc.
- A **new process is created**.
- An **interrupt occurs** (I/O, clock, syscall, etc.).

**Preemptive vs. non-preemptive scheduling:**
- **Non-preemptive:** A process runs until it blocks or voluntarily yields.
- **Preemptive:** The scheduler can forcibly take the CPU away from a running process (e.g., after a time quantum expires).

### 4.3 Categories of Scheduling Algorithms

| Category | Type |
|----------|------|
| **Batch systems** | Non-preemptive scheduling |
| **Interactive systems** | Preemptive scheduling |
| **Real-time systems** | Different category entirely |

### 4.4 Scheduling Algorithm Goals

**All systems:**
- **Fairness:** Give each process a fair share of the CPU.
- **Policy enforcement:** Ensure stated policy is carried out.
- **Balance:** Keep all parts of the system busy.

**Batch systems:**
- **Throughput:** Maximize jobs per hour.
- **Turnaround time:** Minimize time between submission and termination.
- **CPU utilization:** Keep the CPU busy all the time.

**Interactive systems:**
- **Response time:** Respond to requests quickly.
- **Proportionality:** Meet users' expectations.

**Real-time systems:**
- **Meeting deadlines:** Avoid losing data.
- **Predictability:** Avoid quality degradation in multimedia systems.

### 4.5 Batch Scheduling Algorithms

#### First-Come First-Served (FCFS)

- Process jobs in **order of arrival**.
- **Non-preemptive.**
- Single process queue; new jobs or blocking processes added to **end of queue**.
- **Convoy effect:** If there are a few CPU-bound and many I/O-bound processes, I/O-bound processes wait behind long CPU-bound jobs.

#### Shortest Job First (SJF)

- Pick the job with the **shortest run time**.
- **Provably optimal** for lowest turnaround time — **but only if all jobs are available simultaneously**.
- If new jobs arrive, it may lead to **starvation** of longer jobs.
- Runtimes must be **known in advance**.
- Improved version: **Highest-Response-Ratio-Next**.

### 4.6 Interactive Scheduling Algorithms

#### Round Robin

- **Preemptive** scheduling algorithm.
- Each process gets a **time slice (quantum)**.
- If the process is still running at end of quantum, it gets **preempted** and goes to end of ready queue.
- Key trade-off: **quantum size** — too small = too much context switching overhead; too large = poor response time. Balance CPU utilization vs. response time.

#### Priority Scheduling

- Multiple ready queues, one per priority level.
- Next process is picked from the **highest priority** queue.
- **Static priorities** (fixed) vs. **dynamic priorities** (change over time).
- I/O-bound processes should generally have **higher priority** (they release CPU quickly).
- Beware of **priority inversion** (see Section 3.12).

#### Shortest Process Next

- Apply "shortest job first" idea to interactive systems.
- Problem: How to predict next running time?
- Solution: **Aging** — form a **weighted average** of previous running times.
- Easy to implement with exponential averaging.

#### Guaranteed Scheduling (Fair-Share)

- N processes running → each gets **1/Nth of CPU time**.
- Calculate entitled CPU time: `time since creation / N`.
- Measure **actual consumed CPU time** and form a ratio.
  - Ratio = 0.5 → running half the time it was entitled to.
  - Ratio = 2.0 → running twice as much as entitled.
- Pick the process with the **smallest ratio** to run next.
- Can be applied per-user or per-process.

#### Lottery Scheduling

- Processes receive **lottery tickets**.
- At each scheduling decision, the OS picks a **winning ticket randomly**.
- More tickets = higher effective priority.
- Tickets can be **traded** between processes.
- Tickets are **immediately available** to newly created processes.

### 4.7 Policy vs. Mechanism

- Scheduling algorithm is the **mechanism**.
- **Parameters** can be filled in by users/processes (the **policy**).
- Example: a parent process gives some child processes higher priority than others.

### 4.8 Real-Time Scheduling

- Systems where **timing plays an essential role**.
- **Soft real time:** Missing a deadline is undesirable but tolerable.
- **Hard real time:** Missing a deadline is a system failure.
- Tasks can be **periodic** or **aperiodic**.
- Schedules can be **static** or **dynamic**.

**Schedulability test for periodic tasks:**

A system with `m` periodic tasks is schedulable if:

$$\sum_{i=1}^{m} \frac{C_i}{P_i} \leq 1$$

Where `C_i` = CPU time required per period, `P_i` = period length.

**Example:**

| Task | Period | Required CPU Time | Utilization |
|------|--------|-------------------|-------------|
| P1 | 100 ms | 50 ms | 50/100 = 0.50 |
| P2 | 200 ms | 30 ms | 30/200 = 0.15 |
| P3 | 500 ms | 100 ms | 100/500 = 0.20 |
| **Total** | | | **0.85 ≤ 1 → Schedulable** |

### 4.9 Thread Scheduling

- **User-level threads:** The OS schedules **processes**, and the user-level thread library schedules threads within the process quantum. The OS has no knowledge of individual threads.
- **Kernel-level threads:** The OS directly schedules **threads**. Can interleave threads from different processes.

---

## Part 5: Key Concepts Quick Reference

### True/False Practice Points

- A process has at least one thread running internally. **(True)**
- Multiple processes can share the same address space. **(False — threads share address space within a process; processes have separate address spaces)**
- A thread has its own address space. **(False — threads share the address space of their process)**
- Each thread has its own stack. **(True)**
- The scheduler controls the transition from Ready to Running. **(True)**
- A process can transition directly from Blocked to Running. **(False — it must go through Ready first)**
- Semaphore operations (up/down) are atomic. **(True)**
- Disabling interrupts is a valid mutual exclusion solution for multiprocessor systems. **(False — only works for single-CPU systems)**
- Peterson's solution uses busy waiting. **(True)**
- In priority scheduling, a low-priority task can delay a high-priority task if it holds a mutex. **(True — this is priority inversion)**
- Round Robin is a non-preemptive algorithm. **(False — it is preemptive)**
- Shortest Job First is provably optimal for turnaround time when all jobs arrive simultaneously. **(True)**
- RCU allows writers to update data while readers are still reading. **(True)**

### Process States Diagram

```
         ┌──────────────────────────────────┐
         │                                  │
         ▼          2 (preempt)             │
    ┌─────────┐ ───────────────► ┌───────┐  │
    │ Running │                  │ Ready │  │
    └─────────┘ ◄─────────────── └───────┘  │
         │        3 (schedule)       ▲      │
         │                           │      │
         │ 1 (block)       4 (event) │      │
         │                           │      │
         ▼                           │      │
    ┌─────────┐ ─────────────────────┘      │
    │ Blocked │                             │
    └─────────┘                             │
```

**Transition 1 — Running → Blocked:** Process needs I/O or waits for a resource.
**Transition 2 — Running → Ready:** Scheduler preempts the process (quantum expired).
**Transition 3 — Ready → Running:** Scheduler selects this process to run.
**Transition 4 — Blocked → Ready:** The event the process was waiting for has occurred.

### Semaphore Operations Summary

| Operation | If value > 0 | If value == 0 |
|-----------|-------------|---------------|
| **down** | Decrement value | Block calling process |
| **up** | Increment value | Wake up one blocked process |

### Scheduling Algorithm Comparison

| Algorithm | Preemptive? | System Type | Key Feature | Weakness |
|-----------|-------------|-------------|-------------|----------|
| FCFS | No | Batch | Simple, fair ordering | Convoy effect |
| SJF | No | Batch | Optimal turnaround | Needs known runtimes; starvation |
| Round Robin | Yes | Interactive | Fair time sharing | Quantum size trade-off |
| Priority | Yes | Interactive | Flexible priorities | Priority inversion; starvation |
| Shortest Process Next | Yes | Interactive | Predicts runtimes | Requires history/aging |
| Guaranteed (Fair-Share) | Yes | Interactive | Exact CPU share | Overhead of tracking ratios |
| Lottery | Yes | Interactive | Probabilistic fairness | Non-deterministic |

---

## Part 6: Exam-Style Practice Questions

1. **(True/False)** A process has at least one thread running internally.

2. **(True/False)** A process can move directly from the Blocked state to the Running state.

3. **(Short Answer)** Name the four requirements for a correct critical region solution.

4. **(Short Answer)** Explain why "lock variables" are not a correct solution to mutual exclusion.

5. **(Short Answer)** In the Producer-Consumer problem solved with semaphores, what are the three semaphores used and what are their initial values?

6. **(Diagram)** Draw the three process states and label all four transitions between them. Explain what causes each transition.

7. **(Short Answer)** What is priority inversion? Describe the Mars Pathfinder scenario and name two solutions.

8. **(Calculation)** Given three periodic real-time tasks with periods 100ms, 200ms, 500ms and CPU requirements 50ms, 30ms, 100ms respectively, is the system schedulable? Show your work.

9. **(Short Answer)** Compare user-level threads and kernel-level threads. Give one advantage and one disadvantage of each.

10. **(Short Answer)** What is the "convoy effect" in FCFS scheduling?

11. **(Multiple Choice)** Which of the following is private to each thread? (a) Address space (b) Global variables (c) Stack (d) Open files

12. **(Short Answer)** Explain how Round Robin scheduling works. What is the trade-off in choosing the quantum size?

13. **(Short Answer)** What is Read-Copy-Update (RCU)? Describe the three steps the writer performs.

14. **(Short Answer)** What is a barrier in the context of process synchronization?

15. **(Short Answer)** Explain the difference between preemptive and non-preemptive scheduling. Give one algorithm example of each.
