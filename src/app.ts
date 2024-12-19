import express  from "express";
import router from "./routes/manajemen";
const app = express()
app.use(express.json())
app.use("/api/task",router)
const PORT = 3000
app.listen(PORT, () => {
})
