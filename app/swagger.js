const swaggerJSDoc = require('swagger-jsdoc');

const swagger = (app) => {
  // swagger definition
  const swaggerDefinition = {
    info: {
      title: 'Obscura API Docs',
      version: '5.5.0',
      description: 'Demonstrating how to describe a RESTful API with Swagger',
    },
    host: 'localhost:3000',
    basePath: '/',
  };

  const securityDefinitions = {
    api_key: {
      type: 'apiKey',
      name: 'api_key',
      in: 'header',
    },
  };
  // options for the swagger docs
  const options = {
    // import swaggerDefinitions
    swaggerDefinition,
    securityDefinitions,
    // path to the API docs
    apis: ['./**/**/routes/*/*', './**/**/models/*'],
  };

  // initialize swagger-jsdoc
  const swaggerSpec = swaggerJSDoc(options);

  // serve swagger
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
export default swagger;
