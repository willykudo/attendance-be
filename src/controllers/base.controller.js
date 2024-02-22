import { customizeError } from '../utils/common.js';

class BaseController {
  constructor(model) {
    if (new.target === BaseController) {
      throw new TypeError('Cannot construct BaseController instances directly');
    }

    this.model = model;
  }
  async getAll(req, res, next) {
    try {
      // QUERY BASE ON MODEL DATA
      let query = {};

      for (const key in req.query) {
        if (
          key !== 'pages' &&
          key !== 'limit' &&
          key !== 'sortBy' &&
          key !== 'orderBy' &&
          Object.prototype.hasOwnProperty.call(req.query, key)
        ) {
          // Check if the field exists in the model
          const fieldExists = Object.keys(this.model.schema.paths).includes(
            key
          );
          if (fieldExists) {
            query[key] = req.query[key]; // Add to search criteria
          } else {
            return res.status(500).json({
              msg: `Field '${key}' Not Found`,
            });
          }
        }
      }

      const totalDoc = await this.model.countDocuments();

      // PAGINATION
      const pages = parseInt(req.query.pages) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (pages - 1) * limit;
      // SORTING BY ASCENDING OR DESCENDING
      const sortBy = req.query.sortBy || 'createdAt';
      const orderBy = req.query.orderBy || 1;

      const total_Pages = Math.ceil(totalDoc / limit);

      if (pages > total_Pages) {
        throw new Error('This Page is not found!');
      }

      const data = await this.model
        .find(query)
        .sort({ [sortBy]: orderBy })
        .limit(limit)
        .skip(skip);

      const dataQuery = await this.model.find(query);

      if (data.length === 0) {
        return res.status(404).json({ message: 'Data not found' });
      }

      const totalDocs = query !== null ? dataQuery.length : totalDoc;

      return res
        .status(200)
        .json({ pages: pages, limit: limit, totalDoc: totalDocs, data: data });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    const { id } = req.params;
    try {
      const data = await this.model.findById({ uId: id });
      if (!data) {
        throw customizeError(400, 'Resource not found');
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
        throw customizeError(400, 'Create data failed');
      }
      return res.status(201).json({ data: createdData });
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
        throw customizeError(400, 'Update data failed');
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
        throw customizeError(400, 'Delete data failed');
      }
      return res.status(200).json({ message: 'Data deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default BaseController;
