const express = require('express');
const connectDB = require('./config/db');

const app = express();

// connect db
connectDB();

// Init Middleware
app.use(express.json({extended:false}));

app.get('/', (req, res)=> res.send('API running'));

// Define route:
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/profile', require('./routes/profile'));

const port = process.env.port||5000;

app.listen(port,()=>console.log(`Server is running at port: ${port}`));
