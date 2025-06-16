import { query } from '../config/postgres';
import { NextRequest, NextResponse } from 'next/server';

const sendError = (message: string, status: number = 500) => {
  return NextResponse.json({ success: false, status, message }, { status });
};

const sendSuccess = (data: any, message: string, status: number = 200) => {
  return NextResponse.json({ success: true, status, message, data }, { status });
};

// GET all residents
export const getResidents = async () => {
  try {
    const result = await query('SELECT * FROM residents');
    return sendSuccess(result.rows, 'Residents fetched successfully');
  } catch (error) {
    console.error('Error fetching residents:', error);
    return sendError('Failed to fetch residents');
  }
};

// GET one resident
export const getOneResident = async (id: string) => {
  try {
    const result = await query('SELECT * FROM residents WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return sendError('Resident not found', 404);
    }
    return sendSuccess(result.rows[0], 'Resident fetched successfully');
  } catch (error) {
    console.error('Error fetching resident:', error);
    return sendError('Failed to fetch resident');
  }
};

// POST: Create a new resident
export const createResident = async (req: NextRequest) => {
  try {
    const {
      fullname_en,
      fullname_kh,
      dob,
      type_of_disability,
      gender,
      profile,
      start_date,
      end_date,
    } = await req.json();

    if (!fullname_en || !dob || !gender) {
      return sendError('Required fields: fullname_en, dob, gender', 400);
    }

    const result = await query(
      `INSERT INTO residents (fullname_en, fullname_kh, dob, type_of_disability, gender, profile, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [fullname_en, fullname_kh, dob, type_of_disability, gender, profile, start_date, end_date]
    );

    return sendSuccess(result.rows[0], 'Resident created successfully', 201);
  } catch (error) {
    console.error('Error creating resident:', error);
    return sendError('Failed to create resident');
  }
};

// PUT: Update resident
export const updateResident = async (req: NextRequest, id: string) => {
  try {
    const data = await req.json();
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }

    if (fields.length === 0) {
      return sendError('No fields provided to update', 400);
    }

    values.push(id);

    const result = await query(
      `UPDATE residents SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return sendError('Resident not found', 404);
    }

    return sendSuccess(result.rows[0], 'Resident updated successfully');
  } catch (error) {
    console.error('Error updating resident:', error);
    return sendError('Failed to update resident');
  }
};

// DELETE: Delete resident
export const deleteResident = async (id: string) => {
  try {
    const result = await query('DELETE FROM residents WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return sendError('Resident not found', 404);
    }

    return sendSuccess({ id }, `Resident with id ${id} deleted`);
  } catch (error) {
    console.error('Error deleting resident:', error);
    return sendError('Failed to delete resident');
  }
};
