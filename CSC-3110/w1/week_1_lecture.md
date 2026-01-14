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

