use std::env;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::sync::Arc;
use std::thread;
use std::time::Instant;

fn is_prime(n: u64) -> bool {
    match n {
        0 | 1 => false,
        2 | 3 => true,
        _ if n.is_multiple_of(2) || n.is_multiple_of(3) => false,
        _ => {
            let mut i = 5;
            while i * i <= n {
                if n.is_multiple_of(i) || n.is_multiple_of(i + 2) {
                    return false;
                }
                i += 6;
            }
            true
        }
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 2 {
        eprintln!("Usage: {} <number_of_threads>", args[0]);
        std::process::exit(1);
    }

    let t: usize = args[1].parse().expect("Invalid number of threads");
    if t < 1 {
        eprintln!("Number of threads must be >= 1");
        std::process::exit(1);
    }

    let file = File::open("numbers.txt").expect("Failed to open numbers.txt");
    let reader = BufReader::new(file);
    let mut lines = reader.lines();

    let first_line = lines.next().expect("File is empty");
    let n: usize = first_line
        .expect("Failed to read first line")
        .trim()
        .parse()
        .expect("Failed to parse N from first line");

    let mut numbers: Vec<u64> = Vec::with_capacity(n);
    for line in lines {
        let line = line.expect("Failed to read line");
        let num: u64 = line.trim().parse().expect("Failed to parse number");
        numbers.push(num);
    }

    if numbers.len() != n {
        eprintln!(
            "Warning: expected {} numbers but read {}",
            n,
            numbers.len()
        );
    }

    let numbers = Arc::new(numbers);
    let chunk_size = n / t;

    let start = Instant::now();

    let mut handles = Vec::new();
    for i in 0..t {
        let nums = Arc::clone(&numbers);
        let begin = i * chunk_size;
        let end = if i == t - 1 { n } else { (i + 1) * chunk_size };

        let handle = thread::spawn(move || {
            let mut count: u64 = 0;
            for &num in &nums[begin..end] {
                if is_prime(num) {
                    count += 1;
                }
            }
            count
        });
        handles.push(handle);
    }

    let mut total: u64 = 0;
    for handle in handles {
        let count = handle.join().expect("Thread panicked");
        total += count;
    }

    let duration = start.elapsed();

    println!("Total prime found: {}", total);
    println!("Time taken: {:.3} seconds", duration.as_secs_f64());
}
