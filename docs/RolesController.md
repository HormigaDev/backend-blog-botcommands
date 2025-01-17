# Roles Controller Documentation

## `GET /roles/all`

This endpoint retrieves all roles with pagination.

- **Method**: `GET`
- **Response**:
    - `200 OK`: A list of roles.
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
        "roles": [
            {
                "id": 1,
                "name": "Admin",
                "permissions": 8
            }
        ]
    }
    ```

## `POST /roles/role`

This endpoint creates a new role.

- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "name": "Moderator",
        "permissions": 16
    }
    ```
- **Response**:
    - `201 Created`: The newly created role.
    - **Response Body**:
    ```json
    {
        "role": {
            "id": 2,
            "name": "Moderator",
            "permissions": 16
        }
    }
    ```

## `PUT /roles/role/:id`

This endpoint updates a specific role's details by ID.

- **Method**: `PUT`
- **Path Parameter**:
    - `id`: The unique ID of the role to update.
- **Request Body**:
    ```json
    {
        "name": "Super Moderator",
        "permissions": 4
    }
    ```
- **Response**:
    - `204 No Content`: Successfully updated the role.
    - **Response Body**: Empty.

## `DELETE /roles/role/:id`

This endpoint deletes a specific role by ID.

- **Method**: `DELETE`
- **Path Parameter**:
    - `id`: The unique ID of the role to delete.
- **Response**:
    - `204 No Content`: Successfully deleted the role.
    - **Response Body**: Empty.
