
import express from "express";
import userController from "../controllers/user.controller.js";

const userRoutes = express.Router();

userRoutes.get("/", async (req, res, next) => {
    await userController.getAll(req, res, next);
});

userRoutes.get("/:id", async (req, res, next) => {
    await userController.getById(req, res, next);
});

userRoutes.post("/", async (req, res, next) => {
    await userController.create(req, res, next);
});

userRoutes.put("/:id", async (req, res, next) => {
    await userController.update(req, res, next);
});

userRoutes.delete("/:id", async (req, res, next) => {
    await userController.delete(req, res, next);
});

export default userRoutes;