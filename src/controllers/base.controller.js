import { customizeError } from "../utils/common.js";

class BaseController {
  constructor(model) {
    if (new.target === BaseController) {
      throw new TypeError("Cannot construct BaseController instances directly");
    }

    this.model = model;
  }
  async getAll(req, res, next) {
    try {
      const totalDoc = await this.model.countDocuments();
      const data = await this.model
        .find()
        .limit(req.query.limit ? req.query.limit : 0)
        .skip(req.query.skip ? req.query.skip : 0);

      return res.status(200).json({ data: data, totalDoc: totalDoc });
    } catch (error) {
      next(error);
    }
  }
  async getById(req, res, next) {
    const { id } = req.params;
    try {
      const data = await this.model.findById({ uId: id });
      if (!data) {
        throw customizeError(400, "Resource not found");
      }
      return res.status(200).json({ data: data });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    const newData = req.body;
    try {
      const createdData = await this.model.create(newData);

      if (!createdData) {
        throw customizeError(400, "Create data failed");
      }
      return res.status(200).json({ data: createdData });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    const { id } = req.params;
    const updatedData = req.body;
    try {
      const result = await this.model.findOneAndUpdate(
        { uId: id },
        updatedData,
        { new: true }
      );
      if (!result) {
        throw customizeError(400, "Update data failed");
      }
      return res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    const { id } = req.params;
    try {
      const result = await this.model.findOneAndDelete({ uId: id });
      if (!result) {
        throw customizeError(400, "Delete data failed");
      }
      return res.status(200).json({ message: "Data deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default BaseController;
