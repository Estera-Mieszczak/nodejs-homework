const express = require('express');
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const { listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact, } = require("../../models/contacts");


const router = express.Router()

// const phonePattern = new RegExp("^[+]?[0-9]*$");

const schema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().alphanum().min(5).max(15).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "pl"] },
    })
    .required(),
  phone: Joi.string().required(),
});

router.get('/', async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (error) {
    console.log(error)
    res.json({ message: error.message || "Something went wrong whet you tried to get contacts list" })
  }
}
)

router.get('/:contactId', async (req, res, next) => {
  try {
    const contact = await getContactById();
    if (!contact) {
      res.status(404).json({ message: "contact not found" });
    } else {
      res.json(contact);
    }
  } catch (error) {
    console.log(error);
    res.json({ message: error.message || "Something went wrong whet you tried to find the contact" })
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    const newContactToValidation = {
      id: uuidv4(),
      name,
      email,
      phone,
    };

    const newContact = await schema.validateAsync(newContactToValidation);

    addContact(newContact);
    res.status(201).json({ message: "You have added new contact", data: newContact });
  } catch (error) {
    console.log(error);
    res.json({ message: error.message || "Please fill correctly all fields" });
  }
  
})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const contacts = await listContacts();
    const contact = contacts.find((contact) => contact.id === contactId);
    if (contact) {
      removeContact(contactId);
      res.json({ message: "Contact deleted" });
    } else {
      res.status(404).json({message: "Contact not found"})
    }
  } catch (error) {
    console.log(error);
    res.json({ message: error.message || "Something went wrong when you tried to delete the contact" })
  }
})

router.put('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { name, email, phone } = req.body;

    const contacts = await listContacts();
    const contact = contacts.find((contact) => contact.id === contactId);

    if (contact) {
      const newContactToValidation = { ...contact, name, email, phone };
      const newContact = await schema.validateAsync(newContactToValidation);
      updateContact(contactId, newContact);
      return res.json({message: "You have changed contact", data: newContact })
    }
    res.status(404).json({message: "Contact not found"})
  } catch (error) {
    console.log(error);
    res.json({ message: error.message || "Please fill correctly all the fields" })
  }
  
})

module.exports = router
