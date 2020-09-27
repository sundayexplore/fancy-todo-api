import supertest from 'supertest';

import server from '@/app';
import { startAPI, stopAPI } from '@/utils';
import { defaultTestPort, apiVersion } from '@/config';

const request = supertest.agent(server);

let username: string;
let csrfToken: string;
let accessToken: string;
let refreshToken: string;

describe('User Model Tests', () => {
  beforeAll(async () => {
    await startAPI(server, {
      port: defaultTestPort,
      env: 'test',
    });
  });

  test('Sign Up - Success', async () => {
    const signUpData = {
      firstName: 'Jane',
      lastName: 'Doe',
      username: 'janedoe',
      email: 'jane@doe.com',
      password: '`Jane123',
    };
    const response = await request
      .post(`/${apiVersion}/users/signup`)
      .send(signUpData);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Successfully signed up!');
    expect(response.status).toBe(201);
    username = response.body.user.username;
    csrfToken = response.body.tokens.csrfToken;
    accessToken = response.body.tokens.accessToken;
    refreshToken = response.body.tokens.refreshToken;
  });

  test('Sign Up - Validation Error', async () => {
    const signUpData = {
      firstName: 'Jane',
      lastName: 'Doe',
      username: 'janedoe',
      email: 'jane',
      password: 'janedoe',
    };
    const response = await request
      .post(`/${apiVersion}/users/signup`)
      .send(signUpData);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(
      'Failed to sign up, please correct user information!',
    );
  });

  test('Sign Up - Unavailable Username', async () => {
    const signUpData = {
      firstName: 'Jane',
      lastName: 'Doe',
      username: 'janedoe',
      email: 'jane@doe.com',
      password: '`Jane123',
    };
    const response = await request
      .post(`/${apiVersion}/users/signup`)
      .send(signUpData);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(`Username isn't available.`);
  });

  test('Sign Up - Unavailable Email', async () => {
    const signUpData = {
      firstName: 'Jane',
      lastName: 'Doe',
      username: 'janedoe2',
      email: 'jane@doe.com',
      password: '`Jane123',
    };
    const response = await request
      .post(`/${apiVersion}/users/signup`)
      .send(signUpData);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(`Email isn't available.`);
  });

  test('Sign In - Success', async () => {
    const signInData = {
      userIdentifier: 'janedoe',
      password: '`Jane123',
    };
    const response = await request
      .post(`/${apiVersion}/users/signin`)
      .send(signInData);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('tokens');
    expect(response.status).toBe(200);
    username = response.body.user.username;
    csrfToken = response.body.tokens.csrfToken;
    accessToken = response.body.tokens.accessToken;
    refreshToken = response.body.tokens.refreshToken;
  });

  test('Sign In - User Not Found', async () => {
    const signInData = {
      userIdentifier: 'doejohn',
      password: '`Doejohn456',
    };
    const response = await request
      .post(`/${apiVersion}/users/signin`)
      .send(signInData);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('User not found, please sign up first!');
    expect(response.status).toBe(404);
  });

  test('Sign In - Wrong Username or Password', async () => {
    const signInData = {
      userIdentifier: 'janedoe',
      password: '`Doejohn5468468',
    };
    const response = await request
      .post(`/${apiVersion}/users/signin`)
      .send(signInData);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Wrong username or password!');
    expect(response.status).toBe(400);
  });

  test('Sign In - Validation Error', async () => {
    const signInData = {
      userIdentifier: 'janedoe',
      password: 'jane',
    };
    const response = await request
      .post(`/${apiVersion}/users/signin`)
      .send(signInData);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(
      'Failed to sign in, please correct user information!',
    );
  });

  test('Refresh User Token - Success', async () => {
    const response = await request.post(`/${apiVersion}/users/refresh`);
    expect(response.body).toHaveProperty('tokens');
    expect(response.body).toHaveProperty('message');
    expect(response.body.tokens).toHaveProperty('accessToken');
    expect(response.body.tokens).toHaveProperty('refreshToken');
    expect(response.body.message).toBe('Successfully refreshed token!');
    expect(response.status).toBe(200);
    csrfToken = response.body.tokens.csrfToken;
    accessToken = response.body.tokens.accessToken;
    refreshToken = response.body.tokens.refreshToken;
  });

  test('Refresh User Token - Refresh Token Error', async () => {
    await request.post(`/${apiVersion}/users/signout`);
    const response = await request.post(`/${apiVersion}/users/refresh`);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  test('Sign In - After Refresh Token Error', async () => {
    const signInData = {
      userIdentifier: 'janedoe',
      password: '`Jane123',
    };
    const response = await request
      .post(`/${apiVersion}/users/signin`)
      .send(signInData);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('tokens');
    expect(response.status).toBe(200);
    username = response.body.user.username;
    csrfToken = response.body.tokens.csrfToken;
    accessToken = response.body.tokens.accessToken;
    refreshToken = response.body.tokens.refreshToken;
  });

  test('Sync - Success', async () => {
    const response = await request.get(`/${apiVersion}/users/sync`);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Successfully synced!');
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('todos');
    expect(response.status).toBe(200);
  });

  test('Update User - Success', async () => {
    const updateUserData = {
      firstName: 'Jackie',
      lastName: 'Chen',
      email: 'jackiechen@jack.com',
    };
    const response = await request
      .put(`/${apiVersion}/users/${username}`)
      .send(updateUserData);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Successfully updated user!');
    expect(response.status).toBe(200);
  });

  test('Update User - Authorization Error', async () => {
    const updateUserData = {
      firstName: 'Jackie',
      lastName: 'Chen',
      email: 'jackiechen@jack.com',
    };
    const response = await request
      .put(`/${apiVersion}/users/wrongusername`)
      .send(updateUserData);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(
      'Cannot update user, invalid credentials!',
    );
  });

  test('Update User - Validation Error', async () => {
    const updateUserData = {
      firstName: 'Jackie',
      lastName: 'Chen',
      email: 'jackiechen',
    };
    const response = await request
      .put(`/${apiVersion}/users/${username}`)
      .send(updateUserData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(
      'Cannot update, please correct user information!',
    );
  });

  test('Update User - Unavailable Email', async () => {
    const updateUserData = {
      firstName: 'Jackie',
      lastName: 'Chen',
      email: 'jackiechen@jack.com',
    };
    const response = await request
      .put(`/${apiVersion}/users/${username}`)
      .send(updateUserData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(`Email isn't available.`);
  });

  test('Update Password - Success', async () => {
    const updatePasswordData = {
      password: '`Jackiechen2',
    };
    const response = await request
      .patch(`/${apiVersion}/users/${username}`)
      .send(updatePasswordData);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Successfully updated password!');
    expect(response.status).toBe(200);
  });

  test('Update Password - Authorization Error', async () => {
    const updatePasswordData = {
      password: '`Jackiechen2',
    };
    const response = await request
      .patch(`/${apiVersion}/users/wrongusername`)
      .send(updatePasswordData);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(
      'Cannot update user, invalid credentials!',
    );
  });

  test('Update Password - Validation Error', async () => {
    const updatePasswordData = {
      password: 'chen',
    };
    const response = await request
      .patch(`/${apiVersion}/users/${username}`)
      .send(updatePasswordData);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  test('Delete User - Authorization Error', async () => {
    const response = await request.delete(`/${apiVersion}/users/wrongusername`);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(
      'Cannot delete user, invalid credentials!',
    );
    expect(response.status).toBe(401);
  });

  test('Sign Out - Success', async () => {
    const response = await request.post(`/${apiVersion}/users/signout`).send({
      username,
    });
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Successfully signed out!');
    expect(response.status).toBe(200);
  });

  test('Sign Out - No Refresh Token Provided', async () => {
    const response = await request.post(`/${apiVersion}/users/signout`).send({
      username,
    });
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Successfully signed out!');
    expect(response.status).toBe(200);
  });

  afterAll(async () => {
    await stopAPI(server, {
      env: 'test',
      db: 'hold',
    });
  });
});
