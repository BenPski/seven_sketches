use std::collections::BTreeSet;
use std::cmp::Eq;
use std::fmt::{Display, format, Debug};
use std::hash::Hash;

#[derive(PartialEq, Eq, Debug)]
pub struct Partition<A> {
    parts: BTreeSet<BTreeSet<A>>,
}

impl<'a, A> IntoIterator for &'a Partition<A> {
    fn into_iter(self) -> Self::IntoIter {
        let btree_set = &self.parts;
        btree_set.into_iter()
    }

    type Item = &'a BTreeSet<A>;

    type IntoIter = std::collections::btree_set::Iter<'a, BTreeSet<A>>;
}

impl<A: Display> Display for Partition<A> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let groups: Vec<String> = self.into_iter().map(|group| {
            let elems: Vec<String> = group.into_iter().map(|e| {
                format(format_args!("{}", e))
            }).collect();
            elems.join(", ")
        }).collect();
        write!(f, "[[{}]]", groups.join("], ["))
    }
}

impl<A> Partition<A> where A: Hash + Eq + Ord + Debug + Clone + Copy {
    pub fn new(junk: Vec<Vec<A>>) -> Self {
        let mut base = Partition::create_empty();
        junk.into_iter().for_each(|group| {
            let mut new_group = BTreeSet::new();
            group.into_iter().for_each(|e| { new_group.insert(e); });
            // get rid of already defined values
            let unique = new_group.difference(&base.full_set()).cloned().collect();
            base.add(unique);
        });
        base
    }

    // helper for initial construction
    // shove a set into the partition 
    fn add(&mut self, set: BTreeSet<A>) {
        self.parts.insert(set);
    }

    pub fn create_empty() -> Self {
        Partition { parts: BTreeSet::new() }
    }

    pub fn empty(&self) -> bool {
        self.parts.is_empty()
    }

    // the full set or the union of all parts
    pub fn full_set(&self) -> BTreeSet<A> {
        self.into_iter().fold(BTreeSet::new(), |acc, x| {
            acc.union(&x).cloned().collect()
        })
    }

    // the process goes
    // make the partitions of the smaller list then add on the remaining item
    // that was left out
    pub fn all_partitions(orig: Vec<A>) -> Vec<Self> {
        all_partitions(orig).into_iter().map(|p| {
            Partition::new(p)
        }).collect()
    }

//    pub fn insert_generic(&mut self, pred: F)
//        where F: Fn(A, A) -> bool
//        {
//
//    }
//    
//    pub fn insert_equivalence(&mut self, equiv: dyn Fn(A) -> bool) {
//    }
}

fn all_partitions<A>(orig: Vec<A>) -> Vec<Vec<Vec<A>>> where A: Clone + Copy {
    if orig.len() == 0 {
        Vec::new()
    } else if orig.len() == 1 {
        vec![vec![orig]]
    } else {
        let elem = orig[0];
        let sub = orig[1..].to_vec();

        let smaller_parts = all_partitions(sub);
        smaller_parts.into_iter().flat_map(|p| {
            mix_in(elem, p)
        }).collect()
    }
}

fn mix_in<A: Clone>(elem: A, parts: Vec<Vec<A>>) -> Vec<Vec<Vec<A>>> {
    let mut res = Vec::new();
    let mut first = parts.clone();
    first.push(vec![elem.clone()]);
    res.push(first);
    (0..parts.len()).for_each(|i| {
        let mut copy = parts.clone();
        copy[i].push(elem.clone());
        res.push(copy);
    });
    res
}
