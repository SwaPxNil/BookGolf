const morgan = require('morgan');
const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./utils/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


// Mount routers

app.use('/api/auth', require('./routes/auth'));

app.use('/api/courses', require('./routes/course'));

app.use('/api/tee-times', require('./routes/teeTime'));

const { coachRouter, coachLessonRouter } = require('./routes/coach');

app.use('/api/coaches', coachRouter);

app.use('/api/coach-lessons', coachLessonRouter);

const { caddieRouter, caddieBookingRouter } = require('./routes/caddie');

app.use('/api/caddies', caddieRouter);

app.use('/api/caddies', caddieBookingRouter);
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/rounds', require('./routes/round'));
app.use('/api/handicap', require('./routes/handicap'));
app.use('/api/admin-logs', require('./routes/adminLog'));
app.use('/api/super-admin', require('./routes/superAdmin'));
app.use('/api/dashboard', require('./routes/dashboard'));



const errorHandler = require('./middlewares/error');

app.use(errorHandler);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
