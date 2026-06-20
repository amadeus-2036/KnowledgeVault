// src/utils/ApiResponse.js
// Standardizes every successful API response.
// Interview point: Consistent response shape makes the frontend API client simpler
// and makes the API self-documenting.

class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

module.exports = ApiResponse;
