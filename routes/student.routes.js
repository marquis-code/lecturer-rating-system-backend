const { Router } = require("express");
const {
    handle_new_students,
    get_all_students,
    get_one_students,
    delete_students,
    update_students,
    login_students
} = require("../controllers/students.controller");

const router = Router();

router.post("/signup", handle_new_students);

router.post("/login", login_students);

router.get("/",checkUser, get_all_students);

router.get("/:id", checkUser, get_one_students);

router.delete("/:id", checkUser, delete_students);

router.put("/:id", checkUser, update_students);

module.exports = router;
