	All code snippets will be written in Rust
## Why do you need to study algorithms?

**Real world**
- Practically, you should know a fundamental/standard set of algorithms for all domains of computing
- Additionally you should be able to design new algorithms and analyze their efficiency 
**Theoretical**
- The study of algorithms (algorithmics) is a corner stone of CS
- Research, development, R&D- knowing the theoretical bits helps majorly in these fields

## What is an algorithm?

It's just a sequence of _unambiguous_ instructions for solving some problem.

#### Implementing an algorithm for computing the GCD of two integers

#### **Euclid's Algorithm**

```rust
fn find_gcd(mut a: u32, mut b: u32) -> u32 {
    while b != 0 {
        let r = a % b;
        a = b;
        b = r;
    }
    a
}
```


## Algorithm Design Process

![[Pasted image 20260113183236.png]]

## Sequential or Parallel?

 - Sequential: instructions are executed one after another, one op at a time
 - Parallel: Operations are executed concurrently

## Choosing between exact and approximate problem solving

You can typically either implement approximation algorithms when there are problems that simply cannot be solved for most of their instances. For instance: extracting square roots

In other cases, you can of course solve a problem using an *exact algorithm* which is self explanatory 

## Deciding on Algorithm Design Techniques

An algorithm design technique (or “strategy” or “paradigm”) is a general approach to solving problems algorithmically that is applicable to a variety of problems from different areas of computing. 

**General algorithm design techniques:** 
- Brute Force and Exhaustive Search 
- Decrease-and-Conquer 
- Divide-and-Conquer 
- Transform-and-Conquer 
- Space and Time Trade-Offs
- Dynamic Programming 
- Greedy Technique 
- Iterative Improvement 

**Proving an Algorithms Correctness**

Once you've specified an algorithm, you must prove that the algorithm yields a required result for every legitimate input in a finite amount of time. For example: 

- The correctness of Euclid’s algorithm for computing the greatest common divisor stems from the correctness of the equality gcd(m, n) = gcd(n, m mod n), the simple observation that the second integer gets smaller on every iteration of the algorithm, and the fact that the algorithm stops when the second integer becomes 0.

**Analyzing the Algorithm**

We usually want our algorithms to possess several qualities:
- After correctness, by far the most important is efficiency. 
- Time efficiency, indicating how fast the algorithm runs. 
- Space efficiency, indicating how much extra memory it uses. 
- Another desirable characteristic of an algorithm is simplicity. Simpler algorithms are easier to understand and easier to program, consequently, the resulting programs usually contain fewer bugs. 
- Yet another desirable characteristic of an algorithm is generality. 

There are, in fact, two issues here: generality of the problem the algorithm solves and the set of inputs it accepts. 

**Coding an algorithm**

Most algorithms are destined to be ultimately implemented as computer programs, obviously.

Programming an algorithm presents both a peril and an opportunity. The peril lies in the possibility of making the transition from an algorithm to a program either **incorrectly** or very **inefficiently**.

Practically, the validity of programs is always is established by testing. 

## Important problem types

The areas of problem that attract particular attention from researchers are:

- Sorting 
- Searching
- String processing 
- Graph problems 
- Combinatorial problems 
- Geometric problems
- Numerical problems

**Sorting**

The sorting problem is to rearrange the items of a given list in nondecreasing order. 

Of course, for this problem to be meaningful, the nature of the list items must allow such an ordering. (Mathematicians would say that there must exist a relation of total ordering.) 

As a practical matter, we usually need to sort lists of numbers, characters from an alphabet, character strings, and, most important, records similar to those maintained by schools about their students, libraries about their holdings, and companies about their employees. 