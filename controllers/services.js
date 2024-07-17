const Contact = require('../models/contacts')

const fetchContacts = () => {
    return Contact.find();
}

const fetchContact = (id) => {
    return Contact.findOne({
        _id: id,
    })
}

const insertContact = ({ name, email, phone, favourite }) => {
    return Contact.create({
        name,
        email,
        phone,
        favourite
    })
}

const updateContact = ({ id, toUpdate, upsert = false }) => {
    return Contact.findByIdAndUpdate(
        { _id: id },
        { $set: toUpdate },
        { new: true, runValidators: true, strict: 'throw', upsert }
    )
}

const removeContact = (id) => {
    return Contact.deleteOne({
        _id: id
    })
}
const updateStatusContact = ({ id, toUpdate }) => {
    return Contact.findByIdAndUpdate(
        { _id: id },
        { $set: toUpdate },
        { new: true, runValidators: true, strict: 'throw'}
    )
}

module.exports = {
    fetchContacts,
    fetchContact,
    insertContact,
    updateContact,
    removeContact,
    updateStatusContact,
}