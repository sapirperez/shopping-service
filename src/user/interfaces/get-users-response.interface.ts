import { User } from "src/entities/user.entity";

export interface IUsersResponse {
    users: User[];
    total: number;
}