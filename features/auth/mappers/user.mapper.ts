import type { UserEntity } from "../types/auth.entity";
import type { UserDto } from "../types/auth.dto";

/** Strips the password hash; only the safe fields cross the wire. */
export function toUserDto(user: UserEntity): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    workspaceId: user.workspaceId,
  };
}
