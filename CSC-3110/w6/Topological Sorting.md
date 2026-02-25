
Edge directions lead to new questions about digraphs that are either meaningless or trivial for undirected graphs. In this section, we discuss one such question.

As a motivating example, consider a set of five required courses {C1, C2, C3, C4, C5} a part-time student has to take in some degree program. 

The courses can be taken in any order as long as the following course prerequisites are met: 
- C1 and C2 have no prerequisites
- C3 requires C1 and C2
- C4 requires C3
- C5 requires C3 and C4
- The student can take only one course per term.
- In which order should the student take the courses?

This is what *topological sorting* is perfect for.

![[Pasted image 20260217173836.png]]

There are two algorithms that are best to verify whether a digraph is a dag and if it is, **produce an ordering of vertices that solves the topological sorting problem.**

The first algorithm is a simple application of depth-first search...

- Perform a DFS traversal and note the order in which vertices become dead-ends (i.e., popped off the traversal stack). 
- Reversing this order yields a solution to the topological sorting problem, provided, of course, no back edge has been encountered during the traversal. 
- If a back edge has been encountered, the digraph is not a dag, and topological sorting of its vertices is impossible.

