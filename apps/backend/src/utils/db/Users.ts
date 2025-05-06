import Prisma from "./Prisma";
import * as bcrypt from "bcrypt";
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: "USER" | "ADMIN"
) {
  const userExist = await Prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  if (userExist) {
    return false;
  }
  return await Prisma.user.create({
    data: {
      name: name,
      email: email,
      password: await bcrypt.hash(password, 10),
      role: role,
    },
  });
}

export async function getUserByEmail(email: string) {
  return await Prisma.user.findFirst({
    where: {
      email: email,
    },
  });
}
