#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

bool isValidMove(int *maze, bool *visited, int curr_row, int curr_col, int rows, int cols) {
    return (curr_row >= 0 && curr_row < rows && curr_col >= 0 && curr_col < cols &&
            maze[curr_row * cols + curr_col] == 0 && !visited[curr_row * cols + curr_col]);
}

bool dfsRecursive(int *maze, bool *visited, int curr_row, int curr_col, int end_x, int end_y, int *path, int *path_length, int rows, int cols) {
    if (curr_row == end_x && curr_col == end_y) {
        path[(*path_length) * 2] = curr_row;
        path[(*path_length) * 2 + 1] = curr_col;
        (*path_length)++;
        return true;
    }

    if (!isValidMove(maze, visited, curr_row, curr_col, rows, cols)) {
        return false;
    }

    visited[curr_row * cols + curr_col] = true;
    path[(*path_length) * 2] = curr_row;
    path[(*path_length) * 2 + 1] = curr_col;
    (*path_length)++;

    int directions[4][2] = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}}; // R U L B

    for (int i = 0; i < 4; i++) {
        int next_x = curr_row + directions[i][0];
        int next_y = curr_col + directions[i][1];
        if (dfsRecursive(maze, visited, next_x, next_y, end_x, end_y, path, path_length, rows, cols)) {
            return true;
        }
    }

    visited[curr_row * cols + curr_col] = false;
    (*path_length)--;
    return false;
}

int dfs(int *maze, int rows, int cols, int start_x, int start_y, int end_x, int end_y, int *path) {
    bool visited[rows * cols];
    for (int i = 0; i < rows * cols; i++) {
        visited[i] = false;
    }

    int path_length = 0;
    dfsRecursive(maze, visited, start_x, start_y, end_x, end_y, path, &path_length, rows, cols);

    return path_length;
}

typedef struct {
    int row;
    int col;
    int distance;
    int prev_index;
} QueueNode;


int bfs(int *maze, int rows, int cols, int start_x, int start_y, int end_x, int end_y, int *path) {
    bool visited[rows * cols];
    for (int i = 0; i < rows * cols; i++) {
        visited[i] = false;
    }

    QueueNode *queue = (QueueNode *)malloc(rows * cols * sizeof(QueueNode));
    int front = 0, rear = 0;

    queue[rear++] = (QueueNode){start_x, start_y, 0, -1};
    visited[start_x * cols + start_y] = true;

    int *prev = (int *)malloc(rows * cols * sizeof(int));
    for (int i = 0; i < rows * cols; i++) {
        prev[i] = -1;
    }

    int directions[4][2] = {{1, 0}, {0, 1}, {-1, 0}, {0, -1}};

    while (front < rear) {
        QueueNode current = queue[front++];

        if (current.row == end_x && current.col == end_y) {
            int path_length = 0;
            int path_index = current.row * cols + current.col;

            while (path_index != -1) {
                path[path_length * 2] = path_index / cols;
                path[path_length * 2 + 1] = path_index % cols;
                path_length++;
                path_index = prev[path_index];
            }

            for (int i = 0; i < path_length / 2; i++) {
                int temp_x = path[i * 2], temp_y = path[i * 2 + 1];
                path[i * 2] = path[(path_length - i - 1) * 2];
                path[i * 2 + 1] = path[(path_length - i - 1) * 2 + 1];
                path[(path_length - i - 1) * 2] = temp_x;
                path[(path_length - i - 1) * 2 + 1] = temp_y;
            }

            free(queue);
            free(prev);
            return path_length;
        }

        for (int i = 0; i < 4; i++) {
            int next_row = current.row + directions[i][0];
            int next_col = current.col + directions[i][1];

            if (isValidMove(maze, visited, next_row, next_col, rows, cols)) {
                visited[next_row * cols + next_col] = true;
                queue[rear++] = (QueueNode){next_row, next_col, current.distance + 1, current.row * cols + current.col};
                prev[next_row * cols + next_col] = current.row * cols + current.col;
            }
        }
    }

    free(queue);
    free(prev);
    return 0;
}

