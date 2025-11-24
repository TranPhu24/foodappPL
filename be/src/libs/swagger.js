import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Food App API",
      version: "1.0.0",
      description: "Food App API Documentation",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
      },
    ],
  },

  apis: ["./src/routes/*.js"], 
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
export const swaggerUiMiddleware = swaggerUi;
