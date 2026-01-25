import multer from 'multer';
//דף שגיאות

export const errorHandler = (err, req, res, next) => {
    //שגיאות בתמונות
    if (err instanceof multer.MulterError) {
        console.error('Multer Error Caught:', err.code); 
        let message = 'שגיאה כללית בהעלאת קובץ.';
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'נשלח שדה קובץ לא צפוי. בדוק ששם השדה הוא imageP.';
        } else if (err.code === 'LIMIT_FILE_SIZE') {
             message = 'גודל הקובץ חורג מהמגבלה המותרת.';
        }
         return res.status(400).json({ 
            error: 'File Upload Error',
            message: message
        });
    }

      //שגיאות אימות 
    if (err.isJoi) {
        return res.status(400).json({ 
            error: 'Validation Error',
            details: err.details.map(d => d.message)
        });
    }

    //שגיאות התנגשות
    if (err.code === 11000) {
        return res.status(409).json({
            error: 'Conflict',
            message: 'An item with this value already exists.'
        });
    }
    //שגיאות מסד נתונים
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Mongoose Validation Error',
            details: Object.values(err.errors).map(e => e.message)
        });
    }
    //שגיאת שרת פנימית
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });

     // טיפול בשגיאות כלליות
     console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: err.message
    });
};
