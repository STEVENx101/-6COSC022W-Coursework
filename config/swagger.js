const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Alumni Platform API",
      version: "1.0.0",
      description: "Backend API documentation for the Alumni Platform coursework"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        },
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key"
        }
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "w1234567@my.westminster.ac.uk"
            },
            password: {
              type: "string",
              example: "password123"
            }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "w1234567@my.westminster.ac.uk"
            },
            password: {
              type: "string",
              example: "password123"
            }
          }
        },
        VerifyEmailRequest: {
          type: "object",
          required: ["token"],
          properties: {
            token: {
              type: "string",
              example: "8F7A-9C3B-1A2B-4C5D"
            }
          }
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              example: "w1234567@my.westminster.ac.uk"
            }
          }
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["token", "newPassword"],
          properties: {
            token: {
              type: "string",
              example: "your_reset_token_here"
            },
            newPassword: {
              type: "string",
              example: "newpassword123"
            }
          }
        },
        ProfileRequest: {
          type: "object",
          properties: {
            full_name: { type: "string", example: "Januda Senidu" },
            bio: { type: "string", example: "Software engineering student" },
            profile_image: { type: "string", example: "profile.jpg" },
            linkedin_url: { type: "string", example: "https://www.linkedin.com/in/januda" }
          }
        },
        DegreeRequest: {
          type: "object",
          properties: {
            degree_name: { type: "string", example: "BSc Software Engineering" },
            institution: { type: "string", example: "University of Westminster" },
            year: { type: "integer", example: 2025 }
          }
        },
        CertificationRequest: {
          type: "object",
          properties: {
            title: { type: "string", example: "AWS Cloud Practitioner" },
            organization: { type: "string", example: "Amazon" },
            year: { type: "integer", example: 2025 }
          }
        },
        LicenceRequest: {
          type: "object",
          properties: {
            title: { type: "string", example: "Driving Licence" },
            issuer: { type: "string", example: "Department of Motor Traffic" },
            year: { type: "integer", example: 2024 }
          }
        },
        CourseRequest: {
          type: "object",
          properties: {
            course_name: { type: "string", example: "Node.js Fundamentals" },
            provider: { type: "string", example: "Coursera" },
            year: { type: "integer", example: 2025 }
          }
        },
        EmploymentRequest: {
          type: "object",
          properties: {
            company: { type: "string", example: "Fintrex" },
            role: { type: "string", example: "Software Developer" },
            start_date: { type: "string", format: "date", example: "2025-01-01" },
            end_date: { type: "string", format: "date", example: "2026-01-01" }
          }
        },
        BidRequest: {
          type: "object",
          required: ["bid_amount", "bid_date"],
          properties: {
            bid_amount: { type: "number", example: 1500.0 },
            bid_date: { type: "string", format: "date", example: "2026-04-05" },
            slot_date: { type: "string", format: "date", example: "2026-04-06" }
          }
        },
        BidUpdateRequest: {
          type: "object",
          properties: {
            bid_amount: { type: "number", example: 1800.0 },
            bid_date: { type: "string", format: "date", example: "2026-04-05" },
            slot_date: { type: "string", format: "date", example: "2026-04-06" },
            status: {
              type: "string",
              enum: ["PENDING", "WON", "LOST"],
              example: "PENDING"
            }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, "../routes/*.js")]
};

module.exports = swaggerJSDoc(options);