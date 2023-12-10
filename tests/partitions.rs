#[cfg(test)]
mod partition_tests {
    use seven_sketches::partition::Partition;
    use seven_sketches::extras::bell;
    

    #[test]
    fn empty_partition() {
        let p: Partition<u8> = Partition::new();
        assert!(p.empty());
    }

    // all_partitions test
    #[test]
    fn number_of_partitions() {
        let n = 5;
        let all_parts = Partition::all_partitions((0..n).collect());
        let total_number = all_parts.len() as u32;
        assert_eq!(total_number, bell(n))
    }

    #[test]
    fn min_and_max_partitions() {
        let n = 5;
        let all_parts = Partition::all_partitions((0..n).collect());
        let max_partition = Partition::from(vec![(0..n).collect()]);
        let grouped: Vec<Vec<_>> = (0..n).map(|e| {
            vec![e]
        }).collect();
        let min_partition = Partition::from(grouped);
        assert!(all_parts.contains(&max_partition));
        assert!(all_parts.contains(&min_partition));
    }
}
