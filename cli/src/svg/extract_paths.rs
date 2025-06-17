use serde::{Deserialize, Serialize};
use usvg::{Tree, Node};
use std::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct Path {
    id: String,
    d: Vec<[f32; 2]>,
    centroid: [f32; 2],
    viewbox: [f32; 4], // [min_x, min_y, width, height]
}

fn calculate_centroid(points: &[[f32; 2]]) -> [f32; 2] {
    let n = points.len() as f32;
    if n == 0.0 {
        return [0.0, 0.0];
    }
    let (sum_x, sum_y) = points.iter().fold((0.0, 0.0), |(sx, sy), p| (sx + p[0], sy + p[1]));
    [sum_x / n, sum_y / n]
}

fn calculate_viewbox(points: &[[f32; 2]]) -> [f32; 4] {
    if points.is_empty() {
        return [0.0, 0.0, 0.0, 0.0];
    }
    let (mut min_x, mut min_y) = (points[0][0], points[0][1]);
    let (mut max_x, mut max_y) = (points[0][0], points[0][1]);
    for p in points.iter() {
        if p[0] < min_x { min_x = p[0]; }
        if p[1] < min_y { min_y = p[1]; }
        if p[0] > max_x { max_x = p[0]; }
        if p[1] > max_y { max_y = p[1]; }
    }
    [min_x, min_y, max_x - min_x, max_y - min_y]
}

pub struct Visitor {
    paths: Vec<Path>,
}

impl Visitor {
    pub fn new() -> Self {

        Self {
            paths: Vec::new(),
        }
    }

    pub fn traverse(&mut self, parent: &usvg::Group) {
        for node in parent.children() {
            if let Node::Path(ref path) = *node {
                let id = node.id().to_string();
                let d = path.data().points().iter().map(|p| [p.x, p.y]).collect::<Vec<[f32; 2]>>();
                let centroid = calculate_centroid(&d);
                let viewbox = calculate_viewbox(&d);
                self.paths.push(Path { id, d, centroid, viewbox });
            }
    
            if let usvg::Node::Group(g) = node {
                self.traverse(g);
            }
    
            // handle subroots as well
            node.subroots(|subroot| self.traverse(subroot));
        }
    }

    pub fn paths(&self) -> &Vec<Path> {
        &self.paths
    }
}