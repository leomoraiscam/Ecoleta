import { Request, Response } from "express";
import connection from "../database/connection";

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    
    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    const points = await connection("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");

    const serializedPoints = points.map((points) => {
      return {
        ...points,
        image_url: `http:192.168.100.7:3333/uploads/${points.image}`,
      };
    });

    return response.json(serializedPoints);
  }
  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await connection("items").where({ id }).first();

    if (!point) {
      return response.status(400).json({ message: "Point not found" });
    }

    const serializedPoint = {
      ...point,
      image_url: `http:192.168.100.7:3333/uploads/${point.image}`,
    };

    const items = await connection("items")
      .join("point_items", "items.id", "=", "point_items.item_id")
      .where("point_items.point_id", id)
      .select("items.title");

    return response.json({ point: serializedPoint, items });
  }
  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const trx = await connection.transaction();

    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const insertedIds = await trx("points").insert(point);

    const point_id = insertedIds[0];

    const pointItens = items
      .split(",")
      .map((item: String) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          point_id,
          item_id,
        };
      });

    await trx("point_items").insert(pointItens);
    await trx.commit();

    return response.json({ id: point_id, ...point });
  }
}

export default PointsController;
