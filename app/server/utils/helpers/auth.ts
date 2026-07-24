import bcrypt from "bcrypt";

export default async function validToken(input: string, password: string): Promise<boolean> {
    return bcrypt.compare(input, password);
};