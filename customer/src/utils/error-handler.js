const { createLogger, transports } = require('winston');
const { AppError } = require('./app-errors');

const LogErrors = createLogger({
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app_error.log' })
    ]
});

class ErrorLogger {
    async logError(err) {
        console.log('========== Start Error Logger ==========');
        LogErrors.log({
            private: true,
            level: 'error',
            message: `${new Date()} - ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`
        });
        console.log('========== End Error Logger ==========');
        return false;
    }

    isTrustError(error) {
        return error instanceof AppError && error.isOperational;
    }
}

const ErrorHandler = async (err, req, res, next) => {
    const errorLogger = new ErrorLogger();

    await errorLogger.logError(err);

    const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';

    if (errorLogger.isTrustError(err)) {
        return res.status(statusCode).json({
            message: err.errorStack || message
        });
    }

    // For unexpected or system errors
    return res.status(statusCode).json({
        message
    });
};

module.exports = ErrorHandler;
