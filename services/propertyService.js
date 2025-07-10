const { validationResult } = require('express-validator');
const Property = require('../models/property');
const User = require('../models/user');

exports.getAllProperties = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 5;
    try {
        const totalPropertyCount = await Property.find().countDocuments();
        const properties = await Property.find().populate('user').skip((currentPage - 1) * perPage).limit(perPage);
        res.status(200).json({
            version: 'v1',
            message: 'Fetched properties successfully.',
            properties: properties,
            totalProperties: totalPropertyCount
        });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        err.message = 'Error fetching properties';
        next(err);
    }
}

exports.getPropertyById = async (req, res, next) => {
    const propertyId = req.params.id;
    try {
        const property = await Property.findById(propertyId).populate('user');
        if (!property) {
            const error = new Error('Could not find property.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ version: 'v1', message: 'Property fetched Successfully!', property: property });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        err.message = 'Error fetching property';
        next(err);
    }
};

exports.createProperty = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const { title, description, address, city, state, price, bedrooms, bathrooms, area_sqft, owner } = req.body;
    const userId = req.userId || owner;

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
        const result = await property.save()
        const user = await User.findById(userId);
        user.properties.push(property);
        await user.save();

        res.status(201).json({
            version: 'v1',
            message: 'Property created successfully!',
            property: result,
            owner: { _id: user._id, name: user.name }
        });
    } catch (err) {
        console.log(err);
        if (!err.statusCode) err.statusCode = 500;
        err.message = 'Error creating property';
        next(err);
    }
}

exports.updateProperty = async (req, res, next) => {
    const propertyId = req.params.id;
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
  
    const { title, description, address, city, state, price, bedrooms, bathrooms, area_sqft } = req.body;
  
    try {
      let property = await Property.findById(propertyId);
      if (!property) {
        const error = new Error('Could not find property.');
        error.statusCode = 404;
        throw error;
      }
  
      if (property.owner.toString() !== req.userId) {
        const error = new Error('Not Authorized!');
        error.statusCode = 403;
        throw error;
      }

      property.title = title;
      property.description = description;
      property.address = address;
      property.city = city;
      property.state = state;
      property.price = price;
      property.bedrooms = bedrooms;
      property.bathrooms = bathrooms;
      property.area_sqft = area_sqft;
      property = await property.save();
  
      res.status(200).json({ version: 'v1', message: 'Property Updated Successfully!', property: property });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      err.message = 'Error updating property';
      next(err);
    }
}

exports.deleteProperty = async (req, res, next) => {
    const propertyId = req.params.id;
    try {
      const property = await Property.findById(propertyId);
      if (!property) {
        const error = new Error('Could not find Property.');
        error.statusCode = 404;
        throw error;
      }
      if (property.owner.toString() !== req.userId) {
        const error = new Error('Not Authorized!');
        error.statusCode = 403;
        throw error;
      }

      await Property.findByIdAndDelete(propertyId);
      const user = await User.findById(req.userId);
      user.properties.pull(propertyId);
      await user.save();
  
      res.status(200).json({version: 'v1',message: 'Property deleted Successfully!' });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      err.message = 'Error deleting property';
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
  
      const properties = await Property.find(filters).sort({ createdAt: -1 });
  
      res.json(properties);
      res.status(200).json({ version: 'v1',message: 'Fetched properties successfully.', properties: properties });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500; 
      err.message = 'Error searching properties'; 
      next(err);
    }
  };


