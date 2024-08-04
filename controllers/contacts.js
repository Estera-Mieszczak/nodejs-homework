const Joi = require("joi");
const {
  fetchContacts,
  fetchContact,
  insertContact,
  updateContact,
  removeContact,
  updateStatusContact,
} = require("./services");

const contactSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(25).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "pl"] },
    })
    .required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

const updateContactSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(25),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net", "pl"] },
  }),
  phone: Joi.string(),
  favorite: Joi.boolean(),
});

const getAllContacts = async (req, res, next) => {
  const { _id: userId } = req.user;
  try {
    const contacts = await fetchContacts(userId);
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

const getContact = async (req, res, next) => {
  const { _id: userId } = req.user;
  try {
    const contact = await fetchContact(req.params.id);
    if (contact.owner.toString() === userId.toString()) {
      res.json(contact);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  const { error, value } = contactSchema.validate(req.body);

  if (error) {
    console.log(error);
    return res.send("Invalid request.");
  }
  const { _id: userId } = req.user;
  const { name, email, phone, favorite } = req.body;
  try {
    const contact = await insertContact({
      name,
      email,
      phone,
      favorite,
      userId,
    });
    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
};

const putContact = async (req, res, next) => {
  const { error, value } = contactSchema.validate(req.body);

  if (error) {
    console.log(error);
    return res.send("Invalid request.");
  }

  const { _id: userId } = req.user;
  const { id } = req.params;

  try {
    const contactToUpdate = await fetchContact(id);

    if (contactToUpdate.owner.toString() === userId.toString()) {
      const result = await updateContact({
        id,
        toUpdate: req.body,
        upsert: true,
      });
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
};

const patchContact = async (req, res, next) => {
  const { _id: userId } = req.user;
  const { id } = req.params;
  const { error, value } = updateContactSchema.validate(req.body);

  if (error) {
    console.log(error);
    return res.send("Invalid request.");
  }
  try {
    const contactToUpdate = await fetchContact(id);

    if (contactToUpdate.owner.toString() === userId.toString()) {
      const result = await updateContact({
        id,
        toUpdate: req.body,
      });

      if (!result) {
        next();
      } else {
        res.json(result);
      }
    }
  } catch (err) {
    next(err);
  }
};

const deleteContact = async (req, res, next) => {
  const { _id: userId } = req.user;
  const { id: contactId } = req.params;

  try {
    const contactToDelete = await fetchContact(contactId);

    if (contactToDelete.owner.toString() === userId.toString()) {
      await removeContact(contactId);
      return res.status(200).json({
        message: `You  have deleted contact: ${contactToDelete.name}`,
      });
    }
  } catch (err) {
    next(err);
  }
};

const favouriteContact = async (req, res, next) => {
  const { id } = req.params;
  const { favorite } = req.body;

  try {
    const result = await updateStatusContact({
      id,
      toUpdate: { favorite },
    });
    if (result) {
      res.status(200).json({
        message: `You  have changed contact status | ${req.body.name} `,
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllContacts,
  getContact,
  createContact,
  putContact,
  patchContact,
  deleteContact,
  favouriteContact,
};
