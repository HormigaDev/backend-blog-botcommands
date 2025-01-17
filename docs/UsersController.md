# Users Controller Documentation

## `GET /users/all`

This endpoint retrieves all users with pagination.

- **Method**: `GET`
- **Response**:
    - `200 OK`: A list of users with a total count.
    - **Query Parameters**:
        - `pagination`: Defines pagination settings (page and limit).
        ```json
        "pagination": {
            "page": 1,
            "limit": 10
        }
        ```
    - **Response Body**:
    ```json
    {
        "users": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john.doe@example.com",
                "status": 1,
                "createdAt": "2024-12-01T10:00:00.sssZ",
                "lastUpdate": "2025-01-01T08:30:15.sssZ"
            }
            ...
        ],
        "count": 10
    }
    ```

## `GET /users/userinfo/:id`

This endpoint retrieves detailed information about a specific user by ID.

- **Method**: `GET`
- **Path Parameter**:
    - `id`: The unique ID of the user.
- **Response**:
    - `200 OK`: The user information.
    - **Response Body**:
    ```json
    {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john.doe@example.com",
            "status": 1,
            "createdAt": "2024-12-01T10:00:00.sssZ",
            "lastUpdate": "2025-01-01T08:30:15.sssZ"
        }
    }
    ```

## `GET /users/info/me`

This endpoint retrieves information about the currently authenticated user.

- **Method**: `GET`
- **Response**:
    - `200 OK`: The current authenticated user's information.
    - **Response Body**:
    ```json
    {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john.doe@example.com",
            "status": 1,
            "createdAt": "2024-12-01T10:00:00.sssZ",
            "lastUpdate": "2025-01-01T08:30:15.sssZ"
        }
    }
    ```

## `POST /users/create`

This endpoint creates a new user.

- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "password": "Password123!"
    }
    ```
- **Response**:
    - `201 Created`: The newly created user.
    - **Response Body**:
    ```json
    {
        "user": {
            "id": 2,
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "status": 1,
            "createdAt": "2024-12-01T10:00:00.sssZ",
            "lastUpdate": "2024-12-01T10:00:00.sssZ"
        }
    }
    ```

## `PUT /users/user/:id`

This endpoint updates a specific user's details by ID.

- **Method**: `PUT`
- **Path Parameter**:
    - `id`: The unique ID of the user to update.
- **Request Body**:
    ```json
    {
        "name": "John Doe Updated",
        "email": "john.doe.updated@example.com"
    }
    ```
- **Response**:
    - `204 No Content`: Successfully updated the user.
    - **Response Body**: Empty.

## `PUT /users/update/self`

This endpoint updates the currently authenticated user's own details.

- **Method**: `PUT`
- **Request Body**:
    ```json
    {
        "name": "John Doe Updated"
    }
    ```
- **Response**:
    - `204 No Content`: Successfully updated the current user's details.
    - **Response Body**: Empty.

## `DELETE /users/user/:id`

This endpoint deletes a specific user by ID.

- **Method**: `DELETE`
- **Path Parameter**:
    - `id`: The unique ID of the user to delete.
- **Response**:
    - `204 No Content`: Successfully deleted the user.
    - **Response Body**: Empty.
