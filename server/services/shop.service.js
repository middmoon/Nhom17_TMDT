"use strict";
require("dotenv").config();

const ROLE = JSON.parse(process.env.ROLES).seller;

const { NotFoundError, BadRequestError } = require("../core/error.response");

const { getInfoData } = require("../utils");

const { sequelize, User, Shop, UserRole, Product } = require("../models");
const { createSlug } = require("../utils/slug");

const cloudinary = require("../config/cloudinary.config");

class ShopService {
  static async registerShop(payload, userId) {
    const foundUser = await User.findOne({
      where: { _id: userId },
      attributes: ["_id"],
    });

    if (!foundUser) {
      throw new NotFoundError("Something wrong with your info: Not find user");
    }

    const foundShop = await Shop.findOne({
      where: { seller_id: userId },
      attributes: ["_id"],
    });

    if (foundShop) {
      throw new BadRequestError("You already have a booth");
    }

    const t = await sequelize.transaction();

    try {
      const slug = createSlug(payload.name);

      const newShop = await Shop.create(
        {
          seller_id: userId,
          name: payload.name,
          slug: slug,
        },
        { transaction: t }
      );

      if (!newShop) {
        throw new BadRequestError("Can not create a new booth");
      }

      const newRole = await UserRole.create(
        {
          user_id: userId,
          role_id: ROLE,
        },
        { transaction: t }
      );

      if (!newRole) {
        throw new BadRequestError("Can not add a new role");
      }

      await t.commit();

      return {
        shop: getInfoData({
          fields: ["_id", "name"],
          object: newShop,
        }),
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async viewShop(ownerId) {
    const foundUser = await User.findOne({
      where: { _id: ownerId },
      attributes: ["_id"],
    });

    if (!foundUser) {
      throw new NotFoundError("Something wrong with your info: Not find user");
    }

    const foundShop = await Shop.findOne({
      where: { seller_id: ownerId },
    });

    if (!foundShop) {
      throw new NotFoundError("Something wrong with your info: Not find shop");
    }

    return {
      shop: foundShop,
    };
  }

  static async updateShopInfo() {}

  static async updateShopImage(ownerId, file) {
    const imgPath = file.path;

    const foundUser = await User.findOne({
      where: { _id: ownerId },
      attributes: ["_id"],
    });

    if (!foundUser) {
      throw new NotFoundError("Something wrong with your info: Not find user");
    }

    const foundShop = await Shop.findOne({
      where: { seller_id: ownerId },
    });

    if (!foundShop) {
      throw new NotFoundError("Something wrong with your info: Not find shop");
    }

    try {
      const r = await cloudinary.uploader.upload(imgPath, {
        folder: "shops",
        public_id: `shop_${foundShop._id}`,
        overwrite: true,
      });

      if (!r) {
        throw new BadRequestError("Error---: Can not update this user");
      }

      const updatedShop = await Shop.update(
        {
          img_url: r.secure_url,
        },
        {
          where: {
            _id: foundShop._id,
          },
        }
      );

      if (updatedShop.length === 0) {
        throw new NotFoundError("Error: Can not update this shop");
      }

      return {
        shop: updatedShop,
      };
    } catch (error) {
      throw error;
    }
  }

  static async addProduct(payload, ownerId) {
    const foundUser = await User.findOne({
      where: { _id: ownerId },
      attributes: ["_id"],
    });

    if (!foundUser) {
      throw new NotFoundError("Something wrong with your info: Not find user");
    }

    const foundShop = await Shop.findOne({
      where: { seller_id: ownerId },
      attributes: ["_id"],
    });

    if (!foundShop) {
      throw new NotFoundError("Something wrong with your info: Not find shop");
    }

    const slug = createSlug(payload.name);

    const newProduct = await Product.create({
      name: payload.name,
      description: payload.description,
      price: payload.price,
      sale_price: payload.sale_price,
      stock_quantity: payload.stock_quantity,
      slug: slug,
      shop_id: foundShop._id,
      brand_id: payload.brand_id,
      category_id: payload.category_id,
    });

    if (!newProduct) {
      throw new BadRequestError("Can not add new product for your shop");
    }

    return {
      newProduct,
    };
  }

  static async addProductImage(ownerId, file) {}

  static async updateProductInfo() {}

  static async deleteProduct() {}

  static async viewProducts() {}

  static async viewProductById() {}

  static async viewOrders() {}

  static async viewOrderById(orderId) {}

  static async updateOrder(orderId) {}
}

module.exports = ShopService;
