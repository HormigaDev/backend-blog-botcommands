# AuthController

## POST /auth/login

### Description:

Logs in the user by verifying their email and password. If successful, a JWT token is generated and returned in a secure cookie.

### Request Body:

```json
{
    "email": "user@example.com",
    "password": "string"
}
```

- **email**: The email address of the user. It must be a non-empty string with a valid email format. (Required)
- **password**: The password of the user. It must be a non-empty string with a minimum length of 8 characters. (Required)

### Response:

- **200 OK**: If the login is successful, a `message` will be returned confirming the login.

    ```json
    {
        "message": "Login successful"
    }
    ```

- **401 Unauthorized**: If the credentials are invalid.
    ```json
    {
        "message": "Invalid Credentials"
    }
    ```

---

## POST /auth/logout

### Description:

Logs out the user by clearing the authentication token stored in the cookies.

### Request:

No body is required.

### Response:

- **200 OK**: If the logout is successful, a `message` will be returned confirming the logout.
    ```json
    {
        "message": "Logout successful"
    }
    ```

---

## PUT /auth/update/password

### Description:

Updates the password for the logged-in user after verifying their previous password.

### Request Body:

```json
{
    "prevPassword": "string",
    "newPassword": "string"
}
```

- **prevPassword**: The previous password of the user. It must be a string. (Required)
- **newPassword**: The new password of the user. It must be a string, at least 12 characters long, and must contain at least one uppercase letter, one lowercase letter, one number, and one special character. (Required)

### Response:

- **204 No Content**: If the password is successfully updated.

- **401 Unauthorized**: If the provided previous password does not match the stored password.
    ```json
    {
        "message": "Invalid previous password"
    }
    ```
