pub fn choose(n: u32, k: u32) -> u32 {
    if 2 * k <= n {
        falling_factorial(n, k) / factorial(k)
    } else {
        falling_factorial(n, n-k) / factorial(n-k)
    }
}

pub fn falling_factorial(n: u32, k: u32) -> u32 {
    ((n-k+1)..(n+1)).fold(1, |acc, x| { acc * x} )
}

pub fn factorial(n: u32) -> u32 {
    (1..(n+1)).fold(1, |acc, x| { acc * x } )
}
