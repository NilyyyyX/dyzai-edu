import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database';
import { generateToken } from '../utils/jwt';
import { registerSchema, loginSchema, studentSchema } from '../utils/validators';

export async function register(req: Request, res: Response) {
  const db = await getDb();
  const data = registerSchema.parse(req.body);

  const existing = db.data.users.find(u => u.phone === data.phone);
  if (existing) {
    res.status(409).json({ error: 'Phone number already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = {
    id: db.data.users.length + 1,
    phone: data.phone,
    password_hash: passwordHash,
    role: 'parent' as const,
    nickname: data.nickname || data.phone,
    avatar_url: null as string | null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.data.users.push(user);
  await db.write();

  const token = generateToken({ userId: user.id, role: user.role });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
    },
  });
}

export async function login(req: Request, res: Response) {
  const db = await getDb();
  const data = loginSchema.parse(req.body);

  const user = db.data.users.find(u => u.phone === data.phone);
  if (!user) {
    res.status(401).json({ error: 'Invalid phone or password' });
    return;
  }

  const valid = await bcrypt.compare(data.password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid phone or password' });
    return;
  }

  const token = generateToken({ userId: user.id, role: user.role });

  res.json({
    token,
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
    },
  });
}

export async function registerStudent(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;
  const data = studentSchema.parse(req.body);

  const user = {
    id: db.data.users.length + 1,
    phone: `student_${Date.now()}`,
    password_hash: await bcrypt.hash('123456', 10),
    role: 'student' as const,
    nickname: data.name,
    avatar_url: null as string | null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.data.users.push(user);

  const student = {
    id: db.data.students.length + 1,
    user_id: user.id,
    parent_id: userId,
    name: data.name,
    grade: data.grade,
    school: data.school || null,
    created_at: new Date().toISOString(),
  };
  db.data.students.push(student);
  await db.write();

  const token = generateToken({ userId: user.id, role: user.role });

  res.status(201).json({
    token,
    user: { id: user.id, phone: user.phone, role: user.role, nickname: user.nickname },
    student,
  });
}

export async function me(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;

  const user = db.data.users.find(u => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    id: user.id,
    phone: user.phone,
    role: user.role,
    nickname: user.nickname,
    avatar_url: user.avatar_url,
  });
}
