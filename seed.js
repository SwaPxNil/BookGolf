const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Course = require('./models/Course');
const TeeTime = require('./models/TeeTime');
const Coach = require('./models/Coach');
const Caddie = require('./models/Caddie');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const Round = require('./models/Round');
const Handicap = require('./models/Handicap');
const AdminLog = require('./models/AdminLog');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true, // Deprecated in Mongoose 6.0
//   useUnifiedTopology: true // Deprecated in Mongoose 6.0
});

// Sample Data
const users = [
  {
    _id: uuidv4(),
    full_name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'USER',
    is_2fa_verified: true,
  },
  {
    _id: uuidv4(),
    full_name: 'Course Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'COURSE_ADMIN',
    is_2fa_verified: true,
  },
  {
    _id: uuidv4(),
    full_name: 'Super Admin',
    email: 'superadmin@example.com',
    password: 'password123',
    role: 'SUPER_ADMIN',
    is_2fa_verified: true,
  },
];

const courses = [
    {
        _id: uuidv4(),
        name: 'The Links at Emerald Bay',
        location: 'Coastal City',
        status: 'APPROVED',
        slope_rating: 135,
        course_rating: 72.5,
        created_by: '', // Will be filled with course admin ID
    },
    {
        _id: uuidv4(),
        name: 'Mountain View Golf Course',
        location: 'Mountain Valley',
        status: 'PENDING',
        slope_rating: 140,
        course_rating: 74.0,
        created_by: '', // Will be filled with course admin ID
    },
];

const coaches = [
    {
        _id: uuidv4(),
        full_name: 'Coach Smith',
        specialization: 'Driving',
        experience_years: 10,
        lessons: [
            {
                _id: uuidv4(),
                title: 'Introduction to Driving',
                duration_minutes: 60,
                price: 100,
            },
            {
                _id: uuidv4(),
                title: 'Advanced Driving Techniques',
                duration_minutes: 90,
                price: 150,
            },
        ],
    },
];

const caddies = [
    {
        _id: uuidv4(),
        full_name: 'Caddie Johnson',
        experience_years: 5,
        availability_slots: [new Date(Date.now() + 86400000), new Date(Date.now() + 2 * 86400000)], // Tomorrow and day after
    },
];

// Import into DB
const importData = async () => {
  try {
    await User.deleteMany();
    await Course.deleteMany();
    await TeeTime.deleteMany();
    await Coach.deleteMany();
    await Caddie.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Round.deleteMany();
    await Handicap.deleteMany();
    await AdminLog.deleteMany();

    // Hash passwords
    for (const user of users) {
      user.password_hash = await bcrypt.hash(user.password, 10);
    }

    const createdUsers = await User.insertMany(users);

    const courseAdminUser = createdUsers.find(user => user.role === 'COURSE_ADMIN');
    if (courseAdminUser) {
        courses[0].created_by = courseAdminUser._id;
        courses[1].created_by = courseAdminUser._id;
    }

    await Course.insertMany(courses);

    await Coach.insertMany(coaches);
    await Caddie.insertMany(caddies);

    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Course.deleteMany();
    await TeeTime.deleteMany();
    await Coach.deleteMany();
    await Caddie.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Round.deleteMany();
    await Handicap.deleteMany();
    await AdminLog.deleteMany();

    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
    console.log('Usage: node seed.js -i (to import data) or node seed.js -d (to delete data)');
    process.exit(0);
}
