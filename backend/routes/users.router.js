const routerUser = require('express').Router();
const asyncHandler = require('express-async-handler');
const {
  getUserProfile,
  updateCandidateProfile,
  getCandidates,
  getMyProfile,
  getCompanyProfile,
  updateCompanyProfile,
  getSuggestedFriends
} = require('../controllers/users.controller');

const upload = require('../middleware/upload.middleware');
const Joi = require('joi');

routerUser.get(
  '/me',
  asyncHandler(async (req, res) => {
    const user = await getMyProfile(req.user.id);
    res.send(user);
  }),
);

routerUser.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await getUserProfile(req.params.id);
    res.send(user);
  }),
);

routerUser.get(
  '/',
  asyncHandler(async (req, res) => {
    const candidates = await getCandidates(req.query.limit, req.query.offset);
    res.send(candidates);
  }),
);

routerUser.patch(
  '/candidate',
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      jobTitle: Joi.string().min(2).max(100).optional(),
      fullName: Joi.string().min(2).max(150).optional(),
      university: Joi.string().min(2).max(150).optional(),
      graduationYear: Joi.number()
        .integer()
        .min(1900)
        .max(new Date().getFullYear() + 10)
        .optional(),
      about: Joi.string().max(1000).optional(),
      resumeURL: Joi.string().uri().optional(),
      profileVisible: Joi.boolean().optional(),
      applicationsVisible: Joi.boolean().optional(),
      tagIds: Joi.array().items(Joi.string().uuid()).optional(),
    }).min(1);

    await schema.validateAsync(req.body);

    const updatedUser = await updateCandidateProfile(req.user.id, req.body);
    res.send(updatedUser);
  }),
);

routerUser.get(
  '/candidate/suggested',
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      limit: Joi.number().integer().min(1).max(100).default(20),
      offset: Joi.number().integer().min(0).default(0),
    });

    const query = schema.validate(req.query).value;

    const result = await getSuggestedFriends(
      req.user.id,
      query.limit,
      query.offset
    );

    res.send(result);
  }),
);

routerUser.get(
  '/company/:id',
  asyncHandler(async (req, res) => {
    const company = await getCompanyProfile(req.params.id);
    res.send(company);
  }),
);

routerUser.patch(
  '/company', upload.single('logoUrl'),
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      description: Joi.string().max(2000).optional(),
      industry: Joi.string().min(2).max(100).optional(),
      inn: Joi.string().optional(),
      websiteURL: Joi.array().items(Joi.string()).optional(),
    });

    await schema.validateAsync(req.body);

    let logoUrl = undefined;
    if (req.file) {
      // req.protocol = 'http' или 'https', req.get('host') = 'localhost:3000'
      logoUrl = `${req.protocol}://${req.get('host')}/uploads/companies/${req.file.filename}`;
    }

    const updateData = {
      ...req.body,
      ...(logoUrl && { logoUrl }),
    };

    const updatedCompany = await updateCompanyProfile(req.user.id, updateData);
    res.send(updatedCompany);
  }),
);

module.exports = routerUser;