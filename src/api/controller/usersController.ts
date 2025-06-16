import { query } from '../config/postgres';
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
const JWT_SECRET = process.env.JWT_SECRET!;

// GET all users
export const getUsers = async () => {
  try {
    const result = await query('SELECT id, username, email, active, role, profile FROM users');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
};

export async function loginUser(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const result = await query(
      `SELECT id, email, password, role FROM users WHERE email = $1 AND password = $2`,
      [email, password]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = result.rows[0];

    const jwt = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(JWT_SECRET));

    const response = NextResponse.json({
      success: true,
      token: jwt,
      user: { id: user.id, role: user.role },
    });

    response.cookies.set('token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

// POST: Create a new user

export const createUser = async (req: NextRequest) => {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'username, email, and password are required' },
        { status: 400 }
      );
    }

    // Insert new user into the database
    const result = await query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, active, role, profile`,
      [username, email, password]
    );

    const user = result.rows[0];

    // Generate JWT
    const jwt = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Prepare response with user data and token
    const res = NextResponse.json({ user, jwt });

    // Set JWT as HTTP-only cookie
    res.cookies.set('token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return res;
  } catch (error: any) {
    console.error('Error creating user:', error);

    if (error.code === '23505') {
      // Unique violation (email already exists)
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
};

// PUT: Update an existing user by ID
export const updateUser = async (req: NextRequest, userId: string) => {
  try {
    const { username, email, password, active, role, profile } = await req.json();

    // Construct dynamic update query parts for optional fields
    const fields = [];
    const values = [];
    let idx = 1;

    if (username !== undefined) {
      fields.push(`username = $${idx++}`);
      values.push(username);
    }
    if (email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(email);
    }
    if (password !== undefined) {
      fields.push(`password = $${idx++}`);
      values.push(password);
    }
    if (active !== undefined) {
      fields.push(`active = $${idx++}`);
      values.push(active);
    }
    if (role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(role);
    }
    if (profile !== undefined) {
      fields.push(`profile = $${idx++}`);
      values.push(profile);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields provided to update' }, { status: 400 });
    }

    // Add userId as last parameter
    values.push(userId);

    const queryText = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, username, email, active, role, profile`;
    const result = await query(queryText, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
};

// DELETE: Delete user by ID
export const deleteUser = async (userId: string) => {
  try {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: `User with id ${userId} deleted` });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
};

// GET: Get one user by ID
export const getOneUser = async (id: string) => {
    try {
      const result = await query(
        'SELECT id, username, email, active, role, profile FROM users WHERE id = $1',
        [id]
      );
  
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      return NextResponse.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
  };
  