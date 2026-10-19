import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import router from './routes/solution.routes.js';
 
const PORT = 3000;
const app = express();

app.use(cors())
app.use(express.json());
app.use('/api', router);


app.get('/', (req, res) => {
    res.json({
        message: "Solution Finder API is running!"
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})