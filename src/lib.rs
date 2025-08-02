// use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::{from_value, to_value};
use std::collections::VecDeque;
use wasm_bindgen::prelude::*;
#[wasm_bindgen]
#[derive(Clone)]
pub struct Node {
    x: usize,
    y: usize,
    g: f64,
    h: f64,
    f: f64,
    parent: Option<Box<Node>>,
}

impl Node {
    fn new(x: usize, y: usize, g: f64, h: f64, parent: Option<Box<Node>>) -> Self {
        Node {
            x,
            y,
            g,
            h,
            f: g + h,
            parent,
        }
    }
}

#[wasm_bindgen]
pub fn a_star_rs(
    grid: Vec<JsValue>,
    start: JsValue,
    goal: JsValue,
    congregate_distance: usize,
) -> JsValue {
    let grid: Vec<Vec<u8>> = grid
        .into_iter()
        .map(|row| from_value(row).unwrap())
        .collect();

    let start: Coord = from_value(start).unwrap();
    let goal: Coord = from_value(goal).unwrap();

    let heuristic = |a: &Coord, b: &Coord| -> f64 {
        ((a.x as isize - b.x as isize).abs() + (a.y as isize - b.y as isize).abs()) as f64
    };

    let mut open_list: Vec<Node> = Vec::new();
    let mut closed_list: Vec<(usize, usize)> = Vec::new();
    let mut closest_node: Option<Node> = None;

    open_list.push(Node::new(
        start.x,
        start.y,
        0.0,
        heuristic(&start, &goal),
        None,
    ));

    while !open_list.is_empty() {
        open_list.sort_by(|a, b| a.f.partial_cmp(&b.f).unwrap());
        let current = open_list.remove(0);

        if heuristic(
            &Coord {
                x: current.x,
                y: current.y,
            },
            &goal,
        ) <= congregate_distance as f64
        {
            return to_value(&reconstruct_path(current)).unwrap();
        }

        if closest_node.is_none()
            || heuristic(
                &Coord {
                    x: current.x,
                    y: current.y,
                },
                &goal,
            ) < heuristic(
                &Coord {
                    x: closest_node.as_ref().unwrap().x,
                    y: closest_node.as_ref().unwrap().y,
                },
                &goal,
            )
        {
            closest_node = Some(current.clone());
        }

        closed_list.push((current.x, current.y));

        let directions = [
            (-1, 0),
            (1, 0),
            (0, -1),
            (0, 1),
            (-1, -1),
            (1, -1),
            (-1, 1),
            (1, 1),
        ];

        for (dx, dy) in directions.iter() {
            let nx = current.x as isize + dx;
            let ny = current.y as isize + dy;

            if nx < 0 || ny < 0 || nx >= grid[0].len() as isize || ny >= grid.len() as isize {
                continue;
            }

            let nx = nx as usize;
            let ny = ny as usize;

            if grid[ny][nx] == 1 || closed_list.contains(&(nx, ny)) {
                continue;
            }

            let is_diagonal = current.x != nx && current.y != ny;
            let g = current.g + if is_diagonal { 2f64.sqrt() } else { 1.0 };
            let h = heuristic(&Coord { x: nx, y: ny }, &goal);

            let existing_index = open_list.iter().position(|n| n.x == nx && n.y == ny);
            if let Some(index) = existing_index {
                if g < open_list[index].g {
                    open_list[index].g = g;
                    open_list[index].f = g + h;
                    open_list[index].parent = Some(Box::new(current.clone()));
                }
            } else {
                open_list.push(Node::new(nx, ny, g, h, Some(Box::new(current.clone()))));
            }
        }
    }

    if let Some(node) = closest_node {
        return to_value(&reconstruct_path(node)).unwrap();
    }

    to_value(&Vec::<Coord>::new()).unwrap()
}

fn reconstruct_path(mut node: Node) -> Vec<Coord> {
    let mut path = VecDeque::new();
    loop {
        path.push_front(Coord {
            x: node.x,
            y: node.y,
        });
        match node.parent {
            Some(ref parent) => node = *parent.clone(),
            None => break,
        }
    }
    path.into_iter().collect()
}

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Coord {
    x: usize,
    y: usize,
}
