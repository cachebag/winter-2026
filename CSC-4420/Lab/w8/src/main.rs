use rand::Rng;
use std::env;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Condvar, Mutex};
use std::thread;
use std::time::{Duration, Instant};

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 3 {
        eprintln!("Usage: {} <initial_fruits> <num_gatherers>", args[0]);
        std::process::exit(1);
    }

    let f: i32 = args[1].parse().expect("Invalid initial fruits");
    let x: usize = args[2].parse().expect("Invalid number of gatherers");

    if f < 0 {
        eprintln!("Initial fruits must be >= 0");
        std::process::exit(1);
    }
    if x < 1 {
        eprintln!("Number of gatherers must be >= 1");
        std::process::exit(1);
    }

    println!("Initial fruits: {}", f);
    println!("Number of gatherers: {}", x);

    let start_time = Instant::now();
    let shared = Arc::new((Mutex::new(f), Condvar::new()));
    let finished_count = Arc::new(AtomicUsize::new(0));

    let nature_shared = Arc::clone(&shared);
    let nature_finished = Arc::clone(&finished_count);
    let nature_handle = thread::spawn(move || {
        while nature_finished.load(Ordering::SeqCst) < x {
            for _ in 0..10 {
                if nature_finished.load(Ordering::SeqCst) >= x {
                    return;
                }
                thread::sleep(Duration::from_millis(100));
            }

            let (lock, cvar) = &*nature_shared;
            let mut fruits = lock.lock().unwrap();
            *fruits += 3;
            let total = *fruits;
            let elapsed = start_time.elapsed().as_secs_f64();
            println!("[{:.3}s] Nature replenished 3 fruits. Total: {}", elapsed, total);
            cvar.notify_all();
        }
    });

    let mut handles = Vec::new();
    for i in 0..x {
        let shared = Arc::clone(&shared);
        let finished_count = Arc::clone(&finished_count);
        let handle = thread::spawn(move || {
            let want: i32 = rand::thread_rng().gen_range(1..=5);

            let (lock, cvar) = &*shared;
            loop {
                let mut fruits = lock.lock().unwrap();
                if *fruits >= want {
                    *fruits -= want;
                    let remaining = *fruits;
                    let elapsed = start_time.elapsed().as_secs_f64();
                    println!(
                        "[{:.3}s] Gatherer {} collected {} fruits. Remaining: {}",
                        elapsed, i, want, remaining
                    );
                    finished_count.fetch_add(1, Ordering::SeqCst);
                    cvar.notify_all();
                    return;
                }
                let elapsed = start_time.elapsed().as_secs_f64();
                println!(
                    "[{:.3}s] Gatherer {} wants {} fruits, not enough, waiting...",
                    elapsed, i, want
                );
                fruits = cvar.wait(fruits).unwrap();
            }
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().expect("Gatherer thread panicked");
    }

    finished_count.store(x, Ordering::SeqCst);
    nature_handle.join().expect("Nature thread panicked");

    println!("All gatherers have finished.");
}
