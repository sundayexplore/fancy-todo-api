import { verify as verifyJWT, sign as signJWT } from 'jsonwebtoken';
import User from '../models/user';

export default async (refreshToken: string | any): Promise<any> => {
  const err = new Error();
  err.name = "RefreshTokenError";

  try {
    const JWT_REFRESH_SECRET: string | any = process.env.JWT_REFRESH_SECRET;
    const JWT_ACCESS_SECRET: string | any = process.env.JWT_ACCESS_SECRET;
    const decodedRefreshToken: any = await verifyJWT(refreshToken, JWT_REFRESH_SECRET);
    const foundUser = await User.findOne({ username: decodedRefreshToken.username });

    if (!foundUser) {
      err.message = "Invalid refresh token due to no user found!";
      throw err;
    } else {
      const userRefreshTokens = foundUser.refreshTokens;
      if (userRefreshTokens.includes(refreshToken)) {
        const { firstName, lastName, email, username } = foundUser;
        const newAccessToken = await signJWT({ firstName, lastName, email, username }, JWT_ACCESS_SECRET, { expiresIn: "7d" });
        const newRefreshToken = await signJWT({ username }, JWT_REFRESH_SECRET, { expiresIn: "365d" });
        const newUserRefreshTokens = userRefreshTokens.filter(refreshTokenEl => {
          return refreshTokenEl != refreshToken;
        });
        newUserRefreshTokens.push(newRefreshToken);
        await User.updateOne({ username }, { refreshTokens: newUserRefreshTokens });
        return Promise.resolve({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        });
      } else {
        err.message = "Invalid refresh token!";
        throw err;
      }
    }
  } catch (err) {
    return Promise.reject(err);
  }
};