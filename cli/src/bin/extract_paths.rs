use std::fs;

use cli::svg::extract_paths::{Visitor};
use usvg::Tree;

fn main() {
    let file_path = "/Users/hectorcrean/Downloads/world 1 (1).svg";
    let svg_data = fs::read(file_path).expect("Cannot read file");
    let tree = Tree::from_data(&svg_data, &usvg::Options::default()).expect("Failed to parse SVG");

   let mut visitor = Visitor::new();
   visitor.traverse(&tree.root());

   let paths = visitor.paths();
   let json = serde_json::to_string_pretty(paths).expect("Failed to serialize paths");
   fs::write("paths.json", json).expect("Failed to write file");
}