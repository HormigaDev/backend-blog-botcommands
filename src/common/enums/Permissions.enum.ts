// Al actualizar los permisos aqui debe actualizarse su contraparte de JS en
// dev/perms.js
// Y también actualizar src/sql/db.sql
export enum Permissions {
    CreateUsers = 2 ** 0,
    ReadUsers = 2 ** 1,
    UpdateUsers = 2 ** 2,
    DeleteUsers = 2 ** 3,

    CreateRoles = 2 ** 4,
    ReadRoles = 2 ** 5,
    UpdateRoles = 2 ** 6,
    DeleteRoles = 2 ** 7,

    CreatePosts = 2 ** 8,
    UpdatePosts = 2 ** 9,
    DeletePosts = 2 ** 10,
}
