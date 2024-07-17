const { fetchContacts, fetchContact, insertContact , updateContact, removeContact, updateStatusContact} = require('./services')

const getAllContacts = async (req, res, next) => {
    try {
        const contacts = await fetchContacts()
    res.json(contacts)
    } catch (error) {
        next(error)
    }
}

const getContact = async (req, res, next) => {
    try {
        const contact = await fetchContact(req.params.id)
        if (contact) {
            res.json(contact)
        } else {
            next()
        }
        
    } catch (error) {
        next(error)
    }
} 

const createContact = async (req, res, next) => {
    const { name, email, phone, favorite } = req.body;
    try {
        const contact = await insertContact({
            name,
            email,
            phone,
            favorite
        })
        res.status(201).json(contact)
    } catch (error) {
        next(error)
    }
}

const putContact = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await updateContact({
            id,
            toUpdate: req.body,
            upsert: true,
        })
        res.json(result)

    } catch (err) {
        next(err)
    }
}

const patchContact = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await updateContact({
            id,
            toUpdate: req.body,
        })
        if (!result) {
            next()
        } else {
            res.json(result)
        }
    } catch (err) {
        next(err)
    }
}

const deleteContact = async (req, res, next) => {
    const { id } = req.params;
    try { 
        await removeContact(id);
        return res.status(204).json({
            message: `You  have deleted contact with id ${id}`
        })
    } catch (err) {
        next(err)
    }
}

const favouriteContact = async (req, res, next) => {
    const { id } = req.params;
    const { favorite } = req.body;
    try {
        const result = await updateStatusContact({
            id,
            toUpdate: {favorite}
        })
        if (result) {
            res.json(result)
            res.status(200).json({
            message: `You  have changed contact status | ${req.body.name} `
        })
        } else {
            next()
        }

    } catch (err) {
        next(err)
    }
}

module.exports = {
    getAllContacts,
    getContact,
    createContact,
    putContact,
    patchContact,
    deleteContact,
    favouriteContact,
}