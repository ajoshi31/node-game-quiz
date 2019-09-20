const Response = {

  general(data) {
    return data;
  },
  error(code, message, description) {
    return {
      code: code || 400,
      message: message || 'some error occoured',
      description: description || 'error occoured on server, please try again after some time.',
    };
  },
  authError() {
    return Response.error(
      403,
      'authentication error',
      'no authentication token provided, please login first and provide the authentication token.',
    );
  },
  emptyContent() {
    return Response.general({
      code: 402,
      message: 'empty content found',
      description: 'you must provide valid data and it must not be empty.',
      helpful_links: ['http://stackoverflow.com/questions/18419428/what-is-the-minimum-valid-json'],
    });
  },
  invalidContentType() {
    return Response.general({
      code: 400,
      message: 'invalid content type',
      description: 'you must specify content type and it must be application/json',
      helpful_links: ['http://stackoverflow.com/questions/477816/what-is-the-correct-json-content-type'],
    });
  },
  routeNotFound() {
    return Response.error(
      405,
      'resource not found',
      'the resource your tried to access doesn\'t exist or you dont have permissions to access it.',
    );
  },
  userNotFound() {
    return Response.error(
      400,
      'user not found',
      "the user you're looking for doesn't exist or you dont have permissions to access it.",
    );
  },
  updateErrorOccoured(error) {
    return Response.error(
      301,
      'error occoured',
      error || 'error occoured while updating your data.',
    );
  },
  success(description, data = null) {
    return {
      code: 200,
      message: 'success',
      description: description || 'data successfully saved',
    };
  },
};

export default Response;
