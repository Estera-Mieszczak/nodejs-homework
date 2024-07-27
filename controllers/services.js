const Contact = require("../models/contacts");
const User = require("../models/user");

const fetchContacts = (userId) => {
  return Contact.find({ owner: userId });
};

const fetchContact = (id) => {
  return Contact.findOne({
    _id: id,
  });
};

const insertContact = ({ name, email, phone, favorite, userId }) => {
  return Contact.create({
    name,
    email,
    phone,
    favorite,
    owner: userId,
  });
};

const updateContact = ({ id, toUpdate, upsert = false }) => {
  return Contact.findByIdAndUpdate(
    { _id: id },
    { $set: toUpdate },
    { new: true, runValidators: true, strict: "throw", upsert }
  );
};

const removeContact = (id) => {
  return Contact.deleteOne({
    _id: id,
  });
};
const updateStatusContact = ({ id, toUpdate }) => {
  return Contact.findByIdAndUpdate(
    { _id: id },
    { $set: toUpdate },
    { new: true, runValidators: true, strict: "throw" }
  );
};

const findUserById = async (id) => await User.findById(id);

const updateUserById = async (id, obj) => await User.findByIdAndUpdate(id, obj);

module.exports = {
  fetchContacts,
  fetchContact,
  insertContact,
  updateContact,
  removeContact,
  updateStatusContact,
  findUserById,
  updateUserById,
};
