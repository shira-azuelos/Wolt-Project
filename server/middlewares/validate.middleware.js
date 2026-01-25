//בדיקה שכל הנתונים תקינים
export const validateJoiSchema = function (joiSchema) {
    return (req, res, next) => {
        const { value, error } = joiSchema.validate(req.body);
        if (error) {
            next({message:error.message, status:400})
        }
        else {
            req.body = value;
            next();
        }
    };
};

