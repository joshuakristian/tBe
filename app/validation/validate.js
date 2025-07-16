module.exports = validateRequest
function validateRequest(req, res, next, schema) {
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  }
  const { error, value } = schema.validate(req.body, options)
  if (error) {
    let rr = error.details[0].message
      .replace(/[^a-zA-Z0-9\_\:\s]/g, '')
      .replace(/[_:]/g, ' ')
    // next(`Validation error: ${error.details.map(x => x.message).join(', ')}`)
    console.log(error.details[0].message)
    return res.status(400).send({ message: rr })
  } else {
    req.body = value
    next()
  }
}
