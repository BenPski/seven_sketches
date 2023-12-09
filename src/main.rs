use seven_sketches::partition::Partition;
mod extras;
use crate::extras::{bell, factorial, falling_factorial, choose};

fn main() {
    let p: Partition<u32> = Partition::new(vec![vec![1],vec![1,2]]);
//    let p: Partition<u32> = Partition::create_empty();
    println!("Example partition: {}", p);
    println!("Example partition: {:?}", p.full_set());
    println!("All partitions: {:?}", Partition::all_partitions(vec![1,2,3,4]));
    println!("bell number: {:?}", bell(10));

}
