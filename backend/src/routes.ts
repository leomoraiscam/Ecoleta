import express from "express";
import multer from "multer";
import multerConfig from "./config/multer";
const routes = express.Router();
const upload = multer(multerConfig);
import { celebrate, Joi, Segments } from "celebrate";

import PointsController from "./controllers/PointsController";
import ItemsController from "./controllers/ItemsController";

const pointsControllers = new PointsController();
const itensController = new ItemsController();

routes.get("/items", itensController.index);

routes.post(
  "/points",
  upload.single("image"),
  celebrate(
    {
      body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        whatsapp: Joi.number().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        city: Joi.string().required(),
        uf: Joi.string().required().max(2),
        items: Joi.string().required(),
      }),
    },
    { abortEarly: false }
  ),
  pointsControllers.create
);
routes.get("/points", pointsControllers.index);
routes.get("/points/:id", pointsControllers.show);

export default routes;
