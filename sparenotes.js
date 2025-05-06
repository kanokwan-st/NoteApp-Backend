import express from "express"

const router = express.Router();

let notes = [{
    topic: "First Note",
    detail: "This is the first note."
}];

router.get("/", (req, res) => {
    res.send(notes);
})

export default router



