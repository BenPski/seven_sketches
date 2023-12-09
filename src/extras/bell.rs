use crate::extras::combinatorics::choose;

// the nth bell number
pub fn bell(n: u32) -> u32 {
    if n == 0 {
        1
    } else {
        (0..n).fold(0, |acc, k| {
            acc + (bell(k) * choose(n-1, k))
        })
    }
}

