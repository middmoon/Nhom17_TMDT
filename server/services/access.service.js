"use strict";

require("dotenv").config();
const { sequelize, User, Role, UserRole } = require("../models");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { getInfoData } = require("../utils");
const bcrypt = require("bcrypt");
const emailValidator = require("email-validator");
const jwt = require("jsonwebtoken");
// const KeyService = require("./key.service");

class AccessService {
  static signUp = async ({ email, password }) => {
    const t = await sequelize.transaction();

    try {
      const foundUser = await User.findOne({
        where: { email },
        transaction: t,
      });
      if (foundUser) {
        throw new BadRequestError("Error: Account already registered");
      }

      const customerRole = await Role.findOne({
        where: { name: "customer" },
        transaction: t,
      });

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      const newUser = await User.create(
        {
          email,
          password: hashPassword,
        },
        { transaction: t }
      );

      await UserRole.create(
        {
          user_id: newUser._id,
          role_id: customerRole._id,
        },
        { transaction: t }
      );

      await t.commit();

      return {
        user: getInfoData({
          fields: ["_id", "email", "role"],
          object: newUser,
        }),
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  static login = async ({ option, password, res }) => {
    let foundUser;

    // emailValidator.validate(option)
    //   ? (foundUser = await User.findOne({ where: { email: option } }))
    //   : (foundUser = await User.findOne({ where: { user_name: option } }));

    if (emailValidator.validate(option)) {
      foundUser = await User.findOne({ where: { email: option } });
    } else {
      foundUser = await User.findOne({ where: { user_name: option } });
    }

    if (!foundUser) {
      throw new BadRequestError("Error: Username or Password do not match");
    }

    const validPassword = await bcrypt.compare(password, foundUser.password);

    if (!validPassword) {
      throw new BadRequestError("Error: Username or Password do not match");
    }

    if (foundUser && validPassword) {
      // create token pair //
      // const tokenPair = await KeyService.createTokenPair(foundUser);
      // const store = await KeyService.storeRefreshToken({
      //   id_user: foundUser._id,
      //   refreshTokenUsed: tokenPair.refreshToken,
      // });

      const accessToken = jwt.sign(
        { _id: foundUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10d" }
      );

      return {
        user: getInfoData({ fields: ["_id", "role"], object: foundUser }),
        accessToken: accessToken,
      };
    }
  };

  static refresh = async ({ refreshToken, userInfo }) => {
    if (!refreshToken) {
      throw new BadRequestError("Error: You are not authenticated");
    }

    // console.log({
    //   if: "access service",
    //   userInfo,
    //   refreshToken,
    // });

    const tokenPair = await KeyService.refesh(refreshToken, userInfo);

    // console.log({
    //   if: "access service",
    //   tokenPair,
    // });

    if (!tokenPair) {
      throw new BadRequestError("Error: Create token pair fails");
    }

    return tokenPair;
  };

  // static logout = async (userInfo) => {
  //   return await KeyService.deleteKeyByIdUser(userInfo._id);
  // };
}

module.exports = AccessService;
