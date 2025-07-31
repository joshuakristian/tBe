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

// exports.getResponse = async (req, res, next) => {
//   const { formId, responseId } = req.params;

//   try {
//     const [formRows] = await db
//       .promise()
//       .query('SELECT id FROM e_form WHERE id = ?', [formId]);

//     if (formRows.length === 0) {
//       return res.status(404).json({ 
//         status: false, 
//         message: 'Form Not Found' 
//       });
//     }

//     const [responses] = await db
//       .promise()
//       .query('SELECT * FROM f_responses WHERE id = ? AND formId = ?', [responseId, formId]);

//     if (responses.length === 0) {
//       return res.status(404).json({ 
//         status: false, 
//         message: 'Response Not Found' 
//       });
//     }

//     const response = responses[0];
//     try {
//       response.answers = JSON.parse(response.answers);
//     } catch (e) {
//       response.answers = { textAnswers: {}, fileAnswers: {} };
//     }

//     return res.status(200).json({
//       status: true,
//       message: 'Response retrieved successfully',
//       data: response
//     });

//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: err.message,
//     });
//   }
// };

exports.getResponses = async (req, res) => {
    const formId = req.params.formId;
    const [formRows] = await db
    .promise()
    .query('SELECT id FROM e_form WHERE id = ?', [formId]);

    if (formRows.length === 0) {
      return res.status(404).json({ 
        status: false, 
        message: 'Form Not Found' 
      });
    }
    
   try {
    const [rows] = await db
      .promise()
      .query('SELECT * FROM f_responses WHERE formId = ? ORDER BY submittedAt DESC', [formId]);
    
    const parsedRows = rows.map(row => {
      let parsedAnswers;
      try {
        parsedAnswers = typeof row.answers === 'string'
          ? JSON.parse(row.answers)
          : row.answers;
      } catch (err) {
        parsedAnswers = {};
      }

      return {
        ...row,
        answers: parsedAnswers,
      };
    });

    res.json({ status: true, data: parsedRows });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


exports.getResponse = async (req, res, next) => {
  const { formId, responseId } = req.params;

  try {
    // Cek apakah form ada
    const [formRows] = await db
      .promise()
      .query('SELECT id FROM e_form WHERE id = ?', [formId]);

    if (formRows.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Form Not Found'
      });
    }

    // Ambil data response
    const [rows] = await db
      .promise()
      .query('SELECT * FROM f_responses WHERE id = ? AND formId = ?', [responseId, formId]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Response Not Found'
      });
    }

    const response = rows[0];

    try {
      const parsedAnswers = JSON.parse(response.answers);

      // Pastikan strukturnya lengkap
      const textAnswers = parsedAnswers.textAnswers || {};
      const fileAnswers = parsedAnswers.fileAnswers || {};

      // Parsing individual value jika string-nya adalah JSON string
      for (const [key, value] of Object.entries(textAnswers)) {
        if (typeof value === 'string' && value.trim().startsWith('[') && value.trim().endsWith(']')) {
          try {
            textAnswers[key] = JSON.parse(value);
          } catch (_) {
            // Skip jika gagal parsing
          }
        }
      }

      response.answers = {
        textAnswers,
        fileAnswers
      };
    } catch (e) {
      // Kalau parsing gagal, kosongkan jawaban
      response.answers = {
        textAnswers: {},
        fileAnswers: {}
      };
    }

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

  let fileAnswers = {};
  if (req.files && Object.keys(req.files).length > 0) {
    for (const fieldName in req.files) {
      const file = req.files[fieldName][0];
      fileAnswers[fieldName] = {
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      };
    }
  }

    let parsedAnswers = {};
    try {
      parsedAnswers = JSON.parse(answers);
    } catch (e) {
      parsedAnswers = {};
    }


  const combinedAnswers = {
    textAnswers: parsedAnswers,
    fileAnswers: fileAnswers
  };

  const query = `
    INSERT INTO f_responses (formId, eventId, userId, answers, submittedAt)
    VALUES (?, ?, ?, ?, NOW())
  `;
  const vquery = [formId, eventId, userId, JSON.stringify(combinedAnswers)];

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
        answers: combinedAnswers,
      }
    });
  } catch (err) {
    return res.status(400).send({
      status: false,
      message: err.message,
    });
  }
};