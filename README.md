# Backend Blog Bot Example Commands

This project is an API designed to store example bot commands for Discord. It is implemented with a focus on security, simplicity, and a scalable architecture.

## Features

- **Secure Authentication**: Authentication system based on JWT (JSON Web Tokens) with additional security measures.
- **Granular Permissions**: Detailed access control, allowing specific permissions to be assigned to users for different actions within the API.
- **Unit Tests**: The project includes unit tests for critical functions, ensuring their proper operation and preventing future errors.
- **Focus on Security**: Implementation of basic security measures such as protection against CSRF, XSS attacks, and IP-based access restrictions.
- **Clear Documentation**: Each endpoint and functionality is well-documented, with usage examples and possible errors.

## Controllers

You can view the documentation for each controller separately in the following files:

- [Auth Controller](docs/AuthController.md)
- [Users Controller](docs/UsersController.md)
- [Roles Controller](docs/RolesController.md)
- [Posts Controller](docs/PostController.md)
