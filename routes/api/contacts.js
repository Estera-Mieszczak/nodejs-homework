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
const { createUser } = require("../../controllers/users");

const router = express.Router();

router.get("/contacts", getAllContacts);
router.get("/contacts/:id", getContact);
router.post("/contacts", createContact);
router.put("/contacts/:id", putContact);
router.patch("/contacts/:id", patchContact);
router.delete("/contacts/:id", deleteContact);
router.patch("/contacts/:id/favourite", favouriteContact);

router.post("/users/signup", createUser);

module.exports = router;
