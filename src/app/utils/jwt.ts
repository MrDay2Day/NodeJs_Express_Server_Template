import jwt from "jsonwebtoken";

// Provide types for verified token
type VerifyType = {
  [key: string]: any | unknown;
};

export const createToken = async (data: { [key: string]: any }) => {
  try {
    // console.log(parseInt(process.env.JWT_TOKEN_EXPIRE));
    const hrs = 3600000 * parseInt(process.env.JWT_TOKEN_EXPIRE);
    // console.log({ hrs });

    const newHrs = String(Date.now() + hrs);
    // console.log({ newHrs, JWT_TOKEN_EXPIRE: process.env.JWT_TOKEN_EXPIRE });

    const token = await jwt.sign({ data }, process.env.SALT, {
      expiresIn: `${process.env.JWT_TOKEN_EXPIRE}h`,
    });
    return { token, expires: String(newHrs) };
  } catch (err) {
    throw err;
  }
};

export const createSystemToken = async (data: { [key: string]: any }) => {
  try {
    const token = await jwt.sign({ data }, process.env.SALT);
    return { token, expires: "never" };
  } catch (err) {
    throw err;
  }
};

export const verifyToken = async (token: string): Promise<VerifyType> => {
  try {
    const result = jwt.verify(token, process.env.SALT) as VerifyType;
    return result;
  } catch (err) {
    throw err;
  }
};
