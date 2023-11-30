import UserModel from "../models/user.model.js";
import BaseController from "./base.controller.js";

class UserController extends BaseController {
    constructor() {
      super(UserModel);
    }
}

const userController = new UserController();
export default userController;