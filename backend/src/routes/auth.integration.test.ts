// requiere migración previa de "securebank_test"
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import app from '../app';
import { resetDatabase, seedTenantWithAdmin, closePool, TEST_PASSWORD } from '../test/integrationSetup';

describe('POST /api/auth/login (integración HU-02, HU-14)', () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
  
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('devuelve 200 con token y usuario cuando las credenciales son correctas', async () => {
    const { email } = await seedTenantWithAdmin();

    const res = await request(app).post('/api/auth/login').send({ email, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe(email);
    // El envelope nunca debe filtrar el hash de la contraseña.
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('devuelve 401 con contraseña incorrecta', async () => {
    const { email } = await seedTenantWithAdmin();

    const res = await request(app).post('/api/auth/login').send({ email, password: 'clave-incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('devuelve 422 cuando el correo no tiene formato válido', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'no-es-un-correo', password: 'algo' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('HU-14: bloquea la cuenta con 423 tras 5 intentos fallidos reales seguidos', async () => {
    const { email } = await seedTenantWithAdmin();

    for (let i = 0; i < 4; i++) {
      const res = await request(app).post('/api/auth/login').send({ email, password: 'mala' });
      expect(res.status).toBe(401);
    }

    const fifth = await request(app).post('/api/auth/login').send({ email, password: 'mala' });
    expect(fifth.status).toBe(423);
    expect(fifth.body.error.code).toBe('ACCOUNT_LOCKED');

    // Intento #6, incluso con la contraseña correcta, debe seguir bloqueado
    const sixth = await request(app).post('/api/auth/login').send({ email, password: TEST_PASSWORD });
    expect(sixth.status).toBe(423);
  });

  it('GET /api/auth/me requiere token válido (401 sin Authorization)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me devuelve el usuario autenticado con un token válido', async () => {
    const { email } = await seedTenantWithAdmin();
    const login = await request(app).post('/api/auth/login').send({ email, password: TEST_PASSWORD });
    const token = login.body.data.token;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
  });
});

describe('POST /api/roles (integración HU-04, RBAC end-to-end)', () => {
  afterAll(async () => {
    await closePool();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('crea un rol nuevo cuando el usuario autenticado tiene permiso roles:write', async () => {
    const { email } = await seedTenantWithAdmin();
    const login = await request(app).post('/api/auth/login').send({ email, password: TEST_PASSWORD });
    const token = login.body.data.token;

    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Auditor', permissions: ['audit:read'] });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Auditor');
  });

  it('rechaza con 401 la creación de rol sin token', async () => {
    const res = await request(app).post('/api/roles').send({ name: 'Auditor', permissions: ['audit:read'] });
    expect(res.status).toBe(401);
  });

  it('rechaza con 422 un rol sin permisos seleccionados', async () => {
    const { email } = await seedTenantWithAdmin();
    const login = await request(app).post('/api/auth/login').send({ email, password: TEST_PASSWORD });
    const token = login.body.data.token;

    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Auditor', permissions: [] });

    expect(res.status).toBe(422);
  });
});
