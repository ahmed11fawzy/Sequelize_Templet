const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const protect = require("../middlewares/protectionMiddleware");
const restrictionMiddleware = require("../middlewares/restrictionMiddleware");
const { signup, login, forgotPassword, resetPassword, updatePassword } = require("../controllers/authController");
const {
  getAllUsers,
  updateUser,
  getUser,
  updateMyData,
  deActivateUser,
  deleteUser,
} = require("../controllers/userController");
const loginValidator = require("../middlewares/loginValidator");

const limiter = rateLimit({
  max: 3,
  windowMs: 5 * 60 * 1000,
  message: "Too many tries of login requests , please try again in an 15 minutes!",
});

router.post("/signup", signup);
router.post("/login", limiter, loginValidator, login); //! limiter => Limiting login requests
router.post("/forgotpassword", forgotPassword);
router.patch("/restpassword/:token", resetPassword);

// TODO protect all routes come after this
router.use(protect);

router.get(
  "/me",
  (req, res, next) => {
    req.params.id = req.user.id;
    next();
  },
  getUser
);

router.patch("/updatepassword", updatePassword);
router.patch("/updatemydata", updateMyData);
router.delete("/deActivateUser", deActivateUser);

// TODO retrict all normal users  only admin can access
router.use(restrictionMiddleware("admin"));

router.route("/").get(getAllUsers);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
