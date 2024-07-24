const express = require("express");
const {
  getAllContacts,
  getContact,
  createContact,
  putContact,
  patchContact,
  deleteContact,
  favouriteContact,
} = require("../../controllers/contacts");
const { createUser, loginUser } = require("../../controllers/users");
const auth = require("../../middleware/jwt");

const router = express.Router();

router.get("/contacts", auth, getAllContacts);
router.get("/contacts/:id", auth, getContact);
router.post("/contacts", auth, createContact);
router.put("/contacts/:id", auth, putContact);
router.patch("/contacts/:id", auth, patchContact);
router.delete("/contacts/:id", auth, deleteContact);
router.patch("/contacts/:id/favourite", auth, favouriteContact);

router.post("/users/signup", createUser);
router.post("/users/login", loginUser);

module.exports = router;
