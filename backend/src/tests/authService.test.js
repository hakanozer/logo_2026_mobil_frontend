const { login } = require("../services/authService");
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../models/User", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
// const { login } = require("../services/authService");

describe("authService.login", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "7d";
  });

  test("giriş başarılı olmalı (seller2@test.com / password123)", async () => {
    const input = {
      email: "seller2@test.com",
      password: "password123",
    };

    const safeUser = {
      id: "u1",
      name: "Seller 2",
      email: "seller2@test.com",
      role: "seller",
    };

    const userDoc = {
      _id: "507f1f77bcf86cd799439011",
      role: "seller",
      password: "hashed-password",
      toSafeObject: jest.fn().mockReturnValue(safeUser),
    };

    const selectMock = jest.fn().mockResolvedValue(userDoc);
    User.findOne.mockReturnValue({ select: selectMock });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mock-jwt-token");

    const result = await login(input);

    expect(User.findOne).toHaveBeenCalledWith({ email: "seller2@test.com" });
    expect(selectMock).toHaveBeenCalledWith("+password");
    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashed-password");
    expect(jwt.sign).toHaveBeenCalledWith(
      { sub: userDoc._id.toString(), role: "seller" },
      "test-secret",
      { expiresIn: "7d" }
    );
    expect(result).toEqual({
      user: safeUser,
      token: "mock-jwt-token",
    });
  });

  test("email trim/lowercase normalize edilmeli", async () => {
    const input = {
      email: "  Seller2@Test.com  ",
      password: "password123",
    };

    const userDoc = {
      _id: "507f1f77bcf86cd799439011",
      role: "seller",
      password: "hashed-password",
      toSafeObject: jest.fn().mockReturnValue({ id: "u1" }),
    };

    const selectMock = jest.fn().mockResolvedValue(userDoc);
    User.findOne.mockReturnValue({ select: selectMock });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token");

    await login(input);

    expect(User.findOne).toHaveBeenCalledWith({ email: "seller2@test.com" });
  });

  test("kullanıcı bulunamazsa 401 hatası dönmeli", async () => {
    const selectMock = jest.fn().mockResolvedValue(null);
    User.findOne.mockReturnValue({ select: selectMock });

    await expect(
      login({ email: "seller2@test.com", password: "password123" })
    ).rejects.toMatchObject({
      message: "E-posta veya şifre hatalı",
      statusCode: 401,
    });
  });

  test("şifre hatalıysa 401 hatası dönmeli", async () => {
    const userDoc = {
      _id: "507f1f77bcf86cd799439011",
      role: "seller",
      password: "hashed-password",
      toSafeObject: jest.fn(),
    };

    const selectMock = jest.fn().mockResolvedValue(userDoc);
    User.findOne.mockReturnValue({ select: selectMock });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      login({ email: "seller2@test.com", password: "password123" })
    ).rejects.toMatchObject({
      message: "E-posta veya şifre hatalı",
      statusCode: 401,
    });
  });
});