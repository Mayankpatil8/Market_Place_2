const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();


app.use(cors({
  origin: [
    "https://marketplace1.netlify.app",
    "https://market-place-2-iga4.onrender.com",
    "http://localhost:3000"
  ],
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/suggestions', require('./routes/suggestions'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/certifications', require('./routes/certifications'));
app.use('/api/consulting', require('./routes/consulting'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', version: '2.0.0', timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://patilmayank2003_db_user:5PUi9F6n7J4xZnIf@cluster0.jobxuv5.mongodb.net/')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  })
  .catch(err => { console.error('❌ DB Error:', err.message); process.exit(1); });
