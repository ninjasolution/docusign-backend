const Joi = require('joi');

module.exports = (type) => (req, res, next) => {
    const schema = getStripSchema(type);
    if(schema) {
        const result = schema.validate(req.body);
        if (result.error) {
            const { details } = result.error;
            const message = details[0].message.replace(/"|'/g, '');
            req.flash('danger', message)
            return res.send({message: 'Invalid params', status: "errors"}); 
        }
    }
    next();
}

const getStripSchema = (type) => {
    switch (type) {
        case 'strip_payment': {
            return Joi.object().keys({
                    username: Joi.string().required(),
                    cardNumber: Joi.string().required(), 
                    month: Joi.string().required(),
                    year: Joi.string().required(),
                    cvv: Joi.string().required()
                })
        } 
        default: {
            return null;
        }
    }
} 