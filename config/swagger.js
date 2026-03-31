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
        }
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "test@westminster.ac.uk"
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
              example: "test@westminster.ac.uk"
            },
            password: {
              type: "string",
              example: "password123"
            }
          }
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              example: "test@westminster.ac.uk"
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
            full_name: {
              type: "string",
              example: "Januda Senidu"
            },
            bio: {
              type: "string",
              example: "Software engineering student and backend developer"
            },
            profile_image: {
              type: "string",
              example: "profile.jpg"
            }
          }
        },
        BidRequest: {
          type: "object",
          required: ["bid_amount", "bid_date"],
          properties: {
            bid_amount: {
              type: "number",
              example: 1500.0
            },
            bid_date: {
              type: "string",
              format: "date",
              example: "2026-03-30"
            }
          }
        },
        BidUpdateRequest: {
          type: "object",
          properties: {
            bid_amount: {
              type: "number",
              example: 1800.0
            },
            bid_date: {
              type: "string",
              format: "date",
              example: "2026-03-31"
            },
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
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;