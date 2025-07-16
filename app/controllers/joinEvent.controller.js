const cors = require('cors')
const db = require('../db/db.js')

exports.getFormAdmin = async (req, res, next) => {
  const eventId = req.params.eventId;
  const query = 'SELECT * FROM e_form WHERE eventId = ?';
  
  db.query(query, [eventId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan pada server',
        error: err.message,
      });
    }
    
    if (results.length === 0) {
      return res.status(204).json({
        status: false,
        message: 'Form tidak ditemukan',
        data: null,
      });
    }
    
    const form = results[0];
    return res.status(200).json({
      status: true,
      message: 'Form berhasil ditemukan',
      data: form
    });
  });
};

exports.getForm = async (req, res, next) => {
  const id = req.params.id;
  const query = 'SELECT *  FROM e_form WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      
      return res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan pada server',
        error: err.message,
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Form tidak ditemukan',
      });
    }
    
    const form = results[0];
    return res.status(200).json({
      status: true,
      message: 'Form berhasil ditemukan',
      data: form
    });
  });
};

exports.newForm = async (req, res, next) => {
  const eventId = req.params.eventId;

  const [rows] = await db
    .promise()
    .query('SELECT id FROM event WHERE id = ?', [eventId]);


  if (rows.length === 0) {
    return res.status(404).json({ status: false, message: 'Event Not Found' });
  }

  const {
    title,
    description,
    questions,
  } = req.body
  const query = 'INSERT INTO e_form (eventId, title, description, questions, createdAt) VALUES (?, ?, ?, ?, now())'
  const vquery = [
    eventId,
    title,
    description,
    questions,
  ]
  db.query(query, vquery, (err, result) => {
    if (err) {
      return res.status(400).send({
        status: false,
        message: err,
      })
    } else {
      const newFormId = result.insertId;
      const formIdQuery = 'UPDATE event SET formId = ? WHERE id = ?';
      db.query(formIdQuery, [newFormId, eventId], (updateErr) => {
        if(updateErr) {
          return res.status(500).send({
            status: false,
            message: 'Form created but failed to update event with formId',
          })
        }
      })
      console.log(req.body);
      
      return res.status(201).send({
        status: true,
        message: 'Success for submit a new event form',
        data: {
          id: result.insertId,
          eventId,
          title,
          description,
          questions,
        }
      })
    }
  })
}

exports.uForm = async (req, res, next) => {
  try {
    const formId = req.params.id;
    const { title, description, questions } = req.body;

    if (!title || !description || !questions) {
      return res.status(400).json({
        status: false,
        message: 'Title, description and questions are required fields'
      });
    }

    const [formExists] = await db.promise().query('SELECT id FROM e_form WHERE id = ?', [formId]);

    if (formExists.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Form not found"
      });
    }

    const updateQuery = 'UPDATE e_form SET title = ?, description = ?, questions = ? WHERE id = ?';
    const params = [title, description, questions, formId];
    
    const [updateResult] = await db.promise().query(updateQuery, params);

    if (updateResult.affectedRows === 0) {
      return res.status(500).json({
        status: false,
        message: "Failed to update form"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Form updated successfully",
      data: {
        id: formId,
        title,
        description,
        questions,
      }
    });

  } catch (error) {
    console.error('Error updating form:', error);
    return res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

exports.dForm = async (req, res, next) => {
  const formId = req.params.formId;
  try {
    const [rows] = await db
    .promise()
    .query('SELECT id FROM e_form WHERE id = ?', [formId])
    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: 'Form for event not Found' })
    }
    await db.promise().query('DELETE FROM e_form WHERE id = ?', [formId]);

    return res.status(200).json({
      status: true,
      message: 'Success deleting form',
    })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server',
    })
  }
}

exports.getResponses = async (req, res, next) => {
  const formId = req.params.formId;

  try {
    const [formRows] = await db
      .promise()
      .query('SELECT id FROM e_form WHERE id = ?', [formId]);

    if (formRows.length === 0) {
      return res.status(404).json({ 
        status: false, 
        message: 'Form Not Found' 
      });
    }

    const [responses] = await db
      .promise()
      .query('SELECT * FROM f_responses WHERE formId = ? ORDER BY submittedAt DESC', [formId]);
    
      console.log(responses);

    const parsedResponses = responses.map(response => ({
      ...response,
      answers: typeof response.answers === 'string' ? JSON.parse(response.answers) : response.answers
    }));

    return res.status(200).json({
      status: true,
      message: 'Responses retrieved successfully',
      data: parsedResponses
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

exports.getResponse = async (req, res, next) => {
  const { formId, responseId } = req.params;

  try {
    const [formRows] = await db
      .promise()
      .query('SELECT id FROM e_form WHERE id = ?', [formId]);

    if (formRows.length === 0) {
      return res.status(404).json({ 
        status: false, 
        message: 'Form Not Found' 
      });
    }

    const [responses] = await db
      .promise()
      .query('SELECT * FROM responses WHERE id = ? AND formId = ?', [responseId, formId]);

    if (responses.length === 0) {
      return res.status(404).json({ 
        status: false, 
        message: 'Response Not Found' 
      });
    }
    const response = responses[0];
    response.answers = typeof response.answers === 'string' ? JSON.parse(response.answers) : response.answers;

    return res.status(200).json({
      status: true,
      message: 'Response retrieved successfully',
      data: response
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

exports.deleteResponse = async (req, res, next) => {
  const { formId, responseId } = req.params;

  try {

    const [formRows] = await db
      .promise()
      .query('SELECT id FROM e_form WHERE id = ?', [formId]);

    if (formRows.length === 0) {
      return res.status(404).json({ 
        status: false, 
        message: 'Form Not Found' 
      });
    }

    const [responseRows] = await db
      .promise()
      .query('SELECT id FROM responses WHERE id = ? AND formId = ?', [responseId, formId]);

    if (responseRows.length === 0) {
      return res.status(404).json({ 
        status: false, 
        message: 'Response Not Found' 
      });
    }

    await db
      .promise()
      .query('DELETE FROM responses WHERE id = ? AND formId = ?', [responseId, formId]);

    return res.status(200).json({
      status: true,
      message: 'Response deleted successfully'
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

const hasUserAlreadyResponded = async (formId, userId) => {
  const [rows] = await db.promise().query(
    "SELECT id FROM f_responses WHERE formId = ? AND userId = ?", [formId, userId]
  );
  return rows.length > 0;
};

exports.newRespond = async (req, res, next) => {
  const formId = req.params.formId;

  const [rows] = await db
    .promise()
    .query('SELECT id FROM e_form WHERE id = ?', [formId]);

  if (rows.length === 0) {
    return res.status(404).json({ status: false, message: 'Form Not Found' });
  }

  const { eventId, userId, answers } = req.body;

  const exists = await hasUserAlreadyResponded(formId, userId);
  if (exists) {
    return res.status(400).json({
      status: false,
      message: "You have already responded to this form."
    });
  }

  const query = `
    INSERT INTO f_responses (formId, eventId, userId, answers, submittedAt)
    VALUES (?, ?, ?, ?, NOW())
  `;
  const vquery = [formId, eventId, userId, JSON.stringify(answers)];

  try {
    const [result] = await db.promise().query(query, vquery);
    
    return res.status(201).send({
      status: true,
      message: 'Response submitted successfully',
      data: {
        id: result.insertId,
        formId,
        eventId,
        userId,
        answers,
      }
    });
  } catch (err) {
    return res.status(400).send({
      status: false,
      message: err.message,
    });
  }
};