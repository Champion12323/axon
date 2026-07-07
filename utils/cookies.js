export const setCookies = (res, cookies) => {
  Object.entries(cookies).forEach(([name, value]) => {
    res.cookie(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: name === 'accessToken' ? 15 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
    });
  });
};

export const clearCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};
