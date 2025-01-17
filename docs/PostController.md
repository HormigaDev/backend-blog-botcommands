# Posts Controller Documentation

## `GET /posts/post/:id`

This endpoint retrieves a specific post by its ID.

- **Method**: `GET`
- **Path Parameters**:
    - `id`: The unique ID of the post to retrieve.
- **Response**:
    - `200 OK`: The requested post.
    - **Response Body**:
    ```json
    {
        "post": {
            "id": 1,
            "title": "Sample Post",
            "content": "This is the content of the post",
            "userId": 1,
            "status": 1,
            "keywords": ["discord", "bot", "commands"],
            "createdAt": "2024-12-01T10:00:00.sssZ",
            "lastUpdate": "2024-12-10T08:00:00.sssZ"
        }
    }
    ```

## `GET /posts/all`

This endpoint retrieves all posts with pagination, filters, and ordering options.

- **Method**: `GET`
- **Query Parameters**:
    - `pagination`: Defines pagination settings (page and limit).
    - `filters`: Allows filtering posts (e.g., by title or keywords).
    - `order`: Defines sorting options for the posts (e.g., by date).
- **Response**:
    - `200 OK`: A list of posts with pagination.
    - **Response Body**:
    ```json
    {
        "posts": [
            {
                "id": 1,
                "title": "Sample Post",
                "content": "This is the content of the post",
                "userId": 1,
                "status": 1,
                "keywords": ["discord", "bot", "commands"],
                "createdAt": "2024-12-01T10:00:00.sssZ",
                "lastUpdate": "2024-12-10T08:00:00.sssZ"
            }
        ],
        "count": 1
    }
    ```

## `POST /posts/upload`

This endpoint allows uploading markdown files for creating or updating posts.

- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "title": "My New Post",
        "keywords": ["example", "post"],
        "id": 1
    }
    ```
- **Request Files**:
    - `files`: The markdown file containing the post content.
- **Response**:
    - `201 Created`: Successfully saved the post.
    - **Response Body**:
    ```json
    {
        "message": "Post saved sucessfully!"
    }
    ```

## `GET /posts/download/:id`

This endpoint allows downloading the content of a post as a markdown file.

- **Method**: `GET`
- **Path Parameters**:
    - `id`: The unique ID of the post to download.
- **Response**:
    - `200 OK`: The markdown file containing the post content.
    - **Response Headers**:
        - `Content-Type`: `text/markdown`
        - `Content-Disposition`: `attachment; filename="post-title.md"`
    - **Response Body**: The content of the post as a markdown file.
