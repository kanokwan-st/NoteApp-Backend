import express from "express";

const router = express.Router();

export default (db) => {
  // CREATE a user (สร้างข้อมูล user ใส่ไปในตาราง)
  router.post("/users", async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).send("Name and email are required");
    }
    const result = await db.execute({
      sql: "INSERT INTO users (name, email) VALUES (?,?)",
      args: [name, email],
    });

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      name,
      email,
    });
  });

  // UPDATE a user
  // DELETE a user

  return router;
};
