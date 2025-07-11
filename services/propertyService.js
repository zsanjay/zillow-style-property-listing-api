const { validationResult } = require('express-validator');
const Property = require('../models/property');
const User = require('../models/user');
const {
  V1,
  MSG_NO_PROPERTIES_FOUND,
  MSG_FETCH_SUCCESS,
  MSG_PROPERTY_NOT_FOUND,
  MSG_PROPERTY_FETCHED,
  MSG_PROPERTY_EXISTS,
  MSG_PROPERTY_CREATED,
  MSG_PROPERTY_UPDATED,
  MSG_PROPERTY_DELETED,
  MSG_ERROR_FETCHING_PROPERTIES,
  MSG_ERROR_CREATING_PROPERTY,
  MSG_ERROR_UPDATING_PROPERTY,
  MSG_ERROR_DELETING_PROPERTY,
  MSG_ERROR_SEARCHING_PROPERTIES,
  MSG_NOT_AUTHORIZED,
  MSG_NO_MATCHING_PROPERTIES
} = require('../utils/constants');
const redisClient = require('../utils/redisClient');

exports.getAllProperties = async (req, res, next) => {

  const currentPage = req.query.page || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (currentPage - 1) * limit;

  try {
    const total = await Property.find().countDocuments();
    const cacheKey = `properties:${currentPage}:${limit}`;
    const cached = await redisClient.get(cacheKey);
    if(cached) {
      return res.status(200).json({
        version: V1,
        message: MSG_FETCH_SUCCESS,
        totalPages: Math.ceil(total / limit),
        totalProperties: total,
        properties: JSON.parse(cached)
      });
    }
    const properties = await Property.find().select('-_id').populate('owner', 'name email').skip(skip).limit(limit);
    if (properties.length === 0) {
      return res.status(404).json({ version: V1, message: MSG_NO_PROPERTIES_FOUND });
    }
    await redisClient.setEx(cacheKey, 60, JSON.stringify(properties));

    res.status(200).json({
      version: V1,
      message: MSG_FETCH_SUCCESS,
      totalPages: Math.ceil(total / limit),
      totalProperties: total,
      properties: properties
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) err.statusCode = 500;
    err.message = MSG_ERROR_FETCHING_PROPERTIES;
    next(err);
  }
}

exports.getPropertyById = async (req, res, next) => {
  const propertyId = req.params.id;
  try {
    const property = await Property.findById(propertyId).populate('owner', 'name email');
    if (!property) {
      const error = new Error(MSG_PROPERTY_NOT_FOUND);
      error.statusCode = 404;
      next(error);
    }
    res.status(200).json({ version: V1, message: MSG_PROPERTY_FETCHED, property: property });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    err.message = MSG_ERROR_FETCHING_PROPERTIES;
    next(err);
  }
};

exports.createProperty = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    next(error);
  }

  const savedProperty = await Property.find({ $or: [{ title: req.body.title }, { address: req.body.address }] });

  if (savedProperty.length > 0) {
    return res.status(422).json({ "message": MSG_PROPERTY_EXISTS, "version": V1 });
  }

  const { title, description, address, city, state, price, bedrooms, bathrooms, area_sqft } = req.body;
  const userId = req.userId;

  const property = new Property({
    title: title,
    description: description,
    address: address,
    city: city,
    state: state,
    price: price,
    bedrooms: bedrooms,
    bathrooms: bathrooms,
    area_sqft: area_sqft,
    owner: userId
  })
  try {
    const result = await property.save();
    const user = await User.findById(userId);
    user.properties.push(property);
    await user.save();

    res.status(201).json({
      version: V1,
      message: MSG_PROPERTY_CREATED,
      property: result,
      owner: { email: user.email, name: user.name }
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    err.message = MSG_ERROR_CREATING_PROPERTY;
    next(err);
  }
}

exports.updateProperty = async (req, res, next) => {
  const propertyId = req.params.id;
  const { title, description, address, city, state, price, bedrooms, bathrooms, area_sqft } = req.body;

  try {
    let property = await Property.findById(propertyId);
    if (!property) {
      const error = new Error(MSG_PROPERTY_NOT_FOUND);
      error.statusCode = 404;
      next(error);
    }

    if (property.owner.toString() !== req.userId) {
      const error = new Error(MSG_NOT_AUTHORIZED);
      error.statusCode = 403;
      next(error);
    }

    property.title = title || property.title;
    property.description = description || property.description;
    property.address = address || property.address;
    property.city = city || property.city;
    property.state = state || property.state;
    property.price = price || property.price;
    property.bedrooms = bedrooms || property.bedrooms;
    property.bathrooms = bathrooms || property.bathrooms;
    property.area_sqft = area_sqft || property.area_sqft;
    property = await property.save();

    res.status(200).json({ version: V1, message: MSG_PROPERTY_UPDATED, property: property });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    err.message = MSG_ERROR_UPDATING_PROPERTY;
    next(err);
  }
}

exports.deleteProperty = async (req, res, next) => {
  const propertyId = req.params.id;
  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      const error = new Error(MSG_PROPERTY_NOT_FOUND);
      error.statusCode = 404;
      next(error);
    }
    if (property.owner.toString() !== req.userId) {
      const error = new Error(MSG_NOT_AUTHORIZED);
      error.statusCode = 403;
      next(error);
    }

    await Property.findByIdAndDelete(propertyId);
    const user = await User.findById(req.userId);
    user.properties.pull(propertyId);
    await user.save();

    res.status(200).json({ version: V1, message: MSG_PROPERTY_DELETED });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    err.message = MSG_ERROR_DELETING_PROPERTY;
    next(err);
  }
}

exports.searchProperties = async (req, res, next) => {
  try {
    const { location, minPrice, maxPrice, bedrooms } = req.query;
    const filters = {};

    if (location) {
      const regex = new RegExp(location, 'i');
      filters.$or = [
        { city: regex },
        { state: regex },
        { address: regex }
      ];
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    if (bedrooms) {
      filters.bedrooms = Number(bedrooms);
    }

    const currentPage = req.query.page || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (currentPage - 1) * limit;

    const cacheKey = `search:${JSON.stringify(filters)}:${currentPage}:${limit}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const properties = JSON.parse(cached);
      return res.status(200).json({
        version: V1,
        message: MSG_PROPERTY_FETCHED,
        properties: properties,
        totalPages: Math.ceil(properties.length / limit),
        totalProperties: properties.length
      });
    }

    const properties = await Property.find(filters).select('-_id').populate('owner', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit);
    if (properties.length === 0) {
      return res.status(404).json({ version: V1, message: MSG_NO_MATCHING_PROPERTIES });
    }
    await redisClient.setEx(cacheKey, 60, JSON.stringify(properties));
    res.status(200).json({ 
      version: V1,
      message: MSG_PROPERTY_FETCHED,
      properties: properties,
      totalPages: Math.ceil(total / limit),
      totalProperties: total
     });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    err.message = MSG_ERROR_SEARCHING_PROPERTIES;
    next(err);
  }
};


