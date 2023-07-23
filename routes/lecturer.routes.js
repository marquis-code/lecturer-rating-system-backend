const { Router } = require("express");
const {
    handle_new_lecturers,
    get_all_lecturers,
    get_one_lecturers,
    delete_lecturers,
    update_lecturers,
    login_lecturers,
    rateLecturer,
} = require("../controllers/lecturers.controller");

const router = Router();

router.post("/signup", handle_new_lecturers);

router.post("/login", login_lecturers);

router.get("/",checkUser, get_all_lecturers);

router.get("/:id", checkUser, get_one_lecturers);

router.delete("/:id", checkUser, delete_lecturers);

router.put("/:id", checkUser, update_lecturers);

router.put('/rating', rateLecturer);

module.exports = router;
