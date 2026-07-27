const Joi = require('joi');

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
  }),
};

const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must not exceed 100 characters',
      'any.required': 'Password is required',
    }),
  }),
};

const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    newPassword: Joi.string().min(6).max(100).required().messages({
      'string.min': 'New password must be at least 6 characters',
      'string.max': 'New password must not exceed 100 characters',
      'any.required': 'New password is required',
    }),
  }),
};

const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),
};

const resetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    code: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      'string.length': 'Reset code must be 6 digits',
      'string.pattern.base': 'Reset code must be numeric',
      'any.required': 'Reset code is required',
    }),
    newPassword: Joi.string().min(6).max(100).required().messages({
      'string.min': 'New password must be at least 6 characters',
      'string.max': 'New password must not exceed 100 characters',
      'any.required': 'New password is required',
    }),
  }),
};

module.exports = {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
