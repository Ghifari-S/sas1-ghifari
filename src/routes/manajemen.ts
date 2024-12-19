import { Router } from "express";
import { Request, Response } from "express";
import pool from "../db/db";
import { log } from "console";
interface manajementask {
  tugas_id: number;
  pengguna_id: number;
  title: string;
  description: string;
  deadline: Date;
  is_completed: boolean;
  create_at: Date;
  update_at: Date;
}

const router = Router();
router.get("/timedb", async (req, res) => {
  try {
    const query = "SELECT NOW() AS timedb";
    const result = await pool.query(query);

    res.json({ status: "success", data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, deadline} = req.body;
    console.log("Data received:", { title, description, deadline});

    const query = `
      INSERT INTO tugaass(title, description, deadline)
      VALUES($1, $2, $3)
      RETURNING *
    `;
    const values = [title, description, deadline];

    const result = await pool.query(query, values);
    res.json({ status: "success", data: result.rows[0] });
  } catch (err: any) {
    
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tugaass ORDER BY created_at DESC"
    );
    res.json({ status: "success", data: result.rows });
  } catch (err: any) {
    console.log("error bos kuhhh")
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM tugaass WHERE tugas_id = $1";
    const values = [id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Task not found" });
    }

    res.json({ status: "success", data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { is_completed } = req.body;

    if (typeof is_completed !== "boolean") {
      return res.status(400).json({
        status: "error",
        message: "`is_completed` must be a boolean value",
      });
    }

    const query = `
        UPDATE tugaass
        SET is_completed = $1, update_at = CURRENT_TIMESTAMP
        WHERE tugas_id = $2
        RETURNING *
      `;

    const values = [is_completed, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Task not found" });
    }

    res.json({ status: "success", data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
       DELETE FROM tugaass WHERE tugas_id = $1 RETURNING *
    `;

    const values = [id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      });
    }

    res.json({
      status: "success",
      message: `Task with ID ${id} has been deleted`,
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});



export default router;
