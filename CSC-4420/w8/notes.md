# Lecture 14: Memory Management (Virtual Memory & Paging)

## The Core Problem

Early systems required entire programs to fit into physical memory as one contiguous block. This created two issues: programs could exceed available memory, and the gaps between allocated blocks (external fragmentation) wasted space. The original workaround was **overlays** — splitting a program into pieces kept on disk and swapped in one at a time by an overlay manager. This was manual, tedious, and error-prone. Modern systems replaced it with **virtual memory**, almost always implemented through **paging**.

## Virtual Memory and Address Translation

Virtual memory gives every process the illusion of having a vast, private address space (e.g., 32-bit or 48-bit), even though physical RAM is far smaller. The process issues **virtual addresses**; the hardware translates them into **physical addresses** on the fly. This translation is performed by the **Memory Management Unit (MMU)**, a dedicated hardware component sitting between the CPU and memory.

Paging divides both virtual and physical memory into fixed-size blocks called **pages** (typically 4 KB). A **page table** maps each virtual page to a physical page frame. When a process accesses a virtual address, the MMU splits it into a page number (used to index the page table) and an offset within that page. The page table entry supplies the corresponding physical frame number, which is combined with the offset to produce the real memory address.

## Page Table Entries and Size Concerns

Each entry in a page table carries more than just a frame number. A typical page table entry includes a **present/absent bit** (is the page in RAM?), a **modified bit** (has it been written to?), and **protection bits** (read, write, execute permissions).

The size of a page table depends on the address space. On a 32-bit system with 4 KB pages, there are 2^20 (about 1 million) entries. At 4 bytes each, that is 4 MB per process — manageable. On a 64-bit system (realistically 48-bit addressing), the number of entries explodes to 2^36, making a flat page table impractical. This motivates hierarchical and inverted designs.

## Multi-Level Page Tables

Instead of one enormous flat table, the system uses a tree of smaller tables. On **x86 (32-bit)**, a two-level scheme splits the virtual address into two page-table index fields plus an offset. The **CR3 register** points to the top-level directory. The MMU walks the hierarchy: index into the first-level table to find a pointer to a second-level table, then index into that to find the physical frame. Only the second-level tables that are actually needed exist in memory, so a process using a small portion of its address space wastes far less space than a flat table would.

On **x86-64**, this extends to a **four-level hierarchy**: Page Global Directory (PGD), Page Upper Directory (PUD), Page Mid-level Directory (PMD), and finally the Page Table Entry (PTE). The principle is the same — each level narrows down the translation one step — but with four levels of indirection, a single memory access now requires up to four additional memory reads just to walk the page table.

## Inverted Page Tables

An alternative used on some architectures (e.g., IA-64) flips the model: instead of one entry per virtual page, there is one entry per **physical frame**. The table is indexed by physical frame number and records which process and virtual page currently occupy that frame. This keeps the table size proportional to physical memory rather than virtual address space, but lookups require searching the table (often aided by hashing), which adds complexity.

## The Translation Lookaside Buffer (TLB)

Multi-level page tables solve the space problem but create a speed problem — every memory access triggers multiple table lookups. The **TLB** is a small, fast hardware cache that stores recent virtual-to-physical translations. Because programs exhibit strong **locality** (they repeatedly access nearby addresses), most translations hit the TLB and skip the page table walk entirely.

TLBs are small (typically 64–128 entries) because the memory used is extremely fast and expensive. Systems often have separate TLBs for code and data, and sometimes separate entries for normal (4 KB) and huge (2 MB) pages. There is one TLB per CPU, though some architectures add multiple levels (L1 and L2 TLB), mirroring the cache hierarchy.

The TLB must be **flushed** whenever its entries could become stale — most commonly at a **context switch**, since a new process has a completely different page table. After a flush, the first accesses to each page will miss the TLB ("cold start"), temporarily slowing execution. Programs with poor locality (jumping around memory unpredictably) also suffer frequent TLB misses.

## Software vs. Hardware TLB Management

On some architectures, TLB misses are handled entirely in **hardware**: the MMU automatically walks the page table and fills the TLB. On others, a TLB miss traps into the **OS**, which walks the table in software and loads the entry. Hardware management is faster; software management is more flexible (the OS can, for example, speculatively preload TLB entries it expects to need soon). This is a classic **efficiency vs. flexibility** trade-off.

## 
