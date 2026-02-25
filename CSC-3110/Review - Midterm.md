
### Exercise 1

**Indicate whether the first function of each of the following pairs has a smaller, same, or larger order of growth (to within a constant multiple) than the second function.**

![[Pasted image 20260224173650.png]]

### Exercise 2

**Use the informal definitions of O, Ω ,𝛩 band to determine whether the following assertions are true or false.

![[Pasted image 20260224173847.png]]

**a:** True. Big O notation says that order of growth should be *smaller* or *equal* 
**b:** True. Same reason as above
**c:** False. Theta notation states first function should have same order of growth as the second one.
**d:** True. Quadratic has higher order of growth. Omega is greater than or equal.

![[Pasted image 20260224174145.png]]
### Exercise 3

**List the following functions according to their order of growth from the lowest to the highest**

![[Pasted image 20260224174226.png]]

$(n-2)!,\ 5\lg(n+100)^{10},\ 2^{2n},\ 0.001n^{4}+3n^{3}+1,\ \ln^{2}n,\ \sqrt[3]{n},\ 3^{n}.$

1. 5lg(n + 100)^10
2. ln^2 n
3. cbrt(n)
4. 0.001n^4 + 3n^3
5. 3^n
6. 2^2n
7. (n - 2)!

![[Pasted image 20260224174501.png]]

### Exercise 4

**For each of the following algorithms, indicate**
**(i) a natural size metric for its inputs,** 
**(ii) its basic operation** 
**(iii) whether the basic operation count can be different for inputs of the same size:**

1. **computing the sum of n numbers** 
	 1. n - the count of the numbers
	 2. basic operation is the sum or addition
	 3. it will be the same for all the inputs of size n
2. **computing n!**
	1. n the integer whos factorial is being computed
	2. Basic operation: multiplication
	3. The count only depends on n.
3. **finding the largest element in a list of n number**
	1. n, the number of elements in the list
	2. Basic op: Comparison
	3. The operation count depends only on n, not the input values

![[Pasted image 20260224174942.png]]


### Exercise 5

**For each of the following algorithms, indicate whether it is: 
• Stable? 
• In-place? 
Algorithms: 
• Insertion Sort 
• Selection Sort 
• Bubble Sort**

1. **Insertion sort:**
	1. Stable
	2. Yes, In-place
2. **Selection sort:**
	1. Not stable 
	2. Yes, In-place
3. **Bubble sort**
	1. Stable
	2. Yes, In-place

### Exercise 6

![[Pasted image 20260224175322.png]]

1. Basic op is addition and multiplication. No need to choose since addition will tell us how many types multiplication will run, but if we have to we choose, then we pick multiplication
2. ![[Pasted image 20260224175845.png]]
3. This is O(n)

### Exercise 7 

![[Pasted image 20260224175608.png]]

1. Basic op is comparison
2. ![[Pasted image 20260224175814.png]]
3. O(n)

### Exercise 8 

![[Pasted image 20260224175905.png]]

1. Basic operation is addition
2. ![[Pasted image 20260224175946.png]]
3. O(n^2)

### Exercise 9 

![[Pasted image 20260224180110.png]]

1. Basic op is comparison
2. ![[Pasted image 20260224180226.png]]
3. ![[Pasted image 20260224180256.png]]
4. O(n^2)

### Exercise 10

![[Pasted image 20260224180315.png]]

1. Basic op is comparison
2. ![[Pasted image 20260224180502.png]]
3. ![[Pasted image 20260224180606.png]]
4. O(n^2)

### Exercise 11

![[Pasted image 20260224180953.png]]

O(n^2)

### Exercise 12

![[Pasted image 20260224181346.png]]

1. Basic op is addition - In recursive algos its found in the recursive call
2. A(n) = A(n / 2) + 1 -> A(1) = 0
3. Assume 2^k -> A(2^k) = A(2^k-1) + 1 -> A(2^0) = 0 -> 
	1. A(2^k) = A(2^k-1) + 1
	2. sub. A(2^k - 1) = A(2^k - 2) + 1
	3. = A(2^k - 2) + 2
	4. = A(2^k - 3) + 3
	5. **A(2^k - i) + i**
	6. **A(2^k - k) + k**
	7. 0 + k -> k = logbase2n
4. O()

### Exercise 13

![[Pasted image 20260224182658.png]]

1. Basic op is addition 
2. 2A(n - 1) + 1
3. 2^n


### Exercise 14

![[Pasted image 20260224184044.png]]

