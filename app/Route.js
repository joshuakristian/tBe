const express = require('express')
const router = express.Router()
const upMidware = require('./middleware/upload.js')

//users
const users = require('./controllers/user.controller.js')
const userMiddleware = require('./middleware/users.js')
router.get('/getuserss', users.getusers)
router.get('/getusers', userMiddleware.validateLogin, users.getusers)
router.get('/getuser/:id', userMiddleware.validateLogin, users.getuser)
router.post('/signup', userMiddleware.validateRegister, users.signup)
router.post('/login', users.login)
router.get('/testapi', userMiddleware.validateLogin, users.testapi)
router.put('/upict/:id', userMiddleware.validateLogin, upMidware, users.upict)
router.patch(
  '/chpw/:id',
  userMiddleware.validatePw,
  userMiddleware.validateLogin,
  users.changePassword,
)

//Event
const event = require('./controllers/event.controller.js')
router.get('/gevtss', event.getevents)
router.get('/gevts', userMiddleware.validateLogin, event.getevents)
router.get('/gevtsAdm', userMiddleware.validateLogin, event.getEventsByRole)
router.get('/gevt/:id', userMiddleware.validateLogin, event.getevent)
router.post(
  '/ievt',
  userMiddleware.validateLogin,
  upMidware,
  userMiddleware.validateNEvent,
  event.newEvents,
)
router.put(
  '/uevt/:id',
  userMiddleware.validateLogin,
  upMidware,
  userMiddleware.validateNEvent,
  event.uEvent,
)
router.delete('/devt/:id', userMiddleware.validateLogin, event.delEvent)

// event form
const form = require('./controllers/joinEvent.controller.js')
// admin get
router.get(
  '/gfrms/:eventId',
  userMiddleware.validateLogin,
  form.getFormAdmin,
  userMiddleware.validateNF,
)
// user get
router.get(
  '/ggfrms/:id',
  userMiddleware.validateLogin,
  form.getForm,
  userMiddleware.validateNF,
)
router.put(
  '/ufrms/:id',
  userMiddleware.validateLogin,
  form.uForm,
  userMiddleware.validateNF,
)
router.post(
  '/ifrms/:eventId',
  userMiddleware.validateLogin,
  upMidware,
  userMiddleware.validateNF,
  form.newForm,
)
router.delete('/dfrms/:id', userMiddleware.validateLogin, userMiddleware.validateNF, form.dForm);

// event responses
router.get('/grsp/:formId', userMiddleware.validateLogin, form.getResponses); 
router.get('/ggrsp/:formId', userMiddleware.validateLogin, userMiddleware.validateNR, form.getResponse);
router.post('/irsp/:formId', userMiddleware.validateLogin, upMidware, userMiddleware.validateNR, form.newRespond);
router.delete('/drsp/:id', userMiddleware.validateLogin, userMiddleware.validateNR, form.deleteResponse );

//deals
const deals = require('./controllers/deals.controller.js')
router.get('/gdlss', deals.getdeals)
router.get('/gdls', userMiddleware.validateLogin, deals.getdeals)
router.get('/gdeal/:id', userMiddleware.validateLogin, deals.getdeal)
router.post(
  '/ideal',
  userMiddleware.validateLogin,
  upMidware,
  userMiddleware.validateNDeals,
  deals.newDeals,
)
router.put(
  '/udeal/:id',
  userMiddleware.validateLogin,
  upMidware,
  userMiddleware.validateNDeals,
  deals.uDeal,
)
router.delete('/ddeal/:id', userMiddleware.validateLogin, deals.delDeal)

// Daftar internship
const daftarIntern = require('./controllers/daftarintern.controller.js')
router.get('/gdins', userMiddleware.validateLogin, daftarIntern.getDInterns)
router.get('/gdin/:id', userMiddleware.validateLogin, daftarIntern.getDIntern)
router.post(
  '/idint',
  userMiddleware.validateLogin,
  upMidware,
  userMiddleware.validateIntern,
  daftarIntern.newDIntern,
)
router.put(
  '/udint/:id',
  userMiddleware.validateLogin,
  upMidware,
  userMiddleware.validateIntern,
  daftarIntern.uDIntern,
)
router.delete(
  '/ddints/:id',
  userMiddleware.validateLogin,
  daftarIntern.delDIntern,
)

// internship
const intern = require('./controllers/internship.controller.js')
router.get('/internss', intern.getinterns)
router.get('/interns', userMiddleware.validateLogin, intern.getinterns)
router.get('/gins/:id', userMiddleware.validateLogin, intern.getintern)
router.post(
  '/iint',
  userMiddleware.validateLogin,
  upMidware,
  userMiddleware.validateRegistIntern,
  intern.newIntern,
)
router.put(
  '/uint/:id',
  userMiddleware.validateLogin,
  upMidware,
  userMiddleware.validateEIntern,
  intern.uIntern,
)
router.delete('/dint/:id', userMiddleware.validateLogin, intern.delIntern)

// QOTD
const qotd = require('./controllers/qotd.controller.js')
router.get('/gqotd', userMiddleware.validateLogin, qotd.getQotd)
router.get('/gmotd', userMiddleware.validateLogin, qotd.getMotd)

//Kupon
const kpn = require('./controllers/kupon.controller.js')
router.get('/kpn', userMiddleware.validateLogin, kpn.gKpn)
router.post('/ikpn/:did/:uid', userMiddleware.validateLogin, kpn.insertKupon)
router.get('/gKU/:uId/:kId', userMiddleware.validateLogin, kpn.gKpnU)

// BookMark
const bm = require('./controllers/bookmark.controller.js')
router.get('/gbm/:uid/:iid', userMiddleware.validateLogin, bm.gbmU)
router.get('/gabm/:uid', userMiddleware.validateLogin, bm.gABm)
router.post('/ibm/:uid/:iid', userMiddleware.validateLogin, bm.iBmk)
router.delete('/dbm/:id', userMiddleware.validateLogin, bm.delBmk)

module.exports = router
